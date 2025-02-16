import { websiteCopy } from '@/library/constants/websiteCopy'
import { bareDomain, productionBaseURL } from '@/library/environment/publicVariables'
import { formatTimeAndDate } from '@/library/utilities'

import type { EmailTemplate } from '@/types'
import { createParagraph } from '../../utilities'

export interface NewUserInvitationEmail {
	merchantBusinessName: string
	recipientEmail: string
	invitationURL: string
	expiryDate: Date
}

export function createNewUserInvitation({
	merchantBusinessName,
	recipientEmail,
	invitationURL,
	expiryDate,
}: NewUserInvitationEmail): EmailTemplate {
	const greeting = `Hello ${recipientEmail}`
	const intro = `${merchantBusinessName} has invited you to become their customer on Simple Order. Please click the link below to accept the invitation and create an account.`
	const link = `<a href="${invitationURL}">Accept invitation</a>`
	const securityMessage = `If you weren't expecting an invitation from this business or want to decline the invitation, you can safely ignore this email. The link will expire in 7 days, at  ${formatTimeAndDate(expiryDate)}.`
	const thankYou = 'Many thanks'
	const companyName = 'Accounts team, Simple Order'
	const companyLink = `<a href="${productionBaseURL}">${bareDomain}</a>`

	const htmlVersion = `
  ${createParagraph(greeting)}
  ${createParagraph(intro)}
  ${link}
  ${createParagraph(securityMessage)}
  ${createParagraph(thankYou)}
  ${createParagraph(companyName, 'semibold')}
  ${companyLink}
  ${createParagraph(websiteCopy.extras.selfContainedDescription)}`

	const textVersion = `${greeting}\n\n
${intro}\n\n
${invitationURL}\n\n
  ${securityMessage}\n\n
  ${thankYou}\n\n
  ${companyName}
  ${productionBaseURL}`

	return {
		subject: `${merchantBusinessName} has invited you to be their customer on Simple Order`,
		htmlVersion,
		textVersion,
	}
}

/*
const testEmail = createNewUserInvitation({
  merchantBusinessName: `Donkey Dan's Dildos`,
  recipientEmail: myPersonalEmail,
  expiryDate: new Date(Date.now() + durationSettings.acceptInvitationExpiry),
  invitationURL: 'https://google.com',
})

sendEmail(testEmail)
*/

/* 
pnpm tsx src/library/email/templates/invitations/newUser
*/
