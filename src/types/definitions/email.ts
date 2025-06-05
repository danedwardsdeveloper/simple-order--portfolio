export type EmailVersions = {
	textVersion: string
	htmlVersion: string
}

export type SendEmailBody = EmailVersions & {
	recipientEmail: string
	subject: string
}

export interface EmailTemplate {
	subject: string
	htmlVersion: string
	textVersion: string
}
