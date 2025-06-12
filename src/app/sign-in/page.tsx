'use client'
import FormFooter from '@/components/FormFooter'
import MessageContainer from '@/components/MessageContainer'
import { useUi } from '@/components/providers/ui'
import { updateUserData, useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SignInPOSTbody, SignInPOSTresponse } from '../api/authentication/sign-in/route'
import SignInForm, { type SignInFormData } from './SignInForm'

export default function SignInPage() {
	const {
		user,
		setUser,
		setConfirmedCustomers,
		setConfirmedMerchants,
		setInvitationsSent,
		setInvitationsReceived,
		setOrdersMade,
		setOrdersReceived,
		setInventory,
	} = useUser()
	const { setMerchantModeFromRoles } = useUi()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	async function handleSubmit(data: SignInFormData) {
		setIsSubmitting(true)
		setErrorMessage('')

		try {
			const body: SignInPOSTbody = {
				email: data.email.trim(),
				password: data.password.trim(),
			}

			const { ok, userMessage, userData } = await apiRequest<SignInPOSTresponse, SignInPOSTbody>({
				basePath: '/authentication/sign-in',
				method: 'POST',
				body,
			})

			if (ok) {
				// leave isSubmitting as true on success or you get weird glitches

				updateUserData(userData, {
					setUser,
					setInventory,
					setConfirmedCustomers,
					setConfirmedMerchants,
					setInvitationsReceived,
					setInvitationsSent,
					setOrdersMade,
					setOrdersReceived,
				})

				setMerchantModeFromRoles(userData.user?.roles)

				router.push('/dashboard')
				return
			}

			if (userMessage) {
				setErrorMessage(userMessage)
				setIsSubmitting(false)
			}
		} catch {
			setErrorMessage(userMessages.serverError)
			setIsSubmitting(false)
		}
	}

	if (user && !isSubmitting) {
		return (
			<MessageContainer
				borderColour="border-emerald-300" //
			>
				Already signed in as {user.businessName}
			</MessageContainer>
		)
	}

	return (
		<div className="max-w-md mx-auto mt-8">
			<h1>Sign In</h1>
			<SignInForm
				onSubmit={handleSubmit} //
				isSubmitting={isSubmitting}
				errorMessage={errorMessage}
			/>
			<FormFooter
				text="Don't have an account?" //
				linkText="Start a free trial instead"
				href="/free-trial"
			/>
		</div>
	)
}
