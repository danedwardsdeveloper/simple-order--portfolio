import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { and, equals } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct, UserMessages } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryDELETEresponse {
	userMessage?: UserMessages
	developmentMessage?: string
	softDeletedProduct?: BrowserSafeMerchantProduct
}

export type InventoryDELETEsegment = string

type InventoryDELETEparams = { itemId: InventoryDELETEsegment }

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<InventoryDELETEparams> },
): Promise<NextResponse<InventoryDELETEresponse>> {
	const { developmentLogger } = initialiseDevelopmentLogger('/inventory/admin/[itemId]', 'DELETE')

	try {
		const resolvedParams = await params
		const itemId = Number.parseInt(resolvedParams.itemId)

		if (!itemId) {
			const developmentMessage = developmentLogger('productToDeleteId missing')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			const developmentMessage = developmentLogger(accessDenied.message)
			return NextResponse.json({ developmentMessage }, { status: accessDenied.status })
		}

		const [softDeletedProduct]: BrowserSafeMerchantProduct[] = await database
			.update(products)
			.set({ deletedAt: new Date() })
			.where(and(equals(products.id, itemId), equals(products.ownerId, dangerousUser.id)))
			.returning({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})

		if (!softDeletedProduct) {
			const developmentMessage = developmentLogger("product doesn't exist or isn't yours to delete")
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		const developmentMessage = developmentLogger(`Successfully soft deleted ${softDeletedProduct.name}`, { level: 'level3success' })
		return NextResponse.json({ softDeletedProduct, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
