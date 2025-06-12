import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { contactFormSubmissions } from '@/library/database/schema'
import { renderEmail } from '@/library/email/renderEmail'
import { sendEmail } from '@/library/email/sendEmail'
import { ContactFormSubmissionTemplate, type ContactFormTemplateProps, contactFormSubject } from '@/library/email/templates'
import { isDevelopment } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { formatFirstError } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import { contactFormSchema } from '@/library/validations'
import type { ApiResponse, ContactFormValues } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export type ContactPOSTbody = ContactFormValues

type Success = {
	ok: true
}

type Failure = {
	ok: false
	developmentMessage: string
	userMessage: typeof userMessages.contactFormError
}

export type ContactPOSTresponse = ApiResponse<Success, Failure>

/**
 * Receives the data from <ContactForm /> and forwards it to my personal email
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContactPOSTresponse>> {
	const respond = initialiseResponder<Success, Failure>()
	let txError = undefined

	try {
		const body = await request.json()
		const result = contactFormSchema.safeParse(body)

		if (!result.success) {
			return respond({
				body: { userMessage: userMessages.contactFormError },
				status: 400,
				developmentMessage: formatFirstError(result.error),
			})
		}

		const { firstName, businessName, email, message, website: honeypot } = result.data

		if (honeypot) {
			return respond({
				body: {},
				status: 200,
				developmentMessage: 'Honeypot field provided. Returning false positive',
			})
		}

		const { sentEmailSuccessfully } = await database.transaction(async (tx) => {
			const insertValues: ContactFormValues = {
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

			txError = 'Error sending email'
			const sentEmailSuccessfully = false

			const emailTemplateProps: ContactFormTemplateProps = {
				firstName,
				businessName,
				email,
				message,
			}

			if (isDevelopment) {
				const { text } = await renderEmail(ContactFormSubmissionTemplate, emailTemplateProps)

				logger.info(`Bypassed sending email in development. Email: ${text}`)
			} else {
				await sendEmail({
					template: ContactFormSubmissionTemplate,
					templateProps: emailTemplateProps,
					recipient: myPersonalEmail,
					subject: contactFormSubject(firstName),
				})
			}

			if (!sentEmailSuccessfully) tx.rollback()

			txError = undefined
			return { sentEmailSuccessfully }
		})

		if (!sentEmailSuccessfully) {
			return respond({
				body: { userMessage: userMessages.contactFormError },
				status: 503,
				developmentMessage: 'Failed to send email',
			})
		}

		return respond({
			body: {},
			status: 200,
			developmentMessage: 'Message sent successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.contactFormError },
			status: 500,
			developmentMessage: txError,
			caughtError,
		})
	}
}
