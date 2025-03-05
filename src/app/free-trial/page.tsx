'use client'
import PageContainer from '@/components/PageContainer'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { generateRandomString } from '@/library/utilities'
import { useUser } from '@/providers/user'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '../api/authentication/create-account/route'

// Important enhancement ToDo: confirm password input, hide password toggle, strong password

export default function CreateAccountPage() {
	const router = useRouter()
	const { setUser } = useUser()
	const [errorMessage, setErrorMessage] = useState('')
	const randomString = generateRandomString()
	const preFillFormForManualTesting = false
	const [formData, setFormData] = useState<CreateAccountPOSTbody>({
		firstName: preFillFormForManualTesting ? randomString : '',
		lastName: preFillFormForManualTesting ? randomString : '',
		businessName: preFillFormForManualTesting ? randomString : '',
		slug: preFillFormForManualTesting ? randomString : '',
		email: preFillFormForManualTesting ? `${randomString}@gmail.com` : '',
		password: preFillFormForManualTesting ? randomString : '',
	})

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setErrorMessage('')

		try {
			const { message, user }: CreateAccountPOSTresponse = await (
				await fetch(apiPaths.authentication.createAccount, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				})
			).json()
			logger.debug(message, user)

			if (user) {
				setUser(user)
				router.push('/dashboard')
			} else {
				setErrorMessage(message)
			}
			return
		} catch (error) {
			logger.error(error)
			setErrorMessage('Sorry something went wrong')
		}
	}

	return (
		<PageContainer>
			<div className="max-w-md mx-auto mt-8 p-6">
				<h1>Start your 30-day free trial</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
					<div>
						<label htmlFor="firstName" className="block mb-1">
							First name
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountFirstNameInput}
							id="firstName"
							type="text"
							value={formData.firstName}
							autoComplete="given-name"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									firstName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="lastName" className="block mb-1">
							Last name
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountLastNameInput}
							id="lastName"
							type="text"
							value={formData.lastName}
							autoComplete="family-name"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									lastName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="businessName" className="block mb-1">
							Business name
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountBusinessNameInput}
							id="businessName"
							type="text"
							value={formData.businessName}
							autoComplete="company name"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									businessName: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>
					{/* Optimisation ToDo: add honeypot */}
					<div>
						<label htmlFor="email" className="block mb-1">
							Email
						</label>
						<input
							data-test-id={dataTestIdNames.createAccountEmailInput}
							id="email"
							type="email"
							value={formData.email}
							autoComplete="work email"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
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
							data-test-id={dataTestIdNames.createAccountPasswordInput}
							id="password"
							type="password"
							value={formData.password}
							autoComplete="current-password"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									password: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					{errorMessage && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{errorMessage}</div>}
					<button data-test-id={dataTestIdNames.createAccountSubmitButton} type="submit" className="button-primary inline-block w-full">
						Start free trial
					</button>
				</form>
				<div className="flex justify-center gap-x-2 mt-6">
					<p>Already a member?</p>
					<Link href="/sign-in" className="link-secondary">
						Sign in instead
					</Link>
				</div>
			</div>
		</PageContainer>
	)
}
