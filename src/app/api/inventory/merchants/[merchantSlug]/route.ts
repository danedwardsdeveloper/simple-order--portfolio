import { apiPaths, authenticationMessages, basicMessages, httpStatus, relationshipMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkRelationship, checkUserExists } from '@/library/database/operations'
import { merchantProfiles, products } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeCustomerProduct, TokenMessages } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryMerchantsMerchantSlugGETresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| TokenMessages
		| typeof authenticationMessages.merchantNotFound
		| 'not a customer of this merchant'
		| typeof relationshipMessages.relationshipMissing
	availableProducts?: BrowserSafeCustomerProduct[]
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ merchantSlug: string }> },
): Promise<NextResponse<InventoryMerchantsMerchantSlugGETresponse>> {
	const merchantSlug = (await params).merchantSlug

	const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

	if (!extractedUserId) {
		return NextResponse.json({ message }, { status })
	}

	const { userExists } = await checkUserExists(extractedUserId)
	if (!userExists) {
		return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
	}

	const [merchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.slug, merchantSlug))

	if (!merchantProfile) {
		return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http401unauthorised })
	}

	const { relationshipExists } = await checkRelationship({ customerId: extractedUserId, merchantId: merchantProfile.userId })

	if (!relationshipExists) {
		return NextResponse.json({ message: relationshipMessages.relationshipMissing }, { status: httpStatus.http403forbidden })
	}

	const availableProducts: BrowserSafeCustomerProduct[] = await database
		.select({
			id: products.id,
			name: products.name,
			description: products.description,
			priceInMinorUnits: products.priceInMinorUnits,
			customVat: products.customVat,
		})
		.from(products)
		.where(and(eq(products.ownerId, merchantProfile.userId), isNull(products.deletedAt)))

	try {
		return NextResponse.json({ message: basicMessages.success, availableProducts }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.merchants.merchantSlug} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
