import { http403forbidden, http409conflict, http503serviceUnavailable, serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { containsIllegalCharacters } from '@/library/utilities/public/definitions/allowedCharactersRegex'
import { and, equals, initialiseResponder } from '@/library/utilities/server'
import type { ApiResponse, BrowserSafeMerchantProduct, ProductInsertValues } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export type InventoryAddPOSTbody = Omit<ProductInsertValues, 'ownerId' | 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>

type Success = {
	ok: true
	addedProduct: BrowserSafeMerchantProduct
}

type Failure = {
	ok: false
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError | typeof userMessages.authenticationError | typeof userMessages.unexpectedError
}

// ToDo: refactor with Zod

export type InventoryAddPOSTresponse = ApiResponse<Success, Failure>

type Output = Promise<NextResponse<InventoryAddPOSTresponse>>

// POST add an item to the inventory
export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<Success, Failure>()

	let body: InventoryAddPOSTbody | undefined

	try {
		body = (await request.json()) as InventoryAddPOSTbody
	} catch {
		return respond({
			body: { userMessage: userMessages.unexpectedError },
			status: 400,
			developmentMessage: 'Request body missing',
		})
	}

	try {
		const { name, priceInMinorUnits, customVat, description } = body

		let badRequestMessage: string | undefined

		if (!name) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'name missing',
			})
		}

		if (containsIllegalCharacters(name)) badRequestMessage = 'name contains illegal characters'
		if (!priceInMinorUnits) badRequestMessage = 'priceInMinorUnits missing'
		if (Number.isNaN(priceInMinorUnits)) badRequestMessage = 'priceInMinorUnits not a number'
		if (priceInMinorUnits > serviceConstraints.maximumProductValueInMinorUnits) badRequestMessage = 'priceInMinorUnits too high'

		if (description) {
			if (containsIllegalCharacters(description)) badRequestMessage = 'illegal characters'
			if (description.length > serviceConstraints.maximumProductDescriptionCharacters) badRequestMessage = 'description too long'
		}

		if (customVat) {
			if (Number.isNaN(customVat)) badRequestMessage = 'customVat not a number'
			if (customVat > serviceConstraints.highestVat) badRequestMessage = 'customVat too high'
			if (customVat < 0) badRequestMessage = 'customVat is negative'
			if (customVat % 1 !== 0) badRequestMessage = 'customVat is a decimal'
		}

		if (badRequestMessage) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: badRequestMessage,
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const userId = dangerousUser.id

		// Optimisation ToDo: check for duplicates at the same time (existingProducts/existingProduct)
		const existingProducts = await database.select().from(products).where(equals(products.ownerId, userId))

		if (existingProducts.length >= serviceConstraints.maximumProducts) {
			return respond({
				// The client should make it impossible for this to happen legitimately
				body: { userMessage: userMessages.unexpectedError },
				status: http403forbidden,
				developmentMessage: 'too many products',
			})
		}

		const [existingProduct] = await database
			.select()
			.from(products)
			.where(and(equals(products.ownerId, userId), equals(products.name, name)))
			.limit(1)

		if (existingProduct) {
			return respond({
				// ToDo: this could actually happen, because of my soft delete process. I need to think about product history behaviour. Much more complicated than it seems. Wednesday 11 June, 2025.
				body: { userMessage: userMessages.unexpectedError },
				status: http409conflict,
				developmentMessage: 'product name not unique',
			})
		}

		const insertValues: ProductInsertValues = {
			name,
			ownerId: userId,
			priceInMinorUnits,
			description,
			customVat,
		}

		const [addedProduct]: BrowserSafeMerchantProduct[] = await database.insert(products).values(insertValues).returning({
			id: products.id,
			name: products.name,
			description: products.description,
			priceInMinorUnits: products.priceInMinorUnits,
			customVat: products.customVat,
			deletedAt: products.deletedAt,
		})

		if (!addedProduct) {
			return respond({
				body: { userMessage: userMessages.databaseError },
				status: http503serviceUnavailable,
				developmentMessage: 'Database error',
			})
		}

		return respond({
			body: { addedProduct },
			status: 201,
			developmentMessage: `Added ${addedProduct.name}`,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
