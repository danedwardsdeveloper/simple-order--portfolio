'use client'
import type { InvitationsTokenPATCHresponse } from '@/app/api/invitations/[token]/route'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { useNotifications } from '@/providers/notifications'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import urlJoin from 'url-join'
import CompleteRegistrationForm from '../components/CompleteRegistrationForm'

export default function AcceptInvitationPage() {
	const { token } = useParams<{ token: string }>()
	const hasCheckedInvitation = useRef(false) // Prevent double fetching in development
	const [status, setStatus] = useState<'checking' | 'please provide details' | 'error' | 'relationship exists'>('checking')
	const [errorMessage, setErrorMessage] = useState('')
	const [senderBusinessName, setSenderBusinessName] = useState('')
	const { setMerchantMode } = useUi()
	const { setUser, setConfirmedMerchants } = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()

	useEffect(() => {
		if (!hasCheckedInvitation.current) {
			checkInvitation()
			hasCheckedInvitation.current = true
		}
	}, [])

	async function checkInvitation() {
		if (!token) return null

		try {
			setStatus('checking')
			const { message, senderDetails, createdUser, existingUser }: InvitationsTokenPATCHresponse = await (
				await fetch(urlJoin(dynamicBaseURL, apiPaths.invitations.base, token), {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({}),
				})
			).json()

			setMerchantMode(false)
			if (createdUser || existingUser) setUser(createdUser || existingUser || null)
			if (senderDetails) {
				setSenderBusinessName(senderDetails.businessName)
				setConfirmedMerchants((prevMerchants) => [...(prevMerchants || []), senderDetails])
			}

			switch (message) {
				case 'success':
					createNotification({
						level: 'success',
						title: 'Success',
						message: `You are now a confirmed customer of ${senderDetails?.businessName}`,
					})
					router.push('/orders')
					break
				case 'please provide details':
					setStatus('please provide details')
					break
				case 'relationship exists':
					setStatus('relationship exists')
					break
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

	if (status === 'relationship exists') {
		return (
			<p className="max-w-md mx-auto mt-8 p-4 border rounded-lg bg-green-50 text-green-700">
				{senderBusinessName
					? `This invitation from ${senderBusinessName} has already been accepted`
					: 'You are already a confirmed customer of this merchant'}
			</p>
		)
	}

	if (status === 'please provide details') {
		return <CompleteRegistrationForm token={token} />
	}

	return null
}
