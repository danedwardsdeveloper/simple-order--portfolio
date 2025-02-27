import { apiPaths, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { invitations, merchantProfiles, relationships, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeMerchantProfile, TokenMessages } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface MerchantsGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | TokenMessages | 'no merchants'
	confirmedMerchants?: BrowserSafeMerchantProfile[]
	pendingMerchants?: BrowserSafeMerchantProfile[] // ToDo: add expiry
}

// ToDo: Should return 204 when there aren't any merchants, but I'm not sure it does this

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

		const existingRelationships = await database.select().from(relationships).where(eq(relationships.customerId, extractedUserId))

		const pendingInvitations = await database.select().from(invitations).where(eq(invitations.email, existingDangerousUser.email))

		if (!existingRelationships && !pendingInvitations) {
			return NextResponse.json({ message: 'no merchants' }, { status: httpStatus.http204noContent })
		}

		let confirmedMerchants: BrowserSafeMerchantProfile[] | null = null
		let pendingMerchants: BrowserSafeMerchantProfile[] | null = null

		if (existingRelationships) {
			const confirmedMerchantIds = existingRelationships.map((relationship) => relationship.merchantId)

			confirmedMerchants = await database
				.select({
					slug: merchantProfiles.slug,
					businessName: users.businessName,
				})
				.from(merchantProfiles)
				.innerJoin(users, eq(users.id, merchantProfiles.userId))
				.where(inArray(merchantProfiles.userId, confirmedMerchantIds))
		}

		if (pendingInvitations) {
			const invitedMerchantIds = pendingInvitations.map((invitation) => invitation.senderUserId)

			pendingMerchants = await database
				.select({
					slug: merchantProfiles.slug,
					businessName: users.businessName,
				})
				.from(merchantProfiles)
				.innerJoin(users, eq(users.id, merchantProfiles.userId))
				.where(inArray(merchantProfiles.userId, invitedMerchantIds))
		}

		return NextResponse.json(
			{
				message: basicMessages.success,
				// The browser is handling these empty arrays fine, and it broke when I used nonEmptyArray()
				confirmedMerchants: confirmedMerchants ?? [],
				pendingMerchants: pendingMerchants ?? [],
			},
			{ status: httpStatus.http200ok },
		)
	} catch (error) {
		logger.error(`${apiPaths.merchants.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
