import type { contactFormSchema } from '@/library/validations'
import type { z } from 'zod'

export type ContactFormValues = z.infer<typeof contactFormSchema>
export type ContactFormInputValues = z.infer<typeof contactFormSchema>
