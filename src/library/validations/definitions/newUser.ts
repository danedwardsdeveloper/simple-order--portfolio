import { userMessages } from '@/library/constants'
import { allowedCharactersRegex } from '@/library/utilities/public'
import { z } from 'zod'

export const NewUserSchema = z.object({
	firstName: z.string().min(1, 'First name required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	lastName: z.string().min(1, 'Last name required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	businessName: z.string().min(1, 'businessName required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'At least 8 characters please').max(30, 'Less than 20 characters please'),
})
