import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { and, equals, formatFirstError, initialiseResponder } from '@/library/utilities/server'
import { type InventoryUpdateFormData, inventoryUpdateFormSchema } from '@/library/validations'
import type { UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { InventoryItemParams } from './route'

export type InventoryItemPATCHbody = InventoryUpdateFormData

export type InventoryItemPATCHresponse = {
	userMessage: UserMessages
}

type Output = Promise<NextResponse<InventoryItemPATCHresponse>>

export async function PATCH(request: NextRequest, { params }: { params: Promise<InventoryItemParams> }): Output {
	const respond = initialiseResponder<InventoryItemPATCHresponse>()

	try {
		const resolvedParams = await params
		const itemId = Number.parseInt(resolvedParams.itemId)

		let rawBody: InventoryUpdateFormData
		try {
			rawBody = await request.json()
			if (Object.keys(rawBody).length === 0) {
				return respond({
					status: 400,
					developmentMessage: 'body empty',
				})
			}
		} catch {
			return respond({
				status: 400,
				developmentMessage: 'body missing',
			})
		}

		const validationResult = inventoryUpdateFormSchema.safeParse(rawBody)

		if (!validationResult.success) {
			return respond({
				status: 400,
				developmentMessage: formatFirstError(validationResult.error),
			})
		}

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

		const updateData = Object.fromEntries(Object.entries(validationResult.data).filter(([_, value]) => value !== undefined))

		await database
			.update(products)
			.set(updateData)
			.where(
				and(
					equals(products.ownerId, dangerousUser.id), //
					equals(products.id, itemId),
				),
			)

		return respond({
			status: 200,
			developmentMessage: `Successfully updated product with ID ${itemId} with ${Object.entries(updateData)
				.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
				.join(', ')}`,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
