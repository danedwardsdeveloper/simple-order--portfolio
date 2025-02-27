import { dataTestIdNames } from '@/library/constants'

export default function PleaseConfirmYourEmailMessage({ email }: { email: string }) {
	return (
		<p
			data-test-id={dataTestIdNames.pleaseConfirmYourEmailMessage}
			className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300"
		>{`Please confirm your email by clicking the link in the email sent to ${email}. Remember to check your junk folder.`}</p>
	)
}
