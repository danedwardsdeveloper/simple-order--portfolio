import { apiPaths, cookieDurations, durationSettings, httpStatus, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail } from '@/library/email/templates'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import {
	containsIllegalCharacters,
	createFreeTrialEndTime,
	createMerchantSlug,
	emailRegex,
	generateUuid,
	initialiseDevelopmentLogger,
	sanitiseDangerousBaseUser,
} from '@/library/utilities/public'
import { createCookieWithToken, equals, or } from '@/library/utilities/server'
import type { BaseUserInsertValues, BrowserSafeCompositeUser, DangerousBaseUser, NewFreeTrial, UserMessages } from '@/types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface CreateAccountPOSTbody extends Pick<BaseUserInsertValues, 'firstName' | 'lastName' | 'businessName' | 'email'> {
	password: string
}

export interface CreateAccountPOSTresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	user?: BrowserSafeCompositeUser
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
	const developmentLogger = initialiseDevelopmentLogger(`POST ${apiPaths.authentication.createAccount}:`)

	const { firstName, lastName, email, password, businessName }: CreateAccountPOSTbody = await request.json()

	let missingFieldMessage = null

	if (!firstName) {
		missingFieldMessage = 'firstName missing'
	} else if (!lastName) {
		missingFieldMessage = 'lastName missing'
	} else if (!email) {
		missingFieldMessage = 'email missing'
	} else if (!password) {
		missingFieldMessage = 'password missing'
	} else if (!businessName) {
		missingFieldMessage = 'businessName missing'
	}

	if (missingFieldMessage) {
		const developmentMessage = developmentLogger(missingFieldMessage)
		return NextResponse.json({ developmentMessage }, { status: 400 })
	}

	let illegalCharactersMessage = null
	if (containsIllegalCharacters(firstName)) {
		illegalCharactersMessage = 'firstName contains illegal characters'
	} else if (containsIllegalCharacters(lastName)) {
		illegalCharactersMessage = 'lastName contains illegal characters'
	} else if (containsIllegalCharacters(password)) {
		illegalCharactersMessage = 'password contains illegal characters'
	} else if (containsIllegalCharacters(businessName)) {
		illegalCharactersMessage = 'businessName contains illegal characters'
	}

	if (illegalCharactersMessage) {
		const developmentMessage = developmentLogger(illegalCharactersMessage)
		return NextResponse.json({ developmentMessage }, { status: 400 })
	}

	const normalisedEmail = email.toLowerCase().trim()

	if (!emailRegex.test(normalisedEmail)) {
		const developmentMessage = developmentLogger('Invalid email format')
		return NextResponse.json({ developmentMessage }, { status: 400 })
	}

	try {
		const [existingUser] = await database
			.select()
			.from(users)
			.where(or(equals(users.email, normalisedEmail), equals(users.businessName, businessName)))
			.limit(1)

		if (existingUser) {
			if (existingUser.email === normalisedEmail) {
				return NextResponse.json({ userMessage: userMessages.emailTaken }, { status: httpStatus.http409conflict })
			}

			if (existingUser.businessName === businessName) {
				return NextResponse.json({ userMessage: userMessages.businessNameTaken }, { status: httpStatus.http409conflict })
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		let transactionErrorMessage: string | null = 'transaction error'
		let transactionErrorStatusCode: number | null = httpStatus.http503serviceUnavailable

		let confirmationURL: string | null = null

		const { dangerousNewUser } = await database.transaction(async (tx) => {
			const baseSlug = createMerchantSlug(businessName)
			let slug = baseSlug

			for (let attempt = 0; attempt < 10; attempt++) {
				const existingSlug = await tx.select().from(users).where(equals(users.slug, slug)).limit(1)

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

			const emailConfirmationToken = generateUuid()

			await tx.insert(confirmationTokens).values({
				userId: dangerousNewUser.id,
				token: emailConfirmationToken,
				expiresAt: new Date(Date.now() + durationSettings.confirmEmailExpiry),
			})

			confirmationURL = `${dynamicBaseURL}/confirm?token=${emailConfirmationToken}`

			transactionErrorMessage = 'error sending email'
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

		if (transactionErrorMessage && transactionErrorStatusCode) {
			const developmentMessage = developmentLogger(transactionErrorMessage)
			return NextResponse.json({ developmentMessage }, { status: transactionErrorStatusCode })
		}

		const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousNewUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: 'merchant',
			activeSubscriptionOrTrial: true,
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(dangerousNewUser.id, cookieDurations.oneYear))

		developmentLogger(`Account created for ${compositeUser.firstName}.  Confirmation URL: ${confirmationURL}`, 'level3success')

		return NextResponse.json({ user: compositeUser }, { status: 200 })
	} catch (error) {
		developmentLogger('Caught error', 'level1error', error)
		return NextResponse.json({ userMessage: userMessages.serverError }, { status: 500 })
	}
}
