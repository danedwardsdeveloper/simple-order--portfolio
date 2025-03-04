'use client'
import type { InvitationsTokenPATCHresponse } from '@/app/api/invitations/[token]/route'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import urlJoin from 'url-join'
import CompleteRegistrationForm from '../components/CompleteRegistrationForm'

export default function AcceptInvitationPage() {
	const { token } = useParams<{ token: string }>()
	const [status, setStatus] = useState<'checking' | 'please provide details' | 'success' | 'error'>('checking')
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		checkInvitation()
	}, [])

	async function checkInvitation() {
		if (!token) return null

		try {
			setStatus('checking')
			const { message }: InvitationsTokenPATCHresponse = await (
				await fetch(urlJoin(dynamicBaseURL, apiPaths.invitations.base, token), {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(token),
				})
			).json()

			switch (message) {
				case 'success':
					setStatus('success')
					break
				case 'please provide details':
					setStatus('please provide details')
					break
				// Enhancement ToDo: add edge case feedback
				case 'invitation not found':
				case 'missing fields':
				case 'server error':
				case 'token expired':
				case 'token invalid':
				case 'token missing':
				case 'user not found':
					setStatus('error')
					break
				default:
					setStatus('error')
					setErrorMessage('An error occurred while processing your invitation')
			}
		} catch {
			setStatus('error')
			setErrorMessage('An error occurred while processing your invitation')
		}
	}

	if (status === 'checking') {
		return (
			<div className="max-w-md mx-auto mt-8 p-4 border rounded-lg">
				<p className="text-center">Processing invitation...</p>
				<Spinner />
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
				{/* UX ToDo: This is awful */}
				<p className="text-center">Successfully connected! You can now close this window.</p>
			</div>
		)
	}

	if (status === 'please provide details') {
		return <CompleteRegistrationForm token={token} />
	}

	return null
}
