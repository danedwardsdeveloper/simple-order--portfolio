import { apiPaths, authenticationMessages, basicMessages, httpStatus, serviceConstraints, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { merchantProfiles, products } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsIllegalCharacters } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { AuthenticationMessages, BasicMessages, BrowserSafeMerchantProduct, NewProduct, Product, TokenMessages } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryGETresponse {
	message: BasicMessages | AuthenticationMessages | TokenMessages
	inventory?: BrowserSafeMerchantProduct[]
}

export async function GET(request: NextRequest): Promise<NextResponse<InventoryGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const [merchantProfile] = await database
			.select({ slug: merchantProfiles.slug })
			.from(merchantProfiles)
			.where(eq(merchantProfiles.userId, extractedUserId))
			.limit(1)

		if (!merchantProfile) {
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http401unauthorised })
		}

		const inventory: BrowserSafeMerchantProduct[] = await database
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

		return NextResponse.json({ message: basicMessages.success, inventory }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.admin.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}

export type InventoryAddPOSTbody = Omit<NewProduct, 'ownerId'>

export interface InventoryAddPOSTresponse {
	message:
		| BasicMessages
		| AuthenticationMessages
		| TokenMessages
		| 'name missing'
		| 'name contains illegal characters'
		| 'priceInMinorUnits missing'
		| 'priceInMinorUnits not a number'
		| 'priceInMinorUnits too high'
		| 'customVat not a number'
		| 'customVat too high'
		| 'customVat is a decimal'
		| 'customVat is negative'
		| 'description contains illegal characters'
		| 'description too long'
		| 'too many products'
		| 'product name exists'
	product?: BrowserSafeMerchantProduct
}

export async function POST(request: NextRequest): Promise<NextResponse<InventoryAddPOSTresponse>> {
	const { name, priceInMinorUnits, customVat, description }: InventoryAddPOSTbody = await request.json()

	let badRequestMessage: InventoryAddPOSTresponse['message'] | undefined

	if (!name) {
		badRequestMessage = 'name missing'
	}

	if (containsIllegalCharacters(name)) {
		badRequestMessage = 'name contains illegal characters'
	}

	if (!priceInMinorUnits) {
		badRequestMessage = 'priceInMinorUnits missing'
	}

	if (Number.isNaN(priceInMinorUnits)) {
		badRequestMessage = 'priceInMinorUnits not a number'
	}

	if (priceInMinorUnits > serviceConstraints.maximumProductValueInMinorUnits) {
		badRequestMessage = 'priceInMinorUnits too high'
	}

	if (description) {
		if (containsIllegalCharacters(description)) {
			badRequestMessage = 'description contains illegal characters'
		}
		if (description.length > serviceConstraints.maximumProductDescriptionCharacters) {
			badRequestMessage = 'description too long'
		}
	}

	if (customVat) {
		if (Number.isNaN(customVat)) {
			badRequestMessage = 'customVat not a number'
		}
		if (customVat > serviceConstraints.highestVat) {
			badRequestMessage = 'customVat too high'
		}
		if (customVat < 0) {
			badRequestMessage = 'customVat is negative'
		}
		if (customVat % 1 !== 0) {
			badRequestMessage = 'customVat is a decimal'
		}
	}

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

		const [foundMerchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, extractedUserId))

		if (!foundMerchantProfile) {
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId)
		if (!activeSubscriptionOrTrial) {
			return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
		}

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

		const newProduct: NewProduct = {
			name,
			ownerId: extractedUserId,
			priceInMinorUnits,
			description,
			customVat,
		}

		const [addedProduct]: Product[] = await database.insert(products).values(newProduct).returning()

		if (!addedProduct) {
			logger.error(`Couldn't add product`)
			return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
		}

		logger.info('Added product: ', JSON.stringify(addedProduct))

		return NextResponse.json({ message: basicMessages.success, product: addedProduct }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.inventory.admin.base}`, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
