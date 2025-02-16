import type { AuthenticationMessages, BasicMessages } from '@/types/definitions/responseMessages'

export interface ConfirmEmailPOSTresponse {
	message: Extract<BasicMessages, 'success' | 'server error'> | Extract<AuthenticationMessages, 'confirmation token missing'>
}

export interface ConfirmEmailPOSTbody {
	token: string | null
}
