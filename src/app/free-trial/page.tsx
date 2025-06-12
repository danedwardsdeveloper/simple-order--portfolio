'use client'
import FormFooter from '@/components/FormFooter'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import { serviceConstraints } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '../api/authentication/create-account/route'
import FreeTrialForm, { type FreeTrialFormData } from './FreeTrialForm'

export default function CreateAccountPage() {
	const router = useRouter()
	const { setUser } = useUser()
	const { setMerchantMode } = useUi()
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(data: FreeTrialFormData, event?: FormEvent) {
		event?.preventDefault()
		setErrorMessage('')
		setIsSubmitting(true)

		try {
			const requestBody: CreateAccountPOSTbody = {
				firstName: data.firstName.trim(),
				lastName: data.lastName.trim(),
				businessName: data.businessName.trim(),
				email: data.email.trim(),
				password: data.password.trim(),
			}

			const { userMessage, user } = await apiRequest<CreateAccountPOSTresponse, CreateAccountPOSTbody>({
				basePath: '/authentication/create-account',
				method: 'POST',
				body: requestBody,
			})

			if (user) {
				// Must be merchant mode for new free-trials
				setMerchantMode(true)
				setUser(user)
				router.push('/dashboard')
			}

			if (userMessage) {
				setErrorMessage(userMessage)
			}
			return
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="max-w-md mx-auto mt-8 md:p-6">
			<h1 className="text-pretty">Start your {serviceConstraints.trialLength}-day free trial</h1>
			<FreeTrialForm
				onSubmit={handleSubmit} //
				isSubmitting={isSubmitting}
				errorMessage={errorMessage}
			/>
			<FormFooter
				text="Already a member?" //
				linkText="Sign in instead"
				href="/sign-in"
			/>
		</div>
	)
}
