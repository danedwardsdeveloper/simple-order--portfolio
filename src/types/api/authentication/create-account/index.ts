import { AuthenticationMessages, BasicMessages } from '@/types/definitions/responseMessages'
import { ClientSafeUser, NewUser } from '@/types/definitions/users'

export interface CreateAccountPOSTbody extends Omit<NewUser, 'hashedPassword' | 'emailConfirmed'> {
  password: string
  staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
  message: BasicMessages | AuthenticationMessages
  user?: ClientSafeUser
}
