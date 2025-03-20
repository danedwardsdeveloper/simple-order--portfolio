import {
	apiPaths,
	authenticationMessages,
	basicMessages,
	httpStatus,
	illegalCharactersMessages,
	missingFieldMessages,
	serviceConstraints,
	tokenMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsIllegalCharacters, containsItems } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct, ProductInsertValues, UnauthorisedMessages } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryAdminGETresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| UnauthorisedMessages
		| typeof authenticationMessages.merchantNotFound
	inventory?: BrowserSafeMerchantProduct[]
}

// GET all products for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<InventoryAdminGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const foundInventory: BrowserSafeMerchantProduct[] = await database
			.select({
				id: products.id,
				merchantProfileId: products.ownerId,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})
			.from(products)
			.where(and(eq(products.ownerId, extractedUserId), isNull(products.deletedAt)))

		const inventory = containsItems(foundInventory) ? foundInventory : undefined

		return NextResponse.json({ message: basicMessages.success, inventory }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.merchantPerspective.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}

// POST add an item to the inventory
export type InventoryAddPOSTbody = Omit<ProductInsertValues, 'ownerId' | 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>

// ToDo: remove unused responses
export interface InventoryAddPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.databaseError
		| typeof basicMessages.serverError
		| typeof missingFieldMessages.nameMissing
		| typeof authenticationMessages.merchantNotFound
		| typeof authenticationMessages.noActiveTrialSubscription
		| typeof illegalCharactersMessages.name
		| typeof illegalCharactersMessages.description
		| UnauthorisedMessages
		| typeof missingFieldMessages.priceMissing
		| 'priceInMinorUnits missing'
		| 'priceInMinorUnits not a number'
		| 'priceInMinorUnits too high'
		| 'customVat not a number'
		| 'customVat too high'
		| 'customVat is a decimal'
		| 'customVat is negative'
		| 'description too long'
		| 'too many products'
		| 'product name exists'
	addedProduct?: BrowserSafeMerchantProduct
}

export async function POST(request: NextRequest): Promise<NextResponse<InventoryAddPOSTresponse>> {
	const { name, priceInMinorUnits, customVat, description }: InventoryAddPOSTbody = await request.json()

	let badRequestMessage: InventoryAddPOSTresponse['message'] | undefined

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

	// Optimisation ToDo: Make these constraints better

	// if (customVat !== undefined && customVat !== null) {
	// 	if (Number.isNaN(customVat)) {
	// 		return res.status(400).json({ message: 'customVat not a number' });
	// 	} else if (customVat > serviceConstraints.highestVat) {
	// 		return res.status(400).json({ message: 'customVat too high' });
	// 	} else if (customVat < 0) {
	// 		return res.status(400).json({ message: 'customVat is negative' });
	// 	} else if (customVat % 1 !== 0) {
	// 		return res.status(400).json({ message: 'customVat is a decimal' });
	// 	}
	// }

	if (badRequestMessage) {
		return NextResponse.json({ message: badRequestMessage }, { status: httpStatus.http400badRequest })
	}

	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId)
		if (!activeSubscriptionOrTrial) {
			return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
		}

		// Optimisation ToDo: check for duplicates at the same time (existingProducts/existingProduct)
		const existingProducts = await database.select().from(products).where(eq(products.ownerId, extractedUserId))
		if (existingProducts.length >= serviceConstraints.maximumProducts) {
			return NextResponse.json({ message: 'too many products' }, { status: httpStatus.http400badRequest })
		}

		const [existingProduct] = await database
			.select()
			.from(products)
			.where(and(eq(products.ownerId, extractedUserId), eq(products.name, name)))
			.limit(1)

		if (existingProduct) {
			return NextResponse.json({ message: 'product name exists' }, { status: httpStatus.http400badRequest })
		}

		const insertValues: ProductInsertValues = {
			name,
			ownerId: extractedUserId,
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
			logger.error(`POST ${apiPaths.inventory.merchantPerspective.base} error: Couldn't add product to database`)
			return NextResponse.json({ message: basicMessages.databaseError }, { status: httpStatus.http500serverError })
		}

		logger.info('Added product: ', addedProduct)

		return NextResponse.json({ message: basicMessages.success, addedProduct }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.merchantPerspective.base}`, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
