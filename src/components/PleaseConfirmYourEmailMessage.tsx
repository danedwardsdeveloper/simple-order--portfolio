import { dataTestIdNames } from '@/library/constants'
import MessageContainer from './MessageContainer'

// This message is displayed on /dashboard and /customers
export default function PleaseConfirmYourEmailMessage({ email }: { email: string }) {
	return (
		<MessageContainer borderColour="border-orange-300">
			<p data-test-id={dataTestIdNames.pleaseConfirmYourEmailMessage}>
				{`Please confirm your email by clicking the link in the email sent to ${email}. Remember to check your junk folder.`}
			</p>
		</MessageContainer>
	)
}
