import type { AuthenticationMessages, BasicMessages, IllegalCharactersMessages } from '@/types/definitions/responseMessages'
import type { BaseUserInsertValues, FullBrowserSafeUser } from '@/types/definitions/users'

export interface CreateAccountPOSTbody extends Omit<BaseUserInsertValues, 'hashedPassword' | 'emailConfirmed' | 'cachedTrialExpired'> {
	password: string
	staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
	message: BasicMessages | AuthenticationMessages | IllegalCharactersMessages
	user?: FullBrowserSafeUser
}
