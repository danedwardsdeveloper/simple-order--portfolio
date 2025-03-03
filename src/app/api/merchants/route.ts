import { apiPaths, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { invitations, merchantProfiles, relationships, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsItems, nullifyEmptyArray } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeMerchantProfile, TokenMessages } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface MerchantsGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | TokenMessages | 'no merchants'
	confirmedMerchants?: BrowserSafeMerchantProfile[]
}

// GET confirmed & pending merchants for the signed-in customer
export async function GET(request: NextRequest): Promise<NextResponse<MerchantsGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		const existingRelationships = nullifyEmptyArray(
			await database.select().from(relationships).where(eq(relationships.customerId, extractedUserId)),
		)

		const pendingInvitations = nullifyEmptyArray(
			await database.select().from(invitations).where(eq(invitations.email, existingDangerousUser.email)),
		)

		if (!existingRelationships && !pendingInvitations) {
			return NextResponse.json({ message: 'no merchants' }, { status: httpStatus.http204noContent })
		}

		let foundMerchantProfiles: BrowserSafeMerchantProfile[] | undefined = undefined

		if (existingRelationships) {
			const confirmedMerchantIds = existingRelationships.map((relationship) => relationship.merchantId)

			foundMerchantProfiles = await database
				.select({
					slug: merchantProfiles.slug,
					businessName: users.businessName,
				})
				.from(merchantProfiles)
				.innerJoin(users, eq(users.id, merchantProfiles.userId))
				.where(inArray(merchantProfiles.userId, confirmedMerchantIds))
		}

		const confirmedMerchants = containsItems(foundMerchantProfiles) ? foundMerchantProfiles : undefined

		return NextResponse.json(
			{
				message: basicMessages.success,
				confirmedMerchants,
			},
			{ status: httpStatus.http200ok },
		)
	} catch (error) {
		logger.error(`${apiPaths.merchants.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
