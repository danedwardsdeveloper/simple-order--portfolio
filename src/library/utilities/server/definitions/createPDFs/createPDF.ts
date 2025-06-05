import type { FormattedOrder } from '@/types'
import type { PDFDocument } from 'pdf-lib'
import { pdfFonts } from './constants'
import { addPdfFooter } from './pdfFooter'

export async function createPDF(pdfDoc: PDFDocument, order: FormattedOrder) {
	const page = pdfDoc.addPage()
	const { height } = page.getSize()
	const { base, medium, large } = pdfFonts

	const yStart = height - 50

	page.drawText(order.idString, {
		x: 50,
		y: yStart,
		size: large,
	})

	page.drawText(order.requestedDeliveryDate.formatted, {
		x: 50,
		y: yStart - 35,
		size: medium,
	})

	page.drawText(order.customerName, {
		x: 50,
		y: yStart - 65,
		size: medium,
	})

	let itemY = yStart - 120

	for (const item of order.products) {
		page.drawText(`${item.name} x${item.quantity} - ${item.itemPrice}`, {
			x: 50,
			y: itemY,
			size: base,
		})
		itemY -= 25
	}

	page.drawText(`Total with VAT: ${order.totalWithVAT}`, {
		x: 50,
		y: itemY - 20,
		size: large,
	})

	itemY -= 25

	page.drawText(`Total without VAT: ${order.totalWithoutVAT}`, {
		x: 50,
		y: itemY - 20,
		size: large,
	})

	addPdfFooter(page)
}
