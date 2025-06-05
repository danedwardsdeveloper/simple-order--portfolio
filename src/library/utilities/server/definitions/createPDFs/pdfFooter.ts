import type { PDFPage } from 'pdf-lib'
import { pdfColours, pdfFonts } from './constants'

export function addPdfFooter(page: PDFPage) {
	const { width } = page.getSize()
	const marginBottom = 80
	const { base } = pdfFonts
	const { zinc, blue } = pdfColours

	// Horizontal line
	page.drawLine({
		start: { x: 50, y: marginBottom + 40 },
		end: { x: width - 50, y: marginBottom + 40 },
		thickness: 1,
		color: zinc[500],
	})

	page.drawText('Simple Order', {
		x: 50,
		y: marginBottom + 10,
		size: base,
		color: blue[600],
	})

	page.drawText('SimpleOrder.co.uk', {
		x: 50,
		y: marginBottom - 15,
		size: base - 2,
		color: zinc[700],
	})

	page.drawText('Wholesale order management made simple.', {
		x: 50,
		y: marginBottom - 35,
		size: base - 2,
		color: zinc[500],
	})
}
