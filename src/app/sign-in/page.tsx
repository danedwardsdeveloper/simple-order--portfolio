'use client'
import { useUi } from '@/components/providers/ui'
import { updateUserData, useUser } from '@/components/providers/user'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { apiRequestNew } from '@/library/utilities/public'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type { SignInPOSTbody, SignInPOSTresponse } from '../api/authentication/sign-in/route'

export default function SignInPage() {
	const {
		user,
		setUser,
		setConfirmedCustomers,
		setConfirmedMerchants,
		setInvitationsSent,
		setInvitationsReceived,
		setOrdersMade,
		setOrdersReceived,
		setInventory,
	} = useUser()
	const { setMerchantModeFromRoles } = useUi()
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState<SignInPOSTbody>({
		email: '',
		password: '',
	})
	const [error, setError] = useState('')

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		setError('')

		try {
			const { userMessage, userData } = await apiRequestNew<SignInPOSTresponse, SignInPOSTbody>({
				basePath: '/authentication/sign-in',
				method: 'POST',
				body: formData,
			})

			if (userData) {
				updateUserData(userData, {
					setUser,
					setInventory,
					setConfirmedCustomers,
					setConfirmedMerchants,
					setInvitationsReceived,
					setInvitationsSent,
					setOrdersMade,
					setOrdersReceived,
				})

				setMerchantModeFromRoles(userData.user?.roles)

				router.push('/dashboard')
				return
			}

			if (userMessage) {
				setError(userMessage)
			}
		} catch {
			setError(userMessages.serverError)
		}
	}

	if (user) {
		return <p className="text-green-700">Already signed in as {user.businessName}</p>
	}

	return (
		<div className="max-w-md mx-auto mt-8">
			<h1>Sign In</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
				<div>
					<label htmlFor="email">Email</label>
					<input
						data-test-id={dataTestIdNames.signIn.emailInput}
						id="email"
						type="email"
						value={formData.email}
						autoComplete="work email"
						onChange={(event) =>
							setFormData((previous) => ({
								...previous,
								email: event.target.value,
							}))
						}
						required
						className="w-full"
					/>
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<div className="relative">
						<input
							data-test-id={dataTestIdNames.signIn.passwordInput}
							id="password"
							type={showPassword ? 'text' : 'password'}
							value={formData.password}
							autoComplete="current-password"
							onChange={(event) =>
								setFormData((previous) => ({
									...previous,
									password: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
						<button
							type="button"
							aria-label="Toggle password visibility"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-orange-400 focus-visible:outline-2 focus-visible:rounded"
							tabIndex={0}
						>
							{showPassword ? <EyeIcon className="text-blue-600 size-6" /> : <EyeSlashIcon className="text-blue-600 size-6" />}
						</button>
						<div aria-live="polite" id="password-text" className="sr-only">
							{showPassword ? 'Password visible' : 'Password hidden'}
						</div>
					</div>
				</div>

				{error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}

				<button data-test-id={dataTestIdNames.signIn.submitButton} type="submit" className="mt-4 button-primary inline-block w-full py-2">
					Sign In
				</button>
			</form>
			<div className="mt-8 text-center">
				<p>
					{`Don't have an account? `}

					<Link href="/free-trial" className="link-primary">
						Start a free trial instead
					</Link>
				</p>
			</div>
		</div>
	)
}
