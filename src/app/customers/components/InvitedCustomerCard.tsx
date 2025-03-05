import { formatTimeAndDate } from '@/library/utilities'
import type { BrowserSafeInvitationSent } from '@/types'
import clsx from 'clsx'

export default function InvitedCustomerCard({
	invitedCustomer,
	zebraStripe,
}: { invitedCustomer: BrowserSafeInvitationSent; zebraStripe: boolean }) {
	return (
		<div
			className={clsx(
				'flex flex-col gap-y-4 w-full border-2 rounded-xl p-3 max-w-md',
				zebraStripe ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200',
			)}
		>
			<h3 className="font-medium mb-2">{invitedCustomer.obfuscatedEmail}</h3>
			<div className="flex flex-col gap-y-1">
				<span className="text-zinc-600">Invitation sent</span>
				<span>{formatTimeAndDate(invitedCustomer.lastEmailSentDate)}</span>
			</div>
			<div className="flex flex-col gap-y-1">
				<span className="text-zinc-600">Expiry</span>
				<span>{formatTimeAndDate(invitedCustomer.expirationDate)}</span>
			</div>
		</div>
	)
}
