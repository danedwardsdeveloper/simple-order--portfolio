export interface SendEmailBody {
  to?: string
  subject: string
  textVersion: string
  htmlVersion: string
}

export interface EmailTemplate {
  subject: string
  htmlVersion: string
  textVersion: string
}
