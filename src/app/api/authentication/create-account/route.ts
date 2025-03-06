import {
	authenticationMessages,
	basicMessages,
	cookieDurations,
	durationSettings,
	httpStatus,
	illegalCharactersMessages,
	missingFieldMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail } from '@/library/email/templates/newMerchant'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { containsIllegalCharacters, createFreeTrialEndTime, createMerchantSlug } from '@/library/utilities'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken } from '@/library/utilities/server'
import type {
	BaseUserInsertValues,
	BrowserSafeCompositeUser,
	DangerousBaseUser,
	IllegalCharactersMessages,
	MissingFieldMessages,
	NewFreeTrial,
} from '@/types'
import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

export interface CreateAccountPOSTbody extends Omit<BaseUserInsertValues, 'hashedPassword' | 'emailConfirmed' | 'cachedTrialExpired'> {
	password: string
}

export interface CreateAccountPOSTresponse {
	message:
		| typeof missingFieldMessages.lastNameMissing
		| typeof missingFieldMessages.firstNameMissing
		| typeof missingFieldMessages.emailMissing
		| typeof missingFieldMessages.businessNameMissing
		| typeof missingFieldMessages.passwordMissing
		| typeof authenticationMessages.invalidEmailFormat
		| typeof authenticationMessages.emailTaken
		| typeof authenticationMessages.businessNameTaken
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof basicMessages.serviceUnavailable
		| IllegalCharactersMessages
	user?: BrowserSafeCompositeUser
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
	const { firstName, lastName, email, password, businessName }: CreateAccountPOSTbody = await request.json()

	let missingFieldMessage: MissingFieldMessages | null = null
	if (!firstName) missingFieldMessage = missingFieldMessages.firstNameMissing
	if (!lastName) missingFieldMessage = missingFieldMessages.lastNameMissing
	if (!email) missingFieldMessage = missingFieldMessages.emailMissing
	if (!password) missingFieldMessage = missingFieldMessages.passwordMissing
	if (!businessName) missingFieldMessage = missingFieldMessages.businessNameMissing

	if (missingFieldMessage) {
		return NextResponse.json({ message: missingFieldMessage }, { status: httpStatus.http400badRequest })
	}

	let illegalCharactersMessage: IllegalCharactersMessages | null = null
	if (containsIllegalCharacters(firstName)) illegalCharactersMessage = illegalCharactersMessages.firstName
	if (containsIllegalCharacters(lastName)) illegalCharactersMessage = illegalCharactersMessages.lastName
	if (containsIllegalCharacters(password)) illegalCharactersMessage = illegalCharactersMessages.password
	if (containsIllegalCharacters(businessName)) illegalCharactersMessage = illegalCharactersMessages.businessName

	if (illegalCharactersMessage) {
		return NextResponse.json({ message: illegalCharactersMessage }, { status: httpStatus.http400badRequest })
	}

	const normalisedEmail = email.toLowerCase().trim()
	if (!emailRegex.test(normalisedEmail)) {
		return NextResponse.json({ message: authenticationMessages.invalidEmailFormat }, { status: httpStatus.http400badRequest })
	}

	try {
		const [existingUser] = await database
			.select()
			.from(users)
			.where(or(eq(users.email, normalisedEmail), eq(users.businessName, businessName)))
			.limit(1)

		if (existingUser) {
			if (existingUser.email === normalisedEmail) {
				logger.debug('Existing user email: ', existingUser.email)
				logger.debug('normalisedEmail: ', normalisedEmail)
				return NextResponse.json({ message: authenticationMessages.emailTaken }, { status: httpStatus.http409conflict })
			}

			if (existingUser.businessName === businessName) {
				return NextResponse.json({ message: authenticationMessages.businessNameTaken }, { status: httpStatus.http409conflict })
			}
		}

		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(password, saltRounds)

		// ToDo: Use proper codes
		let transactionErrorMessage: string | null = basicMessages.serverError
		let transactionErrorStatusCode: number | null = httpStatus.http503serviceUnavailable

		const { dangerousNewUser } = await database.transaction(async (tx) => {
			const baseSlug = createMerchantSlug(businessName)
			let slug = baseSlug

			for (let attempt = 0; attempt < 10; attempt++) {
				const existingSlug = await tx.select().from(users).where(eq(users.slug, slug)).limit(1)

				if (existingSlug.length === 0) break
				slug = `${baseSlug}-${attempt + 1}`
			}

			const newUserInsertValues: BaseUserInsertValues = {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: normalisedEmail,
				hashedPassword: hashedPassword.trim(),
				businessName: businessName.trim(),
				slug,
				emailConfirmed: false,
				cachedTrialExpired: false,
			}

			const [dangerousNewUser]: DangerousBaseUser[] = await tx.insert(users).values(newUserInsertValues).returning()

			const freeTrialInsert: NewFreeTrial = {
				startDate: new Date(),
				endDate: createFreeTrialEndTime(),
				userId: dangerousNewUser.id,
			}

			await tx.insert(freeTrials).values(freeTrialInsert).returning()

			const emailConfirmationToken = generateConfirmationToken()

			await tx.insert(confirmationTokens).values({
				userId: dangerousNewUser.id,
				token: emailConfirmationToken,
				expiresAt: new Date(Date.now() + durationSettings.confirmEmailExpiry),
			})

			const confirmationURL = `${dynamicBaseURL}/confirm?token=${emailConfirmationToken}`
			logger.info('Confirmation URL: ', confirmationURL)

			// Optimisation ToDo: style the email and craft the wording carefully
			transactionErrorMessage = basicMessages.errorSendingEmail
			const emailSentSuccessfully = await sendEmail({
				recipientEmail: email,
				...createNewMerchantEmail({
					recipientName: firstName,
					confirmationURL,
				}),
			})

			if (!emailSentSuccessfully) tx.rollback()

			transactionErrorMessage = null
			transactionErrorStatusCode = null

			return { dangerousNewUser }
		})

		if (transactionErrorMessage || transactionErrorStatusCode) {
			return NextResponse.json({ message: basicMessages.serviceUnavailable }, { status: httpStatus.http503serviceUnavailable })
		}

		const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousNewUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: 'merchant',
			activeSubscriptionOrTrial: true,
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(dangerousNewUser.id, cookieDurations.oneYear))

		return NextResponse.json({ message: basicMessages.success, user: compositeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error('Error creating user: ', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
