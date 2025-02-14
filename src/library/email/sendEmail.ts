import { MailgunMessageData } from 'mailgun.js'

import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'

import { database } from '../database/connection'
import { testEmailInbox } from '../database/schema'
import emailClient from './client'
import { SendEmailBody } from '@/types'
import { TestEmail, TestEmailInsert } from '@/types/definitions/testEmailInbox'

export const sendEmail = async ({ recipientEmail, subject, htmlVersion, textVersion }: SendEmailBody): Promise<boolean> => {
  try {
    // 1. Add all emails to test_email_inbox
    const newTestEmailInboxValues: TestEmailInsert = {
      content: `${htmlVersion}\n\n\n${textVersion}`,
    }
    const [addedToTestEmailInbox]: TestEmail[] = await database.insert(testEmailInbox).values(newTestEmailInboxValues).returning()

    if (!addedToTestEmailInbox) {
      return false
    }

    // Don't actually send emails except to myself
    if (!(recipientEmail.trim().toLowerCase() === myPersonalEmail)) {
      logger.info(`Intercepted email to ${recipientEmail}`)
      return true
    }

    const messageData: MailgunMessageData = {
      from: 'Simple Order <noreply@simpleorder.co.uk>',
      to: myPersonalEmail, // Only send emails to myself at the moment, if at all
      subject,
      text: textVersion,
      html: htmlVersion,
    }
    const response = await emailClient.messages.create('simpleorder.co.uk', messageData)

    // Enhancement ToDo: Add retry logic later on
    if (response.status === 200) {
      logger.info(`Sent email to ${recipientEmail}`)
      return true
    } else {
      logger.errorUnknown(response.message, 'Error sending email')
      return false
    }
  } catch (error) {
    logger.errorUnknown(error, 'Error sending email')
    return false
  }
}

// sendEmail({
//   recipientEmail: myPersonalEmail,
//   ...createNewMerchantEmail({
//     recipientName: 'Dan',
//     confirmationURL: 'www.google.com',
//   }),
// })

/* 
pnpm tsx src/library/email/sendEmail
*/
