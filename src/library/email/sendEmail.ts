import { MailgunMessageData } from 'mailgun.js'

import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'

import emailClient from './client'
import { SendEmailBody, SendEmailResponse } from '@/types'

export const sendEmail = async ({ to = myPersonalEmail, subject, htmlVersion, textVersion }: SendEmailBody): Promise<SendEmailResponse> => {
  const messageData: MailgunMessageData = {
    from: 'Simple Order <noreply@simpleorder.co.uk>',
    to,
    subject,
    text: textVersion,
    html: htmlVersion,
  }
  const response = await emailClient.messages.create('simpleorder.co.uk', messageData)

  if (response.status === 200) {
    logger.info(`Sent email to ${to}`)
    return { success: true }
  } else {
    logger.errorUnknown(response.message, 'Error sending email')
    return { success: false }
  }
}

// sendEmail({
//   to: myPersonalEmail,
//   ...createNewMerchantEmail({
//     recipientName: 'Dan',
//     confirmationURL: 'www.google.com',
//   }),
// })

/* 
pnpm tsx src/library/email/sendEmail
*/
