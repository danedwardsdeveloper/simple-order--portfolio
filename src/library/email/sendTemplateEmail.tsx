import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { sendEmail } from './sendEmail'
import {} from './templates'

type EmailTemplateFunction<T> = (props: T) => ReactElement

interface SendTemplateEmailParams<T> {
	template: EmailTemplateFunction<T>
	props: T
	recipientEmail: string
	subject: string
}

export async function sendTemplateEmail<T>({ template, props, recipientEmail, subject }: SendTemplateEmailParams<T>): Promise<boolean> {
	const htmlVersion = await render(template(props))
	const textVersion = await render(template(props), { plainText: true })

	return await sendEmail({
		recipientEmail,
		subject,
		htmlVersion,
		textVersion,
	})
}

/*
;(async () => {
	try {
		await sendTemplateEmail<ConfirmEmailProps>({
			template: ConfirmEmail,
			recipientEmail: myPersonalEmail,
			subject: 'Your login code',
			props: {
				loginCode: '1234-5678',
				name: 'Dan',
				confirmationLink: 'men.com',
			},
		})
	} catch (error) {
		logger.error(error instanceof Error ? error.message : 'Unknown error!')
	}
})()
*/

/* 
pnpm tsx src/library/email/sendTemplateEmail
*/
