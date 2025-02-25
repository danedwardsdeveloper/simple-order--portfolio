import { apiPaths, authenticationMessages, basicMessages, httpStatus, relationshipMessages, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkRelationship, checkUserExists } from '@/library/database/operations'
import { merchantProfiles, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface MerchantSlugGETresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| 'merchantSlug missing'
		| TokenMessages
		| typeof authenticationMessages.merchantNotFound
		| typeof relationshipMessages.relationshipMissing
	merchantBusinessName?: string
}

// ToDo: Move this logic to part of /api/inventory as it's trivial
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ merchantSlug: string }> },
): Promise<NextResponse<MerchantSlugGETresponse>> {
	try {
		const merchantSlug = (await params).merchantSlug

		if (!merchantSlug) {
			return NextResponse.json({ message: 'merchantSlug missing' }, { status: httpStatus.http400badRequest })
		}

		// Check user is signed in
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		// Get merchant id
		// ToDo: make a reusable getMerchantIdFromSlug operation
		const [merchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.slug, merchantSlug))

		if (!merchantProfile) {
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http404notFound })
		}

		// Check relationship exists
		// Optimisation ToDo: This is quite inefficient as I'm also getting the merchant id when I get the inventory.
		const { relationshipExists } = await checkRelationship({
			customerId: extractedUserId,
			merchantId: merchantProfile.userId,
		})

		if (!relationshipExists) {
			return NextResponse.json({ message: relationshipMessages.relationshipMissing }, { status: httpStatus.http403forbidden })
		}

		const [{ merchantBusinessName }] = await database
			.select({
				merchantBusinessName: users.businessName,
			})
			.from(users)
			.where(eq(users.id, merchantProfile.userId))

		// Return details

		return NextResponse.json({ message: basicMessages.success, merchantBusinessName }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.merchants.merchantSlug} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
