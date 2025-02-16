import type { AuthenticationMessages, BasicMessages } from '@/types/definitions/responseMessages'
import type { SafeUser } from '@/types/definitions/users'

export interface SignInPOSTbody {
	password: string
	email: string
	staySignedIn: boolean
}

export interface SignInPOSTresponse {
	message: BasicMessages | AuthenticationMessages
	foundUser?: SafeUser
}
