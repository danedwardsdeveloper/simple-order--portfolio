import { z } from 'zod'
import { NewUserSchema } from './newUser'

export const SignInSchema = z.object({
	email: NewUserSchema.shape.email,
	password: NewUserSchema.shape.password,
})
