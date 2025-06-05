import type { FormattedOrder, NonEmptyArray } from '@/types'
import { PDFDocument } from 'pdf-lib'
import { createPDF } from './createPDF'

export type CreatePDFsInput = NonEmptyArray<FormattedOrder>

export async function createPDFs(orders: CreatePDFsInput) {
	const pdfDoc = await PDFDocument.create()

	for (const order of orders) {
		await createPDF(pdfDoc, order)
	}

	const pdfBytes = await pdfDoc.save()
	return Buffer.from(pdfBytes)
}
