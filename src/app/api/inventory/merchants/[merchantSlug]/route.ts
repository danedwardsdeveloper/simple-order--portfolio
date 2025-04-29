import { http403forbidden, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship } from '@/library/database/operations'
import { products, users } from '@/library/database/schema'
import { convertEmptyToUndefined } from '@/library/utilities/public'
import { and, equals, initialiseResponder, isNull } from '@/library/utilities/server'
import type { BrowserSafeCustomerProduct, UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface InventoryMerchantSlugGETresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	availableProducts?: BrowserSafeCustomerProduct[]
	businessName?: string
}

type Output = Promise<NextResponse<InventoryMerchantSlugGETresponse>>

// Get all published products for a particular merchant, plus the businessName for convenience
export async function GET(request: NextRequest, { params }: { params: Promise<{ merchantSlug: string }> }): Output {
	const respond = initialiseResponder<InventoryMerchantSlugGETresponse>()
	try {
		const merchantSlug = (await params).merchantSlug

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const [dangerousMerchantProfile] = await database.select().from(users).where(equals(users.slug, merchantSlug))

		if (!dangerousMerchantProfile) {
			return respond({
				status: 401,
				developmentMessage: 'merchant not found',
			})
		}

		const { relationshipExists } = await checkRelationship({ customerId: dangerousUser.id, merchantId: dangerousMerchantProfile.id })

		if (!relationshipExists) {
			return respond({
				status: http403forbidden,
				developmentMessage: 'Relationship missing',
			})
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
				.where(and(equals(products.ownerId, dangerousMerchantProfile.id), isNull(products.deletedAt))),
		)

		return respond({
			body: { businessName: dangerousMerchantProfile.businessName, availableProducts },
			status: 200,
			developmentMessage: 'Success',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
