import { mergeClasses } from '@/library/utilities'
import type { BrowserSafeCustomerProfile } from '@/types'

export default function ConfirmedCustomerCard({
	confirmedCustomer,
	zebraStripe,
}: { confirmedCustomer: BrowserSafeCustomerProfile; zebraStripe: boolean }) {
	return (
		<div
			className={mergeClasses(
				'flex flex-col w-full border-2 rounded-xl p-3 max-w-md',
				zebraStripe ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200',
			)}
		>
			<h3 className="font-medium mb-2">{confirmedCustomer.businessName}</h3>
			<p>{confirmedCustomer.obfuscatedEmail}</p>
		</div>
	)
}
