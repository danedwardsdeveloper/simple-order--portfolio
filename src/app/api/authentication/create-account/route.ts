import { cookieDurations, userMessages } from '@/library/constants'
import { defaultAcceptedDeliveryDayIndices } from '@/library/constants/definitions/defaultSettings'
import { database } from '@/library/database/connection'
import { createConfirmationURL, createFreeTrial } from '@/library/database/operations'
import { acceptedDeliveryDays, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail, createNewTrialNotificationEmail } from '@/library/email/templates'
import { isProduction } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import { formatFirstError, sanitiseDangerousBaseUser, strictSlugify } from '@/library/utilities/public'
import { createCookieWithToken, equals, hashPassword, initialiseResponder, or } from '@/library/utilities/server'
import { NewUserSchema } from '@/library/validations'
import type { BaseUserInsertValues, BrowserSafeCompositeUser, DangerousBaseUser, Transaction, UserMessages } from '@/types'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

/**
 * @description Uses the values from BaseUserInsertValues but replaces hashedPassword with password
 * @example
const body: CreateAccountPOSTbody = {
	password: '',
	firstName: '',
	lastName: '',
	email: '',
	businessName: ''
}
 */
export interface CreateAccountPOSTbody extends Pick<BaseUserInsertValues, 'firstName' | 'lastName' | 'businessName' | 'email'> {
	password: string
}

export interface CreateAccountPOSTresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	user?: BrowserSafeCompositeUser
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
	const respond = initialiseResponder<CreateAccountPOSTresponse>()

	let body: CreateAccountPOSTbody | undefined
	try {
		body = await request.json()
	} catch {
		return respond({ status: 400, developmentMessage: 'Missing request body' })
	}

	try {
		const { success, error, data } = NewUserSchema.safeParse(body)
		if (!success) {
			return respond({
				status: 400,
				developmentMessage: formatFirstError(error),
			})
		}

		const { firstName, lastName, businessName, email, password } = data

		const [existingUser] = await database
			.select()
			.from(users)
			.where(or(equals(users.email, email), equals(users.businessName, businessName)))
			.limit(1)

		if (existingUser) {
			return respond({
				body: {
					userMessage: existingUser.email === email ? userMessages.emailTaken : userMessages.businessNameTaken,
				},
				status: 409,
			})
		}

		const hashedPassword = await hashPassword(password)

		let txError: { message: string; status: number } | undefined = { message: 'transaction error', status: 503 }

		const { dangerousNewUser, trialEnd, confirmationURL } = await database.transaction(async (tx: Transaction) => {
			const baseSlug = strictSlugify(businessName)
			let slug = baseSlug

			for (let attempt = 0; attempt < 10; attempt++) {
				const existingSlug = await tx.select().from(users).where(equals(users.slug, slug)).limit(1)

				if (existingSlug.length === 0) break
				slug = `${baseSlug}-${attempt + 1}`
			}

			const newUserInsertValues: BaseUserInsertValues = {
				firstName,
				lastName,
				email,
				hashedPassword,
				businessName,
				slug,
				emailConfirmed: false,
			}

			const [dangerousNewUser]: DangerousBaseUser[] = await tx.insert(users).values(newUserInsertValues).returning()

			txError = { message: 'error setting accepted delivery days', status: 503 }

			await tx
				.insert(acceptedDeliveryDays)
				.values(defaultAcceptedDeliveryDayIndices.map((dayIndex) => ({ userId: dangerousNewUser.id, dayOfWeekId: dayIndex })))

			txError = { message: 'error creating free trial', status: 503 }

			const { trialEnd } = await createFreeTrial({ userId: dangerousNewUser.id, tx })

			const confirmationURL = await createConfirmationURL({ userId: dangerousNewUser.id, queryRunner: tx })

			txError = { message: 'error sending email', status: 503 }
			const emailSentSuccessfully = await sendEmail({
				recipientEmail: email,
				...createNewMerchantEmail({
					recipientName: firstName,
					confirmationURL,
				}),
			})

			if (isProduction && email !== myPersonalEmail) {
				await sendEmail({
					recipientEmail: myPersonalEmail,
					...createNewTrialNotificationEmail(dangerousNewUser),
				})
			}

			if (!emailSentSuccessfully) tx.rollback()

			txError = undefined
			return { dangerousNewUser, trialEnd, confirmationURL }
		})

		if (txError) {
			return respond({
				developmentMessage: txError.message,
				status: txError.status,
			})
		}

		const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousNewUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: 'merchant',
			trialEnd,
			subscriptionEnd: null,
			subscriptionCancelled: false,
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(dangerousNewUser.id, cookieDurations.oneYear))

		return respond({
			body: { user: compositeUser },
			status: 201,
			developmentMessage: `Account created for ${compositeUser.firstName}.  Confirmation URL: ${confirmationURL}`,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
