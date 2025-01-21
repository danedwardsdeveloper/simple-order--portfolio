import { User } from '@/library/tempData/users'

import { AuthorisationMessages, BasicMessages } from './responseMessages'

export interface SignInPOSTbody {
  password: string
  email: string
}

export interface SignInPOSTresponse {
  message: BasicMessages | AuthorisationMessages
  foundUser?: User
}
