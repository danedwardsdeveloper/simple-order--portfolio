'use client'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type { SignInPOSTbody, SignInPOSTresponse } from '../api/authentication/sign-in/route'

export default function SignInPage() {
	const { user, setUser } = useUser()
	const { setMerchantMode } = useUi()
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
			const { message, user }: SignInPOSTresponse = await (
				await fetch(apiPaths.authentication.signIn, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				})
			).json()

			if (message !== 'success') {
				setError('Sorry, something went wrong')
			}

			if (!user) {
				setError('No account found with this email')
				return
			}

			setUser(user)

			if (user.roles === 'both' || user.roles === 'merchant') {
				setMerchantMode(true)
			} else {
				setMerchantMode(false)
			}

			router.push('/dashboard')
			return
		} catch (error) {
			logger.error(error)
			setError('Sorry something went wrong')
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
							className="absolute right-3 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-orange-400 focus-visible:outline-2 focus-visible:outline focus-visible:rounded"
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
