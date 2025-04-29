import {
	type authenticationMessages,
	type basicMessages,
	http403forbidden,
	http409conflict,
	http503serviceUnavailable,
	illegalCharactersMessages,
	serviceConstraints,
	userMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { containsIllegalCharacters, convertEmptyToUndefined, initialiseDevelopmentLogger } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct, ProductInsertValues, UnauthorisedMessages, UserMessages } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryAdminGETresponse {
	userMessage?: typeof userMessages.serverError
	message?:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| UnauthorisedMessages
		| typeof authenticationMessages.merchantNotFound
	developmentMessage?: string
	inventory?: BrowserSafeMerchantProduct[]
}

// GET all products for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<InventoryAdminGETresponse>> {
	const { developmentLogger } = initialiseDevelopmentLogger('/inventory/admin', 'GET')

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			const developmentMessage = developmentLogger(accessDenied.message)
			return NextResponse.json({ developmentMessage }, { status: accessDenied.status })
		}

		const foundInventory: BrowserSafeMerchantProduct[] = await database
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})
			.from(products)
			.where(and(eq(products.ownerId, dangerousUser.id), isNull(products.deletedAt)))

		const inventory = convertEmptyToUndefined(foundInventory)

		let developmentMessage: string | undefined

		if (!inventory) {
			developmentMessage = developmentLogger('Legitimately no products found', { level: 'level3success' })
		}

		return NextResponse.json({ inventory, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}

// POST

export type InventoryAddPOSTbody = Omit<ProductInsertValues, 'ownerId' | 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>

// ToDo: remove unused responses
export interface InventoryAddPOSTresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	addedProduct?: BrowserSafeMerchantProduct
}

type OutputPOST = Promise<NextResponse<InventoryAddPOSTresponse>>

// POST add an item to the inventory
export async function POST(request: NextRequest): OutputPOST {
	const respond = initialiseResponder<InventoryAddPOSTresponse>()

	let body: InventoryAddPOSTbody | undefined

	try {
		body = (await request.json()) as InventoryAddPOSTbody
	} catch {
		return respond({ status: 400, developmentMessage: 'Request body missing' })
	}

	try {
		const { name, priceInMinorUnits, customVat, description } = body

		let badRequestMessage: string | undefined

		if (!name) badRequestMessage = 'name missing'
		if (containsIllegalCharacters(name)) badRequestMessage = 'name contains illegal characters'
		if (!priceInMinorUnits) badRequestMessage = 'priceInMinorUnits missing'
		if (Number.isNaN(priceInMinorUnits)) badRequestMessage = 'priceInMinorUnits not a number'
		if (priceInMinorUnits > serviceConstraints.maximumProductValueInMinorUnits) badRequestMessage = 'priceInMinorUnits too high'

		if (description) {
			if (containsIllegalCharacters(description)) badRequestMessage = illegalCharactersMessages.description
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
				status: 400,
				developmentMessage: badRequestMessage,
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

		const userId = dangerousUser.id

		// Optimisation ToDo: check for duplicates at the same time (existingProducts/existingProduct)
		const existingProducts = await database.select().from(products).where(eq(products.ownerId, userId))

		if (existingProducts.length >= serviceConstraints.maximumProducts) {
			return respond({
				status: http403forbidden,
				developmentMessage: 'too many products',
			})
		}

		const [existingProduct] = await database
			.select()
			.from(products)
			.where(and(eq(products.ownerId, userId), eq(products.name, name)))
			.limit(1)

		if (existingProduct) {
			return respond({
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

		// const newAddedProduct = await addProducts([{
		// 	name,
		// 	ownerId: userId,
		// 	priceInMinorUnits,
		// 	description,
		// 	customVat,
		// }])

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

// Saturday 19 April. 201 lines before refactor with Zod.
