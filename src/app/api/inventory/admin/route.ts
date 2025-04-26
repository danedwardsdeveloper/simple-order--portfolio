import {
	apiPaths,
	type authenticationMessages,
	basicMessages,
	httpStatus,
	illegalCharactersMessages,
	missingFieldMessages,
	serviceConstraints,
	userMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsIllegalCharacters, convertEmptyToUndefined, initialiseDevelopmentLogger } from '@/library/utilities/public'
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

// POST add an item to the inventory

// I think this can be changed to ProductInsertValues
export type InventoryAddPOSTbody = Omit<ProductInsertValues, 'ownerId' | 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>

// ToDo: remove unused responses
export interface InventoryAddPOSTresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	addedProduct?: BrowserSafeMerchantProduct
}

// POST add an item to the inventory
export async function POST(request: NextRequest): Promise<NextResponse<InventoryAddPOSTresponse>> {
	const { developmentLogger } = initialiseDevelopmentLogger('/inventory/admin', 'POST')

	try {
		const { name, priceInMinorUnits, customVat, description }: InventoryAddPOSTbody = await request.json()

		let badRequestMessage: string | undefined

		if (!name) badRequestMessage = missingFieldMessages.nameMissing
		if (containsIllegalCharacters(name)) badRequestMessage = illegalCharactersMessages.name
		if (!priceInMinorUnits) badRequestMessage = missingFieldMessages.priceMissing
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
			const developmentMessage = developmentLogger(badRequestMessage)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			const developmentMessage = developmentLogger(accessDenied.message)
			return NextResponse.json({ developmentMessage }, { status: accessDenied.status })
		}

		const userId = dangerousUser.id

		// Optimisation ToDo: check for duplicates at the same time (existingProducts/existingProduct)
		const existingProducts = await database.select().from(products).where(eq(products.ownerId, userId))
		if (existingProducts.length >= serviceConstraints.maximumProducts) {
			const developmentMessage = developmentLogger('too many products')
			return NextResponse.json({ developmentMessage }, { status: httpStatus.http403forbidden })
		}

		const [existingProduct] = await database
			.select()
			.from(products)
			.where(and(eq(products.ownerId, userId), eq(products.name, name)))
			.limit(1)

		if (existingProduct) {
			return NextResponse.json({ userMessage: userMessages.duplicateProductName }, { status: 409 })
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
			logger.error(`POST ${apiPaths.inventory.merchantPerspective.base} error: Couldn't add product to database`)
			return NextResponse.json({ userMessage: userMessages.databaseError }, { status: 503 })
		}

		logger.info('Added product: ', addedProduct)

		return NextResponse.json({ message: basicMessages.success, addedProduct }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}

// Saturday 19 April. 201 lines before refactor with Zod.
