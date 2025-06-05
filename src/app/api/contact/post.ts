import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { contactFormSubmissions } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { isDevelopment } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { formatFirstError } from '@/library/utilities/public'
import { equals, formatSimpleEmail, initialiseResponder } from '@/library/utilities/server'
import { contactFormSchema } from '@/library/validations'
import type { ContactFormInputValues, ContactFormValues } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export type ContactPOSTbody = ContactFormValues

export interface ContactPOSTresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.contactFormError
}

/**
 * Receives the data from <ContactForm /> and forwards it to my personal email
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContactPOSTresponse>> {
	const respond = initialiseResponder<ContactPOSTresponse>()
	const userMessage = userMessages.contactFormError
	let txError = undefined

	try {
		const body = await request.json()
		const result = contactFormSchema.safeParse(body)

		if (!result.success) {
			return respond({
				status: 400,
				developmentMessage: formatFirstError(result.error),
			})
		}

		const { firstName, businessName, email, message, website: honeypot } = result.data

		if (honeypot) {
			return respond({
				status: 200,
				developmentMessage: 'Honeypot field provided. Returning false positive',
			})
		}

		const { sentEmailSuccessfully } = await database.transaction(async (tx) => {
			const insertValues: ContactFormInputValues = {
				firstName,
				businessName,
				email,
				message,
			}

			txError = 'Error creating database record'
			const [createdInvitation] = await tx.insert(contactFormSubmissions).values(insertValues).returning()

			if (isDevelopment) {
				txError = 'Error deleted freshly created database record in development'
				await tx.delete(contactFormSubmissions).where(equals(contactFormSubmissions.id, createdInvitation.id))
				logger.info('Successfully created and deleted contact form submission in development')
			}

			const { htmlVersion, textVersion } = formatSimpleEmail([
				{ content: 'New message through Simple Order contact form', bold: true },
				`from ${firstName}, ${email} `,
				businessName,
				message,
			])

			txError = 'Error sending email'
			let sentEmailSuccessfully = false

			if (isDevelopment) {
				sentEmailSuccessfully = true
				logger.info(`Bypassed sending email in development. Email: ${textVersion}`)
			} else {
				sentEmailSuccessfully = await sendEmail({
					recipientEmail: myPersonalEmail,
					subject: 'New message: Simple Order',
					htmlVersion,
					textVersion,
				})
			}

			if (!sentEmailSuccessfully) tx.rollback()

			txError = undefined
			return { sentEmailSuccessfully }
		})

		if (!sentEmailSuccessfully) {
			return respond({
				body: { userMessage },
				status: 503,
				developmentMessage: 'Failed to send email',
			})
		}

		return respond({
			status: 200,
			developmentMessage: 'Message sent successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage },
			status: 500,
			developmentMessage: txError,
			caughtError,
		})
	}
}
