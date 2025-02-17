'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import urlJoin from 'url-join'

import { dynamicBaseURL } from '@/library/environment/publicVariables'

import { CheckboxIcon } from '@/components/Icons'

import type { InvitationsAcceptPOSTbody } from '@/app/api/invitations/accept/[token]/route'
import { apiPaths } from '@/library/constants/definitions/apiPaths'

export default function AcceptInvitationPage() {
	const { token } = useParams<{ token: string }>()
	const url = urlJoin(dynamicBaseURL, apiPaths.invitations.accept, token)

	const [status, setStatus] = useState<'checking' | 'needsDetails' | 'success' | 'error'>('checking')
	const [errorMessage, setErrorMessage] = useState('')
	const [formData, setFormData] = useState<InvitationsAcceptPOSTbody>({
		firstName: 'James',
		lastName: 'Mondacoup',
		businessName: 'James Mondacoup Hothouse Flowers Limited',
		password: 'securePassword123',
		staySignedIn: false,
	})

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		checkInvitation()
	}, [])

	const checkInvitation = async () => {
		if (!token) return null
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(''),
			})

			if (response.status === 201 || response.status === 200) {
				setStatus('success')
			} else if (response.status === 422) {
				setStatus('needsDetails')
			} else {
				const data = await response.json()
				setStatus('error')
				setErrorMessage(data.message)
			}
		} catch {
			setStatus('error')
			setErrorMessage('An error occurred while processing your invitation')
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		setStatus('checking')

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (response.status === 201 || response.status === 200) {
				setStatus('success')
			} else {
				const data = await response.json()
				setStatus('error')
				setErrorMessage(data.message)
			}
		} catch {
			setStatus('error')
			setErrorMessage('An error occurred while submitting your details')
		}
	}

	if (status === 'checking') {
		return (
			<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg">
				<p className="text-center">Processing invitation...</p>
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg bg-red-50 text-red-700">
				<p className="text-center">{errorMessage}</p>
			</div>
		)
	}

	if (status === 'success') {
		return (
			<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg bg-green-50 text-green-700">
				<p className="text-center">Successfully connected! You can now close this window.</p>
			</div>
		)
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

				<div className="flex gap-3">
					<div className="flex h-6 shrink-0 items-center">
						<div className="group grid size-4 grid-cols-1">
							<input
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

				<button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					Complete Registration
				</button>
			</form>
		</div>
	)
}
