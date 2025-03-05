'use client'

import type { InvitationsTokenPATCHbody, InvitationsTokenPATCHresponse } from '@/app/api/invitations/[token]/route'
import { apiPaths } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { useNotifications } from '@/providers/notifications'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import urlJoin from 'url-join'

// Important ToDo: If there's an error it removes the form (super awful UX!)

export default function CompleteRegistrationForm({ token }: { token: string }) {
	const { createNotification } = useNotifications()
	const { setMerchantMode } = useUi()
	const router = useRouter()
	const { setUser } = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [formData, setFormData] = useState<InvitationsTokenPATCHbody>({
		firstName: 'Charlotte',
		lastName: 'York',
		businessName: "Charlotte's Harlots",
		slug: 'charlottes-harlots',
		password: 'securePassword123',
	})

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsSubmitting(true)

		try {
			const { message, senderDetails, createdUser }: InvitationsTokenPATCHresponse = await (
				await fetch(urlJoin(dynamicBaseURL, apiPaths.invitations.base, token), {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				})
			).json()

			if (message === 'success' && createdUser && senderDetails) {
				setMerchantMode(false)
				setUser(createdUser)
				createNotification({
					level: 'success',
					title: 'Success!',
					message: 'Account created',
				})
				router.push('/dashboard')
			} else {
				setErrorMessage(message)
			}
		} catch {
			setErrorMessage('An error occurred while submitting your details')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg">
			<h1 className="text-xl font-bold mb-4">Complete Your Registration</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<input
						type="text"
						placeholder="First Name"
						required
						autoComplete="given-name"
						className="w-full p-2 border rounded"
						value={formData.firstName}
						onChange={(event) =>
							setFormData((prev) => ({
								...prev,
								firstName: event.target.value,
							}))
						}
					/>
				</div>
				<div>
					<input
						type="text"
						placeholder="Last Name"
						required
						autoComplete="family-name"
						className="w-full p-2 border rounded"
						value={formData.lastName}
						onChange={(event) =>
							setFormData((prev) => ({
								...prev,
								lastName: event.target.value,
							}))
						}
					/>
				</div>
				<div>
					<input
						type="text"
						placeholder="Business Name"
						required
						autoComplete="organization"
						className="w-full p-2 border rounded"
						value={formData.businessName}
						onChange={(event) =>
							setFormData((prev) => ({
								...prev,
								businessName: event.target.value,
							}))
						}
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="Choose Password"
						required
						autoComplete="new-password"
						className="w-full p-2 border rounded"
						value={formData.password}
						onChange={(event) =>
							setFormData((prev) => ({
								...prev,
								password: event.target.value,
							}))
						}
					/>
				</div>

				<button
					type="submit"
					onClick={handleSubmit}
					disabled={isSubmitting}
					className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Create account
				</button>
			</form>
			{errorMessage && <p className="text-red-600">{errorMessage}</p>}
		</div>
	)
}
