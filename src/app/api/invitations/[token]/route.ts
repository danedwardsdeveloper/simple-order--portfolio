import { apiPaths, basicMessages, cookieDurations, cookieNames, httpStatus, relationshipMessages, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { invitations, relationships, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import logger from '@/library/logger'
import { createMerchantSlug, sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken } from '@/library/utilities/server'
import type {
	BaseUserInsertValues,
	BrowserSafeCompositeUser,
	BrowserSafeMerchantProfile,
	DangerousBaseUser,
	Invitation,
	InvitedCustomerBrowserInputValues,
	RelationshipJoinRow,
	TokenMessages,
} from '@/types'
import bcrypt from 'bcryptjs'
import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { validate } from 'uuid'

export type InvitationsTokenPATCHbody = InvitedCustomerBrowserInputValues

// PATCH accept an invitation (creates a relationship)
// Ask for more details if user is new to the site
// Sign the user in
export interface InvitationsTokenPATCHresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof relationshipMessages.relationshipExists
		| 'missing fields'
		| TokenMessages
		| 'invitation not found'
		| 'please provide details'
	createdUser?: BrowserSafeCompositeUser
	existingUser?: BrowserSafeCompositeUser
	senderDetails?: BrowserSafeMerchantProfile
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ token: string }> },
): Promise<NextResponse<InvitationsTokenPATCHresponse>> {
	const cookieStore = await cookies()

	let transactionErrorMessage = undefined
	let transactionErrorCode = undefined

	const partialDetailsProvided = undefined
	const allDetailsProvided = undefined

	let firstName = undefined
	let lastName = undefined
	let businessName = undefined
	let password = undefined

	// Parse the body conditionally
	// Calling request.json() on an empty body throws an error
	if (request.headers.get('content-length') !== '0' && request.headers.get('content-type')?.includes('application/json')) {
		const body = await request.json()
		firstName = body.firstName
		lastName = body.lastName
		businessName = body.businessName
		password = body.password
	}

	if (partialDetailsProvided) {
		logger.info('Not enough details provided to create new account')
		// ToDo: make this more specific
		return NextResponse.json({ message: 'missing fields' }, { status: httpStatus.http400badRequest })
	}

	const token = (await params).token

	if (!token) {
		logger.warn(`${apiPaths.invitations.accept}: token missing`)
		return NextResponse.json({ message: tokenMessages.tokenMissing }, { status: httpStatus.http400badRequest })
	}

	if (!validate(token)) {
		return NextResponse.json({ message: tokenMessages.tokenInvalid }, { status: httpStatus.http400badRequest })
	}

	const [foundInvitation]: Invitation[] = await database.select().from(invitations).where(eq(invitations.token, token)).limit(1)

	if (!foundInvitation) {
		logger.warn(`PATCH ${apiPaths.invitations.accept}: invitation row not found at all`)
		return NextResponse.json({ message: 'invitation not found' }, { status: httpStatus.http400badRequest })
	}

	const [foundDangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.email, foundInvitation.email))

	const [foundSenderProfile]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.id, foundInvitation.senderUserId))

	const senderDetails: BrowserSafeMerchantProfile = {
		slug: foundSenderProfile.slug,
		businessName: foundSenderProfile.businessName,
	}

	if (foundDangerousUser) {
		const [existingRelationship] = await database
			.select()
			.from(relationships)
			.where(and(eq(relationships.merchantId, foundSenderProfile.id), eq(relationships.customerId, foundDangerousUser.id)))

		if (existingRelationship) {
			return NextResponse.json(
				{ message: relationshipMessages.relationshipExists, foundSenderProfile },
				{ status: httpStatus.http409conflict },
			)
		}
	}

	try {
		if (foundDangerousUser) {
			await database.transaction(async (tx) => {
				// Transaction: Create the relationship
				transactionErrorMessage = 'transaction error creating relationships'
				transactionErrorCode = httpStatus.http409conflict
				const newRelationshipInsert: RelationshipJoinRow = {
					merchantId: foundInvitation.senderUserId,
					customerId: foundDangerousUser.id,
				}
				await tx.insert(relationships).values(newRelationshipInsert).returning()

				// Transaction: change user table emailConfirmed to true if not already
				transactionErrorMessage = 'transaction error ensuring emailConfirmed on existing user is set to true'
				await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, foundDangerousUser.id))

				// Transaction: Expire the invitation
				transactionErrorMessage = 'error expiring invitation'
				await tx
					.update(invitations)
					.set({ usedAt: new Date() })
					.where(and(eq(invitations.senderUserId, foundInvitation.senderUserId), eq(invitations.token, token)))

				transactionErrorMessage = null
				transactionErrorCode = null
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

			return NextResponse.json({ message: basicMessages.success, senderDetails, existingUser }, { status: httpStatus.http201created })
		}

		if (!foundDangerousUser && !allDetailsProvided) {
			logger.info('Existing user not found & no details provided to create new account')
			return NextResponse.json({ message: 'please provide details' }, { status: httpStatus.http422unprocessableContent })
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
					// ToDo: add multiple attempts!
					slug: createMerchantSlug(businessName),
					hashedPassword,
					emailConfirmed: true, // They've just clicked a link from an email!
					cachedTrialExpired: false, // They haven't started a trial, and they're just a customer at this point
				}

				transactionErrorMessage = 'transaction error creating new user'
				transactionErrorCode = httpStatus.http503serviceUnavailable

				// Create new user
				const [createdUser]: DangerousBaseUser[] | undefined = await tx.insert(users).values(newUserInsertValues).returning()

				// Create relationship
				transactionErrorMessage = 'transaction error creating relationship join row'
				const newRelationshipInsert: RelationshipJoinRow = {
					merchantId: foundInvitation.senderUserId,
					customerId: createdUser.id,
				}
				await tx.insert(relationships).values(newRelationshipInsert).returning()

				// Transaction: Delete invitation
				transactionErrorMessage = 'transaction error deleting invitation'
				await tx.delete(invitations).where(and(eq(invitations.senderUserId, foundInvitation.senderUserId), eq(invitations.token, token)))

				// Transaction: Send welcome email
				// Optimisation ToDo: write a much better email
				const emailContent = `Hello ${createdUser.firstName}, thank you for signing up to Simple Order.`

				transactionErrorMessage = 'transaction error sending welcome email'
				const emailSuccess = await sendEmail({
					recipientEmail: foundInvitation.email,
					subject: 'Thank you for using Simple Order',
					htmlVersion: emailContent,
					textVersion: emailContent,
				})

				if (!emailSuccess) tx.rollback()

				transactionErrorMessage = null
				transactionErrorCode = null
				return { createdUser }
			})

			cookieStore.set(createCookieWithToken(createdUser.id, cookieDurations.oneYear))

			const compositeUser: BrowserSafeCompositeUser = {
				...createdUser,
				roles: 'customer',
				activeSubscriptionOrTrial: false, // This is a new customer-only, so they don't have a subscription but can still use the site to make orders
			}

			logger.info(`PATCH ${apiPaths.invitations.accept}: created new user: `, compositeUser)
			return NextResponse.json(
				{ message: basicMessages.success, createdUser: compositeUser, senderDetails },
				{ status: httpStatus.http200ok },
			)
		}

		// Neither new nor existing users should reach this return
		logger.error(`PATCH ${apiPaths.invitations.accept}: reached the end of the route handler without successful early return.`)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	} catch (error) {
		logger.error(`PATCH ${apiPaths.invitations.accept} error`, error)
		return NextResponse.json(
			{ message: transactionErrorMessage || basicMessages.serverError },
			{ status: transactionErrorCode || httpStatus.http500serverError },
		)
	}
}
