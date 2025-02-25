import { apiPaths, type authenticationMessages, basicMessages, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct, TokenMessages } from '@/types'
import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryDELETEresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof authenticationMessages.noActiveTrialSubscription
		| TokenMessages
		| 'productToDeleteId missing'
		| "product doesn't exist or isn't yours to delete"
	softDeletedProduct?: BrowserSafeMerchantProduct
}

export interface InventoryDELETEbody {
	productToDeleteId: number
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: number }> },
): Promise<NextResponse<InventoryDELETEresponse>> {
	try {
		const itemId = (await params).itemId

		if (!itemId) {
			return NextResponse.json({ message: 'productToDeleteId missing' }, { status: httpStatus.http400badRequest })
		}

		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ message: 'user not found' }, { status: httpStatus.http404notFound })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser.cachedTrialExpired)

		if (!activeSubscriptionOrTrial) {
			return NextResponse.json({ message: 'no active subscription or trial' }, { status: httpStatus.http401unauthorised })
		}

		const [softDeletedProduct]: BrowserSafeMerchantProduct[] = await database
			.update(products)
			.set({ deletedAt: new Date() })
			.where(and(eq(products.id, itemId), eq(products.ownerId, extractedUserId)))
			.returning({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})

		if (!softDeletedProduct) {
			return NextResponse.json({ message: "product doesn't exist or isn't yours to delete" }, { status: httpStatus.http401unauthorised })
		}

		return NextResponse.json({ message: basicMessages.success, softDeletedProduct }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.admin.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
