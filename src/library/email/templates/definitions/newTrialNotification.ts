import { createHtmlParagraph } from '@/library/utilities/server'
import type { DangerousBaseUser, EmailTemplate } from '@/types'

export function createNewTrialNotificationEmail(newUser: DangerousBaseUser): EmailTemplate {
	const greeting = 'Congratulations, Dan!'
	const main = `${newUser.businessName} started a free trial`

	const htmlVersion = `
  ${createHtmlParagraph(greeting)}
  ${createHtmlParagraph(main)}
  ${createHtmlParagraph(newUser.email)}`

	const textVersion = `${greeting}\n\n
${greeting}\n\n
${main}\n\n`

	return {
		subject: 'New trial!',
		htmlVersion,
		textVersion,
	}
}
