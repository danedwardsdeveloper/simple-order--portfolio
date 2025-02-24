'use client'
import { dataTestIdNames } from '@/library/constants'
import { useUser } from '@/providers/user'

export default function ConfirmEmailMessage() {
	const { user } = useUser()

	if (!user || user.emailConfirmed) return null

	return (
		<p
			data-test-id={dataTestIdNames.pleaseConfirmYourEmailMessage}
			className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300"
		>{`Please confirm your email by clicking the link in the email sent to ${user.email}. Remember to check your junk folder.`}</p>
	)
}
