import { httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { merchantProfiles, orders } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { AuthenticationMessages, BasicMessages, OrderInsertValues } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersPOSTbody {
	merchantSlug: string
}

export interface OrdersPOSTresponse {
	message: 'success' | 'failure' | 'merchantSlug missing' | AuthenticationMessages | BasicMessages
	orderId?: number
}

export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingUser) {
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

		return NextResponse.json({ message: 'success', orderId: newOrderId }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ message: 'failure' }, { status: httpStatus.http500serverError })
	}
}
