import { formatTimeAndDate, mergeClasses } from '@/library/utilities/public'
import type { BrowserSafeInvitationSent } from '@/types'

export default function PendingInvitationCard({
	invitedCustomer,
	zebraStripe,
}: { invitedCustomer: BrowserSafeInvitationSent; zebraStripe: boolean }) {
	return (
		<div
			className={mergeClasses(
				'flex flex-col gap-y-4 w-full border-2 rounded-xl p-3 max-w-md',
				zebraStripe ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200',
			)}
		>
			<h3 className="font-medium mb-2">{invitedCustomer.obfuscatedEmail}</h3>
			<p>Expires {formatTimeAndDate(invitedCustomer.expirationDate)}</p>
		</div>
	)
}
