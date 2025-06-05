import Spinner from '@/components/Spinner'
import { usePDF } from '@/hooks/usePDF'
import type { FormattedOrder, NonEmptyArray } from '@/types'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { ArrowUpRightIcon } from 'lucide-react'

export function OpenPDFButton({ orders }: { orders: NonEmptyArray<FormattedOrder> }) {
	const { openPDF, isLoading } = usePDF(orders)

	return (
		<button type="button" onClick={openPDF} disabled={isLoading} className="flex justify-between items-center gap-x-1 link-primary">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					Open PDF <ArrowUpRightIcon className="size-5" />
				</>
			)}
		</button>
	)
}

export function DownloadPDFButton({ orders }: { orders: NonEmptyArray<FormattedOrder> }) {
	const { downloadPDF, isLoading } = usePDF(orders)

	return (
		<button type="button" onClick={downloadPDF} disabled={isLoading} className="flex justify-between items-center gap-x-1 link-primary">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					Download PDF <ArrowDownTrayIcon className="size-5" />
				</>
			)}
		</button>
	)
}
