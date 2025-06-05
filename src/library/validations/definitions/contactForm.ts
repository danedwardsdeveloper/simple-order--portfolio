import { contactFormSubmissions } from '@/library/database/schema'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { validCharacters } from './validCharacters'

const charactersMessage = 'Less than 100 characters please'
const emailMessage = 'Please enter a valid email address'

export const contactFormSchema = createInsertSchema(contactFormSubmissions, {
	firstName: z.string().min(1, { message: 'Please enter your firstname' }).max(100, { message: charactersMessage }).pipe(validCharacters()),
	businessName: z
		.string()
		.min(1, { message: 'Please enter your business name' })
		.max(100, { message: charactersMessage })
		.pipe(validCharacters()),
	email: z.string().min(1, { message: emailMessage }).email({ message: emailMessage }),
	message: z
		.string()
		.min(1, { message: 'Please enter a message' })
		.max(1000, { message: 'Your message must be less than 1000 characters' })
		.pipe(validCharacters()),
	website: z.string().optional(), // Honeypot
})
