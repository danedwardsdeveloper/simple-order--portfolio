import { AuthenticationMessages, BasicMessages } from '@/types/definitions/responseMessages'

export const ConfirmEmailQueryParameters = {
  token: 't',
} as const

export interface ConfirmEmailPOSTresponse {
  message:
    | Extract<BasicMessages, 'success' | 'server error'>
    | Extract<AuthenticationMessages, 'confirmation token missing'>
}

export interface ConfirmEmailPOSTbody {
  token: string | null
}
