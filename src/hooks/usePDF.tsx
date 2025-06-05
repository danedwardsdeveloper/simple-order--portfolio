import type { PrintPOSTbody } from '@/app/api/orders/print/post'
import logger from '@/library/logger'
import { createFileName } from '@/library/utilities/public/definitions/createFileName'
import type { FetchHeaders, FormattedOrder, NonEmptyArray } from '@/types'
import { useState } from 'react'

export function usePDF(orders: NonEmptyArray<FormattedOrder>) {
	const [isLoading, setLoading] = useState(false)

	async function fetchPDF() {
		try {
			setLoading(true)

			// Don't use apiResponse here as it doesn't work with blobs
			const response = await fetch('/api/orders/print', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' } satisfies FetchHeaders,
				body: JSON.stringify({ orders } satisfies PrintPOSTbody),
			})

			if (response.ok) {
				return await response.blob()
			}
			throw new Error('PDF fetch failed')
		} catch (error) {
			logger.error(error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	async function openPDF() {
		const blob = await fetchPDF()
		const url = URL.createObjectURL(blob)
		window.open(url, '_blank')
	}

	async function downloadPDF() {
		const blob = await fetchPDF()
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = createFileName(orders)
		link.click()

		URL.revokeObjectURL(url)
	}

	return { openPDF, downloadPDF, isLoading }
}
