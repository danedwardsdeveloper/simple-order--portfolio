import { apiPaths, basicMessages, cookieDurations, cookieNames, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { invitations, relationships, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import logger from '@/library/logger'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'
import type {
	BaseUserInsertValues,
	BrowserSafeCompositeUser,
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

export type InvitationsTokenPOSTbody = InvitedCustomerBrowserInputValues

// PATCH accept an invitation
// Ask for more details if user is new to the site
// Sign the user in
// Urgent ToDo: This doesn't work!
export interface InvitationsTokenPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| 'missing fields'
		| TokenMessages
		| 'invitation not found'
		| 'please provide details'
	createdUser?: BrowserSafeCompositeUser
	senderBusinessName?: string
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ token: string }> },
): Promise<NextResponse<InvitationsTokenPOSTresponse>> {
	const cookieStore = await cookies()

	let transactionErrorMessage = null
	let transactionErrorCode = null

	try {
		const { firstName, lastName, businessName, password, staySignedIn }: InvitationsTokenPOSTbody = await request.json()
		logger.debug(firstName, lastName, businessName, password, staySignedIn)

		const allDetailsProvided = Boolean(firstName && lastName && businessName && password)
		const partialDetailsProvided = Boolean(firstName || lastName || businessName || password) && !allDetailsProvided

		if (partialDetailsProvided) {
			logger.info('Not enough details provided to create new account')
			// ToDo: make this more specific
			return NextResponse.json({ message: 'missing fields' }, { status: httpStatus.http400badRequest })
		}

		const token = (await params).token

		if (!token) {
			return NextResponse.json({ message: tokenMessages.tokenMissing }, { status: httpStatus.http400badRequest })
		}

		if (!validate(token)) {
			return NextResponse.json({ message: tokenMessages.tokenInvalid }, { status: httpStatus.http400badRequest })
		}

		const [foundInvitation]: Invitation[] = await database.select().from(invitations).where(eq(invitations.token, token)).limit(1)

		if (!foundInvitation) {
			return NextResponse.json({ message: 'invitation not found' }, { status: httpStatus.http400badRequest })
		}

		const recipientEmail = foundInvitation.email

		const [existingUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.email, recipientEmail))

		const [senderDetails]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.id, foundInvitation.senderUserId))

		const senderBusinessName = senderDetails.businessName

		if (existingUser) {
			await database.transaction(async (tx) => {
				// Transaction: Create the relationship
				transactionErrorMessage = 'transaction error creating relationships'
				const newRelationshipInsert: RelationshipJoinRow = {
					merchantId: foundInvitation.senderUserId,
					customerId: existingUser.id,
				}
				await tx.insert(relationships).values(newRelationshipInsert).returning()

				// Transaction: change user table emailConfirmed to true if not already
				transactionErrorMessage = 'transaction error ensuring emailConfirmed on existing user is set to true'
				await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, existingUser.id))

				// Transaction: Delete invitation
				transactionErrorMessage = 'error '
				transactionErrorCode = null
				await tx.delete(invitations).where(and(eq(invitations.senderUserId, foundInvitation.senderUserId), eq(invitations.token, token)))

				transactionErrorMessage = null
				transactionErrorCode = null
			})

			// Create cookie if it wasn't provided
			const existingTokenCookie = cookieStore.get(cookieNames.token)
			if (!existingTokenCookie) {
				cookieStore.set(createSessionCookieWithToken(existingUser.id))
			}

			// - Return 201 with merchant details
			return NextResponse.json({ message: basicMessages.success, senderBusinessName }, { status: httpStatus.http201created })
		}

		if (!existingUser && !allDetailsProvided) {
			logger.info('Existing user not found & no details provided to create new account')
			return NextResponse.json({ message: 'please provide details' }, { status: httpStatus.http422unprocessableContent })
		}

		if (!existingUser && allDetailsProvided) {
			const { createdUser } = await database.transaction(async (tx) => {
				// Transaction: Create user
				const saltRounds = 10
				const hashedPassword = await bcrypt.hash(password, saltRounds)

				const newUserInsertValues: BaseUserInsertValues = {
					email: recipientEmail,
					firstName,
					lastName,
					businessName,
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
					recipientEmail,
					subject: 'Thank you for using Simple Order',
					htmlVersion: emailContent,
					textVersion: emailContent,
				})

				if (!emailSuccess) {
					tx.rollback()
				}

				transactionErrorMessage = null
				transactionErrorCode = null
				return { createdUser }
			})

			if (staySignedIn) {
				cookieStore.set(createCookieWithToken(createdUser.id, cookieDurations.oneYear))
			} else {
				cookieStore.set(createSessionCookieWithToken(createdUser.id))
			}

			const compositeUser: BrowserSafeCompositeUser = {
				...createdUser,
				roles: 'customer',
				accountActive: false, // This is a new customer-only, so they don't have a subscription but can still use the site to make orders
			}

			return NextResponse.json(
				{ message: basicMessages.success, createdUser: compositeUser, senderBusinessName },
				{ status: httpStatus.http200ok },
			)
		}

		// Neither new nor existing users should reach this return
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	} catch (error) {
		logger.error(`PATCH ${apiPaths.invitations.accept} error`, error)
		return NextResponse.json(
			{ message: transactionErrorMessage || basicMessages.serverError },
			{ status: transactionErrorCode || httpStatus.http500serverError },
		)
	}
}
