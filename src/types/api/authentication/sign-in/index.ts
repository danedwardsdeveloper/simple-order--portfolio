import { AuthenticationMessages, BasicMessages } from '@/types/definitions/responseMessages'
import { SafeUser } from '@/types/definitions/users'

export interface SignInPOSTbody {
  password: string
  email: string
  staySignedIn: boolean
}

export interface SignInPOSTresponse {
  message: BasicMessages | AuthenticationMessages
  foundUser?: SafeUser
}
