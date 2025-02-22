import type { AuthenticationMessages, BasicMessages, FullBrowserSafeUser } from '@/types'

export interface SignInPOSTbody {
	password: string
	email: string
	staySignedIn: boolean
}

export interface SignInPOSTresponse {
	message: BasicMessages | AuthenticationMessages
	fullBrowserSafeUser?: FullBrowserSafeUser
}
