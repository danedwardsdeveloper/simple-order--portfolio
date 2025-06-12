'use client'
import type { InvitationsTokenPATCHbody, InvitationsTokenPATCHresponse } from '@/app/api/invitations/[token]/route'
import { useNotifications } from '@/components/providers/notifications'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import { apiRequest } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

// Important ToDo: If there's an error it removes the form (super awful UX!)

export default function CompleteRegistrationForm({ token }: { token: string }) {
	const { createNotification } = useNotifications()
	const { setMerchantMode } = useUi()
	const router = useRouter()
	const { setUser } = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [formData, setFormData] = useState<InvitationsTokenPATCHbody>({
		firstName: '',
		lastName: '',
		businessName: '',
		password: '',
	})

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsSubmitting(true)

		try {
			const { userMessage, senderDetails, createdUser } = await apiRequest<InvitationsTokenPATCHresponse, InvitationsTokenPATCHbody>({
				basePath: '/invitations',
				segment: token,
				method: 'PATCH',
				body: formData,
			})

			if (createdUser && senderDetails) {
				setMerchantMode(false)
				setUser(createdUser)
				createNotification({
					level: 'success',
					title: 'Success!',
					message: 'Account created',
				})
				router.push('/dashboard')
			} else {
				if (userMessage) setErrorMessage(userMessage)
			}
		} catch {
			setErrorMessage('An error occurred while submitting your details')
		} finally {
			setIsSubmitting(false)
		}
	}

	/*
	- Style the page properly
	- Welcome message & explanation
	- Use Zod
	- Disable the button until the form is completed properly
	- Password toggle button
	*/

	return (
		<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg">
			<h1 className="text-xl font-bold mb-4">Complete your registration</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
				<div>
					<label htmlFor="firstName">First name</label>
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
					<label htmlFor="lastName">Last name</label>
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
					<label htmlFor="businessName">Business name</label>
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
					<label htmlFor="password">Password</label>
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
