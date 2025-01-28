import { FreeTrial } from './freeTrials'
import { AuthenticationMessages, BasicMessages } from './responseMessages'
import { ClientSafeUser, MerchantProfile, NewUser, SafeUser } from './users'

export interface CreateAccountPOSTbody extends Omit<NewUser, 'hashedPassword' | 'emailConfirmed'> {
  password: string
  staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
  message: BasicMessages | AuthenticationMessages
  user?: ClientSafeUser
}

export interface SignInPOSTbody {
  password: string
  email: string
  staySignedIn: boolean
}

export interface SignInPOSTresponse {
  message: BasicMessages | AuthenticationMessages
  foundUser?: SafeUser
}
