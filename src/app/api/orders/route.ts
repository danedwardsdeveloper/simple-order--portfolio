import { basicMessages, httpStatus, type missingFieldMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { merchantProfiles, orders } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { OrderInsertValues, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersPOSTbody {
	merchantSlug: string
}

export interface OrdersPOSTresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | TokenMessages | typeof missingFieldMessages.merchantSlugMissing
	orderId?: number
}

export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ message: 'user not found' }, { status: httpStatus.http404notFound })
		}

		const { merchantSlug }: OrdersPOSTbody = await request.json()

		if (!merchantSlug) {
			return NextResponse.json({ message: 'merchantSlug missing' }, { status: httpStatus.http400badRequest })
		}

		const [{ merchantId }] = await database
			.select({
				merchantId: merchantProfiles.userId,
			})
			.from(merchantProfiles)
			.where(eq(merchantProfiles.slug, merchantSlug))
			.limit(1)

		// ToDo: Check relationship exists

		const newOrderInsertValues: OrderInsertValues = {
			customerId: extractedUserId,
			merchantId,
		}
		const [{ newOrderId }] = await database.insert(orders).values(newOrderInsertValues).returning({ newOrderId: orders.id })

		return NextResponse.json({ message: basicMessages.success, orderId: newOrderId }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
