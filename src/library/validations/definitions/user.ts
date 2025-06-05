import { userMessages } from '@/library/constants'
import { users } from '@/library/database/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { allowedCharactersRegex } from './validCharacters'

export const NewUserSchema = z.object({
	firstName: z.string().min(1, 'First name required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	lastName: z.string().min(1, 'Last name required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	businessName: z.string().min(1, 'businessName required').regex(allowedCharactersRegex, { message: userMessages.allowedCharacters }),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'At least 8 characters please').max(30, 'Less than 20 characters please'),
})

export const SignInSchema = z.object({
	email: NewUserSchema.shape.email,
	password: NewUserSchema.shape.password,
})

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
