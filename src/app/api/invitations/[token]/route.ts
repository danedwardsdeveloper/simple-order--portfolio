import {
	apiPaths,
	basicMessages,
	cookieDurations,
	cookieNames,
	http409conflict,
	http422unprocessableContent,
	userMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { invitations, relationships, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import logger from '@/library/logger'
import { createMerchantSlug, sanitiseDangerousBaseUser, validateUuid } from '@/library/utilities/public'
import { and, createCookieWithToken, equals, initialiseResponder } from '@/library/utilities/server'
import type {
	BaseUserInsertValues,
	BrowserSafeCompositeUser,
	BrowserSafeMerchantProfile,
	DangerousBaseUser,
	Invitation,
	InvitedCustomerBrowserInputValues,
	RelationshipJoinRow,
	UserMessages,
} from '@/types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export type InvitationsTokenPATCHbody = InvitedCustomerBrowserInputValues

// PATCH accept an invitation (creates a relationship)
// Ask for more details if user is new to the site
// Sign the user in
// ToDo: use a discriminated union
export interface InvitationsTokenPATCHresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	pleaseProvideDetails?: boolean
	createdUser?: BrowserSafeCompositeUser
	existingUser?: BrowserSafeCompositeUser
	senderDetails?: BrowserSafeMerchantProfile
}

type Output = Promise<NextResponse<InvitationsTokenPATCHresponse>>

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ token: string }> }): Output {
	const respond = initialiseResponder<InvitationsTokenPATCHresponse>()

	const cookieStore = await cookies()
	const token = (await params).token

	if (!token) {
		return respond({
			status: 400,
			developmentMessage: 'Search param token missing',
		})
	}

	let txError: { message: string; status: number } | undefined = { message: 'unknown transaction error', status: 503 }

	const partialDetailsProvided = undefined
	const allDetailsProvided = undefined

	const { firstName, lastName, businessName, password } = await request.json()

	if (partialDetailsProvided) {
		return respond({
			status: 400,
			developmentMessage: 'Not enough details to create new account',
		})
	}

	if (!validateUuid(token)) {
		return respond({
			body: { userMessage: userMessages.emailConfirmationTokenInvalid },
			status: 400,
			developmentMessage: 'search param token invalid',
		})
	}

	const [foundInvitation]: Invitation[] = await database.select().from(invitations).where(equals(invitations.token, token)).limit(1)

	if (!foundInvitation) {
		return respond({
			status: 400,
			developmentMessage: 'invitation row not found',
		})
	}

	const [foundDangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.email, foundInvitation.email))

	const [foundSenderProfile]: DangerousBaseUser[] = await database
		.select()
		.from(users)
		.where(equals(users.id, foundInvitation.senderUserId))

	const senderDetails: BrowserSafeMerchantProfile = {
		slug: foundSenderProfile.slug,
		businessName: foundSenderProfile.businessName,
	}

	if (foundDangerousUser) {
		const [existingRelationship] = await database
			.select()
			.from(relationships)
			.where(and(equals(relationships.merchantId, foundSenderProfile.id), equals(relationships.customerId, foundDangerousUser.id)))

		if (existingRelationship) {
			return respond({
				body: { senderDetails: foundSenderProfile },
				status: http409conflict,
				developmentMessage: 'relationship exists',
			})
		}
	}

	try {
		if (foundDangerousUser) {
			await database.transaction(async (tx) => {
				txError = {
					message: 'transaction error creating relationships',
					status: http409conflict,
				}
				const newRelationshipInsert: RelationshipJoinRow = {
					merchantId: foundInvitation.senderUserId,
					customerId: foundDangerousUser.id,
				}
				await tx.insert(relationships).values(newRelationshipInsert).returning()

				// Transaction: change user table emailConfirmed to true if not already
				txError.message = 'transaction error ensuring emailConfirmed on existing user is set to true'
				await tx.update(users).set({ emailConfirmed: true }).where(equals(users.id, foundDangerousUser.id))

				// Transaction: Expire the invitation
				txError.message = 'error expiring invitation'
				await tx
					.update(invitations)
					.set({ usedAt: new Date() })
					.where(and(equals(invitations.senderUserId, foundInvitation.senderUserId), equals(invitations.token, token)))

				txError = undefined
			})

			// Create cookie if it wasn't provided
			const existingTokenCookie = cookieStore.get(cookieNames.token)
			if (!existingTokenCookie) {
				cookieStore.set(createCookieWithToken(foundDangerousUser.id, cookieDurations.oneYear))
			}

			logger.info(`PATCH ${apiPaths.invitations.accept}: existing user found, relationship created`)

			const { userRole } = await getUserRoles(foundDangerousUser)

			const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(foundDangerousUser.id)

			const existingUser: BrowserSafeCompositeUser = {
				...sanitiseDangerousBaseUser(foundDangerousUser),
				roles: userRole,
				activeSubscriptionOrTrial,
			}

			return NextResponse.json({ message: basicMessages.success, senderDetails, existingUser }, { status: 201 })
		}

		if (!foundDangerousUser && !allDetailsProvided) {
			return respond({
				body: { pleaseProvideDetails: true },
				status: http422unprocessableContent,
				developmentMessage: 'please provide details',
			})
		}

		if (!foundDangerousUser && allDetailsProvided) {
			const { createdUser } = await database.transaction(async (tx) => {
				// Transaction: Create user
				const saltRounds = 10
				const hashedPassword = await bcrypt.hash(password, saltRounds)

				const newUserInsertValues: BaseUserInsertValues = {
					email: foundInvitation.email,
					firstName,
					lastName,
					businessName,
					// ToDo: add multiple attempts
					slug: createMerchantSlug(businessName),
					hashedPassword,
					emailConfirmed: true, // They've just clicked a link from an email!
					cachedTrialExpired: false, // They haven't started a trial, and they're just a customer at this point
				}

				txError = {
					message: 'transaction error creating new user',
					status: 503,
				}

				// Create new user
				const [createdUser]: DangerousBaseUser[] | undefined = await tx.insert(users).values(newUserInsertValues).returning()

				// Create relationship
				txError.message = 'transaction error creating relationship join row'
				const newRelationshipInsert: RelationshipJoinRow = {
					merchantId: foundInvitation.senderUserId,
					customerId: createdUser.id,
				}
				await tx.insert(relationships).values(newRelationshipInsert).returning()

				// Transaction: Delete invitation
				txError.message = 'transaction error deleting invitation'
				await tx
					.delete(invitations)
					.where(and(equals(invitations.senderUserId, foundInvitation.senderUserId), equals(invitations.token, token)))

				// Transaction: Send welcome email
				// Optimisation ToDo: write a much better email
				const emailContent = `Hello ${createdUser.firstName}, thank you for signing up to Simple Order.`

				txError.message = 'transaction error sending welcome email'
				const emailSuccess = await sendEmail({
					recipientEmail: foundInvitation.email,
					subject: 'Thank you for using Simple Order',
					htmlVersion: emailContent,
					textVersion: emailContent,
				})

				if (!emailSuccess) tx.rollback()

				txError = undefined
				return { createdUser }
			})

			cookieStore.set(createCookieWithToken(createdUser.id, cookieDurations.oneYear))

			const compositeUser: BrowserSafeCompositeUser = {
				...createdUser,
				roles: 'customer',
				activeSubscriptionOrTrial: false, // This is a new customer-only, so they don't have a subscription but can still use the site to make orders
			}

			logger.info(`PATCH ${apiPaths.invitations.accept}: created new user: `, compositeUser)
			return NextResponse.json({ message: basicMessages.success, createdUser: compositeUser, senderDetails }, { status: 200 })
		}

		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			developmentMessage: txError.message || 'unknown server error',
			caughtError,
		})
	}
}
