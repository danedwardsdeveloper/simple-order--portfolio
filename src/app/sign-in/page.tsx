'use client'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type { SignInPOSTbody, SignInPOSTresponse } from '../api/authentication/sign-in/route'

export default function SignInPage() {
	const { user, setUser } = useUser()
	const { setMerchantMode } = useUi()
	const router = useRouter()
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

			// Enhancement ToDO: change this so that it remembers the last used state/recorded preference
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
			{error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}
			<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
				<div>
					<label htmlFor="email" className="block mb-1">
						Email
					</label>
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
					<label htmlFor="password" className="block mb-1">
						Password
					</label>
					<input
						data-test-id={dataTestIdNames.signIn.passwordInput}
						id="password"
						type="password"
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
				</div>

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
