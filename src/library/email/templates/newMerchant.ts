import { createParagraph } from '../utilities'
import { EmailTemplate } from '@/types'

interface NewMerchantEmailProps {
  recipientName: string
  confirmationURL: string
}

export function createNewMerchantEmail({ recipientName, confirmationURL }: NewMerchantEmailProps): EmailTemplate {
  const greeting = `Hello ${recipientName}`
  const intro = 'Thank you for choosing Simple Order. Please confirm your email by clicking the link below.'
  const link = `<a href="${confirmationURL}">Confirm your email</a>`
  const securityMessage = `You can safely ignore this email if you didn't register for an account. This link will expire in 24 hours.`
  const thankYou = 'Many thanks'
  const companyName = 'Accounts team, Simple Order'

  const htmlVersion = `
  ${createParagraph(greeting)}
  ${createParagraph(intro)}
  ${link}
  ${createParagraph(securityMessage)}
  ${createParagraph(thankYou)}
  ${createParagraph(companyName, 'semibold')}`

  const textVersion = `${greeting}\n\n
${intro}\n\n
${confirmationURL}\n\n
  ${createParagraph(securityMessage)}\n\n
  ${createParagraph(thankYou)}\n\n
  ${createParagraph(companyName, 'semibold')}`

  return {
    subject: 'Confirm your email',
    htmlVersion,
    textVersion,
  }
}
