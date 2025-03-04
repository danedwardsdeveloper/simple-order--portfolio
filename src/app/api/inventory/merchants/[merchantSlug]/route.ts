import { apiPaths, authenticationMessages, basicMessages, httpStatus, relationshipMessages, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkRelationship, checkUserExists } from '@/library/database/operations'
import { products, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { convertEmptyToUndefined } from '@/library/utilities'
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
		| typeof relationshipMessages.relationshipMissing
		| 'not a customer of this merchant'
		| 'businessName not found'
	availableProducts?: BrowserSafeCustomerProduct[]
	businessName?: string
}

// Get all published products for a particular merchant, plus the businessName for convenience
// This is a GET route using params, so there isn't a body interface
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ merchantSlug: string }> },
): Promise<NextResponse<InventoryMerchantsMerchantSlugGETresponse>> {
	const merchantSlug = (await params).merchantSlug

	const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

	if (!extractedUserId) {
		logger.error(`${apiPaths.inventory.customerPerspective.merchantSlug} error: extractedUserId missing`)
		return NextResponse.json({ message }, { status })
	}

	const { userExists } = await checkUserExists(extractedUserId)
	if (!userExists) {
		return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
	}

	const [dangerousMerchantProfile] = await database.select().from(users).where(eq(users.slug, merchantSlug))

	if (!dangerousMerchantProfile) {
		return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http401unauthorised })
	}

	const { relationshipExists } = await checkRelationship({ customerId: extractedUserId, merchantId: dangerousMerchantProfile.id })

	if (!relationshipExists) {
		return NextResponse.json({ message: relationshipMessages.relationshipMissing }, { status: httpStatus.http403forbidden })
	}

	const availableProducts = convertEmptyToUndefined(
		await database
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
			})
			.from(products)
			.where(and(eq(products.ownerId, dangerousMerchantProfile.id), isNull(products.deletedAt))),
	)

	try {
		return NextResponse.json(
			{
				message: basicMessages.success,
				businessName: dangerousMerchantProfile.businessName,
				availableProducts,
			},
			{ status: httpStatus.http200ok },
		)
	} catch (error) {
		logger.error(`${apiPaths.inventory.customerPerspective.merchantSlug} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
