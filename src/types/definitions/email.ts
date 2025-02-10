export interface SendEmailBody {
  to?: string
  subject: string
  textVersion: string
  htmlVersion: string
}

export interface SendEmailResponse {
  success: boolean
}

export interface EmailTemplate {
  subject: string
  htmlVersion: string
  textVersion: string
}
