import type { AuthenticationMessages, BaseBrowserSafeUser, BasicMessages } from '@/types'

export interface SignInPOSTbody {
	password: string
	email: string
	staySignedIn: boolean
}

export interface SignInPOSTresponse {
	message: BasicMessages | AuthenticationMessages
	baseBrowserSafeUser?: BaseBrowserSafeUser
}
