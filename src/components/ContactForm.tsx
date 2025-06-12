'use client'
import type { ContactPOSTbody, ContactPOSTresponse } from '@/app/api/contact/post'
import FormLabel from '@/components/FormLabel'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { inputClasses } from '@/library/utilities/public/definitions/styles'
import { contactFormSchema } from '@/library/validations'
import type { ContactFormValues } from '@/types'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { SubmitButton } from './Buttons'
import { useNotifications } from './providers/notifications'

export function ContactForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [success, setSuccess] = useState(false)
	const [feedbackMessage, setFeedbackMessage] = useState('')
	const { successNotification } = useNotifications()

	const {
		register,
		watch,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			firstName: '',
			businessName: '',
			email: '',
			message: '',
			website: '',
		},
		mode: 'onTouched',
	})

	const fieldLabels = {
		firstName: 'First name',
		businessName: 'Business name',
		email: 'Email',
		message: 'Message',
	}
	type FieldLabel = keyof typeof fieldLabels

	async function onSubmit(data: ContactFormValues) {
		setFeedbackMessage('')
		setIsSubmitting(true)

		try {
			const { userMessage, ok } = await apiRequest<ContactPOSTresponse, ContactPOSTbody>({
				basePath: '/contact',
				method: 'POST',
				body: data,
			})

			if (ok) {
				setSuccess(true)
				successNotification("Message sent - we'll get back to you as soon as possible.")
			} else {
				setFeedbackMessage(userMessage || userMessages.contactFormError)
			}
		} catch {
			setFeedbackMessage(userMessages.contactFormError)
		} finally {
			setIsSubmitting(false)
		}
	}

	const containerClasses = 'mx-auto mt-16 max-w-xl sm:mt-20 flex flex-col gap-y-6'

	if (success) {
		const formData = watch()

		return (
			<div className={containerClasses}>
				<p className="flex gap-x-2 items-center font-medium">
					Message sent successfully
					<CheckCircleIcon className="text-green-600 size-7" />
				</p>
				{Object.entries(formData)
					.filter(([key]) => key !== 'website') // Exclude honeypot
					.map(([key, value]) => (
						<div key={key}>
							<span className="block mb-1 text-zinc-600">{fieldLabels[key as FieldLabel]}</span>
							<p>{String(value)}</p>
						</div>
					))}
			</div>
		)
	}

	// Form error here...

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className={containerClasses}>
			{/* First name */}
			<div>
				<FormLabel htmlFor="firstName" text={fieldLabels.firstName} errorMessage={errors.firstName?.message} />
				<input
					id="firstName"
					type="text"
					autoComplete="given-name"
					{...register('firstName')}
					className={inputClasses('w-full', errors.firstName?.message)}
				/>
			</div>

			{/* Business name */}
			<div>
				<FormLabel htmlFor="businessName" text={fieldLabels.businessName} errorMessage={errors.businessName?.message} />
				<input
					id="businessName"
					type="text"
					autoComplete="organization"
					{...register('businessName')}
					className={inputClasses('w-full', errors.businessName?.message)}
				/>
			</div>

			{/* Email */}
			<div>
				<FormLabel htmlFor="email" text={fieldLabels.email} errorMessage={errors.email?.message} />
				<input
					id="email"
					type="email"
					autoComplete="email"
					{...register('email')}
					className={inputClasses('w-full', errors.email?.message)}
				/>
			</div>

			{/* Message */}
			<div>
				<FormLabel htmlFor="message" text={fieldLabels.message} errorMessage={errors.message?.message} />
				<textarea id="message" {...register('message')} rows={5} className={inputClasses('w-full', errors.message?.message)} />
			</div>

			{/* Honeypot */}
			<div className="hidden" aria-hidden="true">
				<label htmlFor="website">Website</label>
				<input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
			</div>

			<div className="mt-5 sm:mt-6 w-full">
				{feedbackMessage && <p className="text-red-600 text-center mb-2">{feedbackMessage}</p>}
				<SubmitButton
					formReady={isValid} //
					isSubmitting={isSubmitting}
					content="Send message"
				/>
			</div>
		</form>
	)
}
