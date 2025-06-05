import { orderStatusNames } from '@/library/constants'
import { capitaliseFirstLetter } from '@/library/utilities/public'
import type { OrderStatusName } from '@/types'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export default function OrderStatusIcon({ status }: { status: OrderStatusName }) {
	function resolvedIcon() {
		switch (status) {
			case orderStatusNames.Pending:
				return <Clock className="size-4 text-yellow-500" />
			case orderStatusNames.Completed:
				return <CheckCircle className="size-4 text-green-500" />
			case orderStatusNames.Cancelled:
				return <XCircle className="size-4 text-red-500" />
			default:
				return null
		}
	}

	return (
		<span className="flex items-center gap-x-2">
			{resolvedIcon()}
			{capitaliseFirstLetter(status)}
		</span>
	)
}
