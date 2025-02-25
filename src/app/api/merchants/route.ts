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

// ToDo: Doesn't return 204 when there aren't any merchants of any kind

export async function GET(request: NextRequest): Promise<NextResponse<MerchantsGETresponse>> {
	try {
		// Validate the user
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		// Find existing relationships
		const existingRelationships = await database.select().from(relationships).where(eq(relationships.customerId, extractedUserId))

		// Find any pending invitations
		const pendingInvitations = await database.select().from(invitations).where(eq(invitations.email, existingDangerousUser.email))

		if (!existingRelationships && !pendingInvitations) {
			return NextResponse.json({ message: 'no merchants' }, { status: httpStatus.http204noContent })
		}

		// Use relationships and pending invitations to retrieve the slug and business name
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
