import { authenticationMessages, basicMessages, cookieDurations, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { customerToMerchant, invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import logger from '@/library/logger'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'
import type {
	AuthenticationMessages,
	BaseUserInsertValues,
	BasicMessages,
	CustomerToMerchant,
	DangerousBaseUser,
	Invitation,
	InvitedCustomerBrowserInputValues,
} from '@/types'
import bcrypt from 'bcryptjs'
import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { validate } from 'uuid'

export type InvitationsAcceptPOSTbody = InvitedCustomerBrowserInputValues

export interface InvitationsAcceptPOSTresponse {
	message: BasicMessages | AuthenticationMessages | string // ToDo: make strict
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ token: string }> },
): Promise<NextResponse<InvitationsAcceptPOSTresponse>> {
	try {
		const { firstName, lastName, businessName, password, staySignedIn }: InvitationsAcceptPOSTbody = await request.json()
		logger.debug(firstName, lastName, businessName, password, staySignedIn)

		const allDetailsProvided = Boolean(firstName && lastName && businessName && password)
		const partialDetailsProvided = Boolean(firstName || lastName || businessName || password) && !allDetailsProvided

		// Reject requests that have some but not all fields
		if (partialDetailsProvided) {
			return NextResponse.json({ message: 'missing fields' }, { status: httpStatus.http400badRequest })
		}

		const token = (await params).token

		if (!token) {
			return NextResponse.json({ message: authenticationMessages.tokenMissing }, { status: httpStatus.http400badRequest })
		}

		if (!validate(token)) {
			return NextResponse.json({ message: authenticationMessages.tokenInvalid }, { status: httpStatus.http400badRequest })
		}

		const [foundInvitation]: Invitation[] = await database.select().from(invitations).where(eq(invitations.token, token)).limit(1)

		if (!foundInvitation) {
			return NextResponse.json({ message: 'invitation not found' }, { status: 400 })
		}

		const foundEmail = foundInvitation.email

		const [existingUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.email, foundEmail))

		if (existingUser) {
			//   - Transaction: change user table emailConfirmed to true if not already
			//   - Transaction: Create the relationship
			//   - Transaction: Delete invitation
			// - Return 201
		}

		if (!existingUser) {
			// If no details provided, ask for details
			if (!allDetailsProvided) {
				return NextResponse.json({ message: 'please provide details' }, { status: httpStatus.http422unprocessableContent })
			}

			if (allDetailsProvided) {
				let transactionErrorMessage: string | null = 'transaction error creating new user'
				let transactionErrorCode: number | null = httpStatus.http503serviceUnavailable

				const { createdUser, createdRelationship } = await database.transaction(async (tx) => {
					try {
						// Transaction: Create user with emailConfirmed=true
						const saltRounds = 10
						const hashedPassword = await bcrypt.hash(password, saltRounds)

						const newUserInsert: BaseUserInsertValues = {
							email: foundEmail,
							firstName,
							lastName,
							businessName,
							hashedPassword,
							emailConfirmed: true,
							cachedTrialExpired: false,
						}
						const [createdUser]: DangerousBaseUser[] = await tx.insert(users).values(newUserInsert).returning()

						// Transaction: Create relationship
						transactionErrorMessage = 'transaction error creating customerToMerchant'
						const newRelationshipInsert: CustomerToMerchant = {
							merchantUserId: foundInvitation.userId,
							customerUserId: createdUser.id,
						}
						const [createdRelationship]: CustomerToMerchant[] = await tx
							.insert(customerToMerchant)
							.values(newRelationshipInsert)
							.returning()

						// Transaction: Delete invitation
						transactionErrorMessage = 'transaction error deleting invitation'
						await tx.delete(invitations).where(and(eq(invitations.userId, foundInvitation.userId), eq(invitations.token, token)))

						// Transaction: Send welcome email
						const emailContent = `Hello ${createdUser.firstName}, thank you for signing up to Simple Order.` // ToDo: write a much better email

						transactionErrorMessage = 'transaction error sending welcome email'

						// Important ToD: Don't send actual emails! Important of the testing framework will go crazy

						const emailSuccess = await sendEmail({
							recipientEmail: foundEmail,
							subject: 'Thank you for using Simple Order',
							htmlVersion: emailContent,
							textVersion: emailContent,
						})

						if (!emailSuccess) {
							tx.rollback()
						}

						transactionErrorMessage = null
						transactionErrorCode = null
						return { createdUser, createdRelationship }
					} catch (error) {
						logger.error('Transaction error', error)
						return { createdUser: null, createdRelationship: null }
					}
				})

				if (transactionErrorMessage || transactionErrorCode || !createdUser || !createdRelationship) {
					return NextResponse.json(
						{
							message: transactionErrorMessage || 'unknown transaction error',
						},
						{
							status: transactionErrorCode || httpStatus.http503serviceUnavailable,
						},
					)
				}

				const cookieStore = await cookies()
				if (staySignedIn) {
					cookieStore.set(createCookieWithToken(createdUser.id, cookieDurations.oneYear))
				} else {
					cookieStore.set(createSessionCookieWithToken(createdUser.id))
				}

				return NextResponse.json({ message: basicMessages.success, createdUser }, { status: httpStatus.http200ok })
			}
		}
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	} catch (error) {
		logger.error('api/invitations/accept/[token] error', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
