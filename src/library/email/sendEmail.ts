import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import type { SendEmailBody, TestEmail, TestEmailInsertValues } from '@/types'
import type { MailgunMessageData } from 'mailgun.js'
import { database } from '../database/connection'
import { testEmailInbox } from '../database/schema'
import { emailSenderDomain, isProduction } from '../environment/publicVariables'
import emailClient from './client'

export const sendEmail = async ({ recipientEmail, subject, htmlVersion, textVersion }: SendEmailBody): Promise<boolean> => {
	// Refactor. Use database transaction, remove try/catch
	try {
		// 1. Add all emails to test_email_inbox
		const newTestEmailInboxValues: TestEmailInsertValues = {
			content: `HTML version: ${htmlVersion}\n\n\n Text version: ${textVersion}`,
			recipientEmail,
		}
		const [addedToTestEmailInbox]: TestEmail[] = await database.insert(testEmailInbox).values(newTestEmailInboxValues).returning()

		if (!addedToTestEmailInbox) return false

		// In development, don't actually send emails, except to myself
		if (!isProduction && !(recipientEmail.trim().toLowerCase() === myPersonalEmail)) {
			logger.info(`Intercepted email to ${recipientEmail}. No email sent`)
			return true
		}

		const messageData: MailgunMessageData = {
			from: 'Simple Order <noreply@simpleorder.co.uk>',
			to: recipientEmail,
			subject,
			text: textVersion,
			html: htmlVersion,
		}

		const response = await emailClient.messages.create(emailSenderDomain, messageData)

		// Enhancement ToDo: Add retry logic
		if (response.status === 200) {
			logger.info(`Sent email to ${recipientEmail}`)
			return true
		}
		logger.error('Error sending email', response.message)
		return false
	} catch (error) {
		logger.error('Error sending email', error)
		return false
	}
}
