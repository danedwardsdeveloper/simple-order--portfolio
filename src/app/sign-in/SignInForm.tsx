'use client'
import { SubmitButton } from '@/components/Buttons'
import FormFieldErrorMessage from '@/components/FormFieldErrorMessage'
import PasswordVisibilityButton from '@/components/PasswordVisibilityButton'
import { dataTestIdNames } from '@/library/constants'
import { SignInSchema } from '@/library/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

export type SignInFormData = z.infer<typeof SignInSchema>

export type Props = {
	onSubmit: (data: SignInFormData) => Promise<void>
	isSubmitting: boolean
	errorMessage: string
}

export default function SignInForm(props: Props) {
	const [showPassword, setShowPassword] = useState(false)
	const {
		register,
		trigger,
		handleSubmit,
		formState: {
			errors: { email: emailError, password: passwordError },
		},
	} = useForm<SignInFormData>({
		resolver: zodResolver(SignInSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
		},
	})

	return (
		<form onSubmit={handleSubmit(props.onSubmit)} className="flex flex-col gap-y-4">
			<div>
				<div className="mb-1">
					<label htmlFor="email">Email</label>
					<FormFieldErrorMessage error={emailError} />
				</div>
				<input
					{...register('email', {
						onChange: emailError ? () => trigger('email') : undefined,
					})}
					id="email"
					type="email"
					autoComplete="work email"
					aria-invalid={emailError ? 'true' : 'false'}
					data-test-id={dataTestIdNames.signIn.emailInput}
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
						data-test-id={dataTestIdNames.signIn.passwordInput}
						id="password"
						type={showPassword ? 'text' : 'password'}
						autoComplete="current-password"
						aria-invalid={passwordError ? 'true' : 'false'}
						{...register('password', {
							onChange: passwordError ? () => trigger('password') : undefined,
						})}
						className="w-full tracking-wide"
					/>
					<PasswordVisibilityButton
						showPassword={showPassword} //
						onClick={() => setShowPassword(!showPassword)}
					/>
				</div>
			</div>

			{props.errorMessage && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{props.errorMessage}</div>}

			<SubmitButton
				dataTestId={dataTestIdNames.signIn.submitButton} //
				formReady={true}
				isSubmitting={props.isSubmitting}
				content="Sign in"
				classes="mt-4"
			/>
		</form>
	)
}
