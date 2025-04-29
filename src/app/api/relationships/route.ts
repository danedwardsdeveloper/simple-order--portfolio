import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { relationships, users } from '@/library/database/schema'
import { convertEmptyToUndefined, obfuscateEmail } from '@/library/utilities/public'
import { and, equals, initialiseResponder, or } from '@/library/utilities/server'
import type { BrowserSafeCustomerProfile, BrowserSafeMerchantProfile } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface RelationshipsGETresponse {
	developmentMessage?: string
	merchants?: BrowserSafeMerchantProfile[]
	customers?: BrowserSafeCustomerProfile[]
}

// GET confirmed customers & merchants for the signed-in user
export async function GET(request: NextRequest): Promise<NextResponse<RelationshipsGETresponse>> {
	const respond = initialiseResponder<RelationshipsGETresponse>()
	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		// Not sure about this... it's efficient but confusing and not reuseable
		const relationshipsResult = convertEmptyToUndefined(
			await database
				.select({
					userId: users.id,
					businessName: users.businessName,
					email: users.email,
					slug: users.slug,
					isMerchant: equals(relationships.merchantId, users.id),
				})
				.from(relationships)
				.innerJoin(
					users,
					or(
						and(equals(relationships.merchantId, dangerousUser.id), equals(relationships.customerId, users.id)),
						and(equals(relationships.customerId, dangerousUser.id), equals(relationships.merchantId, users.id)),
					),
				),
		)

		if (!relationshipsResult) {
			return respond({
				status: 200,
				developmentMessage: 'Legitimately no users',
			})
		}

		const merchants = convertEmptyToUndefined(
			relationshipsResult
				.filter((relatedUser) => relatedUser.isMerchant)
				.map((merchant) => ({
					businessName: merchant.businessName,
					slug: merchant.slug,
				})),
		)

		const customers = convertEmptyToUndefined(
			relationshipsResult
				.filter((relatedUser) => !relatedUser.isMerchant)
				.map((customer) => ({
					businessName: customer.businessName,
					obfuscatedEmail: obfuscateEmail(customer.email),
				})),
		)

		return respond({
			body: { customers, merchants },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			status: 500,
			caughtError,
		})
	}
}
