import type { AuthenticationMessages, BaseUserInsertValues, BasicMessages, FullBrowserSafeUser, IllegalCharactersMessages } from '@/types'

export interface CreateAccountPOSTbody extends Omit<BaseUserInsertValues, 'hashedPassword' | 'emailConfirmed' | 'cachedTrialExpired'> {
	password: string
	staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
	message: BasicMessages | AuthenticationMessages | IllegalCharactersMessages
	user?: FullBrowserSafeUser
}
