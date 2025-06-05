import logger from '@/library/logger'
import { createFileName } from '@/library/utilities/public/definitions/createFileName'
import { type CreatePDFsInput, createPDFs } from '@/library/utilities/server'
import type { FetchHeaders } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

export type PrintPOSTbody = { orders: CreatePDFsInput }

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const { orders }: PrintPOSTbody = await request.json()
		const pdfBuffer = await createPDFs(orders)
		const fileName = createFileName(orders)

		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="${fileName}"`,
			} satisfies FetchHeaders,
		})
	} catch (error) {
		logger.error(error instanceof Error ? error.message : 'Unknown error')
		return new NextResponse('PDF generation failed', { status: 500 })
	}
}
