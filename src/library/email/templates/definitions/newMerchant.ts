import { createHtmlParagraph } from '@/library/utilities/server'
import type { EmailTemplate } from '@/types'

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
  ${createHtmlParagraph(greeting)}
  ${createHtmlParagraph(intro)}
  ${link}
  ${createHtmlParagraph(securityMessage)}
  ${createHtmlParagraph(thankYou)}
  ${createHtmlParagraph(companyName, 'semibold')}`

	const textVersion = `${greeting}\n\n
${intro}\n\n
${confirmationURL}\n\n
  ${createHtmlParagraph(securityMessage)}\n\n
  ${createHtmlParagraph(thankYou)}\n\n
  ${createHtmlParagraph(companyName, 'semibold')}`

	return {
		subject: 'Confirm your email',
		htmlVersion,
		textVersion,
	}
}
