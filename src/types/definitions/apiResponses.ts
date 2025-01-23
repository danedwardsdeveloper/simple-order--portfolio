import { SafeUser } from '@/library/tempData/users'

import { AuthorisationMessages, BasicMessages } from './responseMessages'

export interface SignInPOSTbody {
  password: string
  email: string
  staySignedIn: boolean
}

export interface SignInPOSTresponse {
  message: BasicMessages | AuthorisationMessages
  foundUser?: SafeUser
}
