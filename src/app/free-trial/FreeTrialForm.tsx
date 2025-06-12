'use client'
import { SubmitButton } from '@/components/Buttons'
import FormFieldErrorMessage from '@/components/FormFieldErrorMessage'
import PasswordVisibilityButton from '@/components/PasswordVisibilityButton'
import { dataTestIdNames } from '@/library/constants'
import { NewUserSchema } from '@/library/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

export type FreeTrialFormData = z.infer<typeof NewUserSchema>

export type FreeTrialFormProps = {
	onSubmit: (data: FreeTrialFormData) => Promise<void>
	isSubmitting: boolean
	errorMessage: string
}

export default function FreeTrialForm({ onSubmit, isSubmitting, errorMessage }: FreeTrialFormProps) {
	const [showPassword, setShowPassword] = useState(false)
	const {
		register,
		handleSubmit,
		formState: {
			errors: {
				firstName: firstNameError,
				lastName: lastNameError,
				businessName: businessNameError,
				email: emailError,
				password: passwordError,
			},
			isValid,
		},
	} = useForm<FreeTrialFormData>({
		resolver: zodResolver(NewUserSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues: {
			firstName: '',
			lastName: '',
			businessName: '',
			email: '',
			password: '',
		},
	})

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">
			<div>
				<div className="mb-1">
					<label htmlFor="firstName">First name</label>
					<FormFieldErrorMessage error={firstNameError} />
				</div>
				<input
					data-test-id={dataTestIdNames.createAccountFirstNameInput}
					id="firstName"
					type="text"
					autoComplete="given-name"
					aria-invalid={firstNameError ? 'true' : 'false'}
					{...register('firstName')}
					className="w-full"
				/>
			</div>

			<div>
				<div className="mb-1">
					<label htmlFor="lastName">Last name</label>
					<FormFieldErrorMessage error={lastNameError} />
				</div>
				<input
					data-test-id={dataTestIdNames.createAccountLastNameInput}
					id="lastName"
					type="text"
					autoComplete="family-name"
					aria-invalid={lastNameError ? 'true' : 'false'}
					{...register('lastName')}
					className="w-full"
				/>
			</div>

			<div>
				<div className="mb-1">
					<label htmlFor="businessName">Business name</label>
					<FormFieldErrorMessage error={businessNameError} />
				</div>
				<input
					data-test-id={dataTestIdNames.createAccountBusinessNameInput}
					id="businessName"
					type="text"
					autoComplete="company name"
					aria-invalid={businessNameError ? 'true' : 'false'}
					{...register('businessName')}
					className="w-full"
				/>
			</div>

			<div>
				<div className="mb-1">
					<label htmlFor="email">Email</label>
					<FormFieldErrorMessage error={emailError} />
				</div>
				<input
					data-test-id={dataTestIdNames.createAccountEmailInput}
					id="email"
					type="email"
					autoComplete="work email"
					aria-invalid={emailError ? 'true' : 'false'}
					{...register('email')}
					className="w-full"
				/>
			</div>

			<div>
				<div className="mb-1">
					<label htmlFor="password">Password</label>
					<FormFieldErrorMessage error={passwordError} />
				</div>
				<div className="relative">
					<input
						data-test-id={dataTestIdNames.createAccountPasswordInput}
						id="password"
						type={showPassword ? 'text' : 'password'}
						autoComplete="current-password"
						aria-invalid={passwordError ? 'true' : 'false'}
						{...register('password')}
						className="w-full tracking-wide"
					/>
					<PasswordVisibilityButton
						showPassword={showPassword} //
						onClick={() => setShowPassword(!showPassword)}
					/>
				</div>
			</div>

			{errorMessage && (
				<div
					className="mb-4 p-2 bg-red-50 text-red-600 rounded" //
				>
					{errorMessage}
				</div>
			)}

			<SubmitButton
				content="Start free trial"
				formReady={isValid}
				isSubmitting={isSubmitting}
				dataTestId={dataTestIdNames.createAccountSubmitButton}
				classes="mt-2"
			/>
		</form>
	)
}
