import { type NextRequest, NextResponse } from 'next/server'

import { checkMerchantProfileExists, checkUserExists, getInventory } from '@/library/database/operations'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import { apiPaths } from '@/library/constants/definitions/apiPaths'
import { httpStatus } from '@/library/constants/definitions/httpStatus'
import { authenticationMessages, basicMessages } from '@/library/constants/definitions/responseMessages'
import type { AuthenticationMessages, BasicMessages, ClientProduct } from '@/types'

export interface InventoryGETresponse {
	message: BasicMessages | AuthenticationMessages
	inventory?: ClientProduct[]
}

export async function GET(request: NextRequest): Promise<NextResponse<InventoryGETresponse>> {
	try {
		const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { merchantProfileExists } = await checkMerchantProfileExists(extractedUserId)

		if (!merchantProfileExists) {
			return NextResponse.json({ message: authenticationMessages.merchantMissing }, { status: httpStatus.http401unauthorised })
		}

		const inventory = await getInventory(extractedUserId)

		return NextResponse.json({ message: basicMessages.success, inventory }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.all} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
