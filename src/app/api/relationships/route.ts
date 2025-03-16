import { apiPaths, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { relationships, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { convertEmptyToUndefined, obfuscateEmail } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeCustomerProfile, BrowserSafeMerchantProfile, UnauthorisedMessages } from '@/types'
import { and, eq, or } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface RelationshipsGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | UnauthorisedMessages | 'no relationships found'
	merchants?: BrowserSafeMerchantProfile[]
	customers?: BrowserSafeCustomerProfile[]
}

// GET confirmed customers & merchants for the signed-in user
export async function GET(request: NextRequest): Promise<NextResponse<RelationshipsGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		const relationshipsResult = convertEmptyToUndefined(
			await database
				.select({
					userId: users.id,
					businessName: users.businessName,
					email: users.email,
					slug: users.slug,
					isMerchant: eq(relationships.merchantId, users.id),
				})
				.from(relationships)
				.innerJoin(
					users,
					or(
						and(eq(relationships.merchantId, extractedUserId), eq(relationships.customerId, users.id)),
						and(eq(relationships.customerId, extractedUserId), eq(relationships.merchantId, users.id)),
					),
				),
		)

		if (!relationshipsResult) return NextResponse.json({ message: 'no relationships found' }, { status: httpStatus.http200ok })

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

		return NextResponse.json(
			{
				message: basicMessages.success,
				customers,
				merchants,
			},
			{ status: httpStatus.http200ok },
		)
	} catch (error) {
		logger.error(`${apiPaths.relationships} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
