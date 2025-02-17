'use client'
import { CheckboxIcon } from '@/components/Icons'
import PageContainer from '@/components/PageContainer'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { generateRandomString } from '@/library/utilities'
import { useAuthorisation } from '@/providers/authorisation'
import type { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '@/types/api/authentication/create-account'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export default function CreateAccountPage() {
	const router = useRouter()
	const { setClientSafeUser } = useAuthorisation()
	const [error, setError] = useState('')
	const randomString = generateRandomString()
	const preFillFormForManualTesting = false
	const [formData, setFormData] = useState<CreateAccountPOSTbody>({
		firstName: preFillFormForManualTesting ? randomString : '',
		lastName: preFillFormForManualTesting ? randomString : '',
		businessName: preFillFormForManualTesting ? randomString : '',
		email: preFillFormForManualTesting ? `${randomString}@gmail.com` : '',
		password: preFillFormForManualTesting ? randomString : '',
		staySignedIn: preFillFormForManualTesting,
	})

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setError('')

		try {
			const response = await fetch(apiPaths.authentication.createAccount, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			const { message, user }: CreateAccountPOSTresponse = await response.json()
			logger.debug(message, user)

			if (!response.ok) {
				setError(message)
			}

			if (user) {
				setClientSafeUser(user)
				router.push('/dashboard')
			}

			return
		} catch (error) {
			logger.error(error)
			setError('Sorry something went wrong')
		}
	}

	return (
		<PageContainer>
			<div className="max-w-md mx-auto mt-8 p-6">
				<h1>Start your 31-day free trial</h1>
				{error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}
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
					{/* ToDo: add honeypot */}
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
					<div className="flex gap-3">
						<div className="flex h-6 shrink-0 items-center">
							<div className="group grid size-4 grid-cols-1">
								<input
									data-test-id={dataTestIdNames.createAccountStaySignedInCheckbox}
									id="stay-signed-in"
									name="stay-signed-in"
									type="checkbox"
									checked={formData.staySignedIn}
									onChange={(event) =>
										setFormData((prev) => ({
											...prev,
											staySignedIn: event.target.checked,
										}))
									}
								/>
								<CheckboxIcon />
							</div>
						</div>
						<label htmlFor="stay-signed-in" className="block text-sm/6 text-gray-900">
							Stay signed in
						</label>
					</div>
					<button data-test-id={dataTestIdNames.createAccountSubmitButton} type="submit" className="button-primary inline-block w-full">
						Start free trial
					</button>
				</form>
			</div>
		</PageContainer>
	)
}
