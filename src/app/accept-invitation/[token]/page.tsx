'use client'
import type { InvitationsTokenPATCHresponse } from '@/app/api/invitations/[token]/route'
import Spinner from '@/components/Spinner'
import { apiRequest } from '@/library/utilities/public'
import { useNotifications } from '@/providers/notifications'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import CompleteRegistrationForm from './components/CompleteRegistrationForm'

export default function AcceptInvitationPage() {
	const { token } = useParams<{ token: string }>()

	// Prevent repeat fetching in development
	const hasCheckedInvitation = useRef(false)

	const [status, setStatus] = useState<'checking' | 'please provide details' | 'error' | 'relationship exists'>('checking')
	const [errorMessage, setErrorMessage] = useState('')
	const [senderBusinessName, setSenderBusinessName] = useState('')
	const { setMerchantMode } = useUi()
	const { setUser, setConfirmedMerchants } = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()

	// Main ToDo: Make this a great experience

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
			const { pleaseProvideDetails, senderDetails, createdUser, existingUser } = await apiRequest<InvitationsTokenPATCHresponse>({
				basePath: '/invitations',
				segment: token,
				method: 'PATCH',
			})

			setMerchantMode(false) // Not sure about this??

			if (createdUser || existingUser) {
				setUser(createdUser || existingUser || null)

				if (senderDetails) {
					setSenderBusinessName(senderDetails.businessName)
					setConfirmedMerchants((prevMerchants) => [...(prevMerchants || []), senderDetails])
				}

				createNotification({
					level: 'success',
					title: 'Success',
					message: `You are now a confirmed customer of ${senderDetails?.businessName}`,
				})
				router.push('/orders')
			}

			if (pleaseProvideDetails) {
				setStatus('please provide details')
			}
		} catch {
			setStatus('error')
			setErrorMessage('An error occurred while processing your invitation')
		}
	}

	if (status === 'checking') {
		return (
			<div className="max-w-md mx-auto mt-8 border rounded-lg">
				<p className="text-center">Processing invitation...</p>
				<Spinner />
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className="max-w-md mx-auto mt-8 border rounded-lg bg-red-50 text-red-700">
				<p className="text-center">{errorMessage}</p>
			</div>
		)
	}

	if (status === 'relationship exists') {
		return (
			<p className="max-w-md mx-auto mt-8 border rounded-lg bg-green-50 text-green-700">
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
