import {
	apiPaths,
	authenticationMessages,
	basicMessages,
	httpStatus,
	illegalCharactersMessages,
	invalidFieldsMessages,
	missingFieldMessages,
	relationshipMessages,
	serviceConstraintMessages,
	serviceConstraints,
	systemMessages,
	temporaryVat,
	tokenMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkRelationship, checkUserExists } from '@/library/database/operations'
import { orderItems, orders, products, users } from '@/library/database/schema'
import { products as productsTable } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsIllegalCharacters, convertEmptyToUndefined, isValidDate, logAndSanitiseApiResponse } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserOrderItem, OrderInsertValues, OrderItem, OrderMade, SelectedProduct, UnauthorisedMessages } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersGETresponse {
	message: UnauthorisedMessages | typeof basicMessages.success | typeof basicMessages.serverError | 'success, no orders'
	ordersMade?: OrderMade[]
}

const routeDetailGET = `GET ${apiPaths.orders.customerPerspective.base}:`

// Get orders that you have placed as a customer (with search parameters (eventually))
// Optimisation ToDo: sort with pending first
export async function GET(request: NextRequest): Promise<NextResponse<OrdersGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			logger.warn(routeDetailGET, message)
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)

		if (!userExists) {
			logger.warn(routeDetailGET, tokenMessages.userNotFound)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		const foundOrders = convertEmptyToUndefined(await database.select().from(orders).where(eq(orders.customerId, extractedUserId)))

		if (!foundOrders) {
			logger.info(routeDetailGET, 'success, no orders')
			return NextResponse.json({ message: 'success, no orders' }, { status: 200 })
		}

		const orderIds = foundOrders.map((order) => order.id)

		const allOrderItems = await database.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))

		const merchantIds = [...new Set(foundOrders.map((order) => order.merchantId))]

		const merchants = await database
			.select({
				id: users.id,
				businessName: users.businessName,
			})
			.from(users)
			.where(inArray(users.id, merchantIds))

		const merchantsMap = new Map(merchants.map((merchant) => [merchant.id, merchant]))

		const productIds = [...new Set(allOrderItems.map((item) => item.productId))]

		const productsData = await database
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
			})
			.from(products)
			.where(inArray(products.id, productIds))

		const productsMap = new Map(productsData.map((product) => [product.id, product]))

		const itemsMap = new Map()
		for (const item of allOrderItems) {
			if (!itemsMap.has(item.orderId)) {
				itemsMap.set(item.orderId, [])
			}
			itemsMap.get(item.orderId).push(item)
		}

		const ordersMade: OrderMade[] = foundOrders.map((order) => {
			const orderItemsList = itemsMap.get(order.id) || []

			const mappedProducts: BrowserOrderItem[] = orderItemsList
				.map((orderItem: OrderItem) => {
					const product = productsMap.get(orderItem.productId)
					if (!product) return null

					return {
						id: product.id,
						name: product.name,
						description: product.description,
						quantity: orderItem.quantity,
						priceInMinorUnitsWithoutVat: orderItem.priceInMinorUnitsWithoutVat,
						vat: orderItem.vat,
					}
				})
				.filter(Boolean)

			return {
				id: order.id,
				businessName: merchantsMap.get(order.merchantId)?.businessName || 'Unknown business',
				requestedDeliveryDate: order.requestedDeliveryDate,
				status: order.status,
				customerNote: order.customerNote || undefined,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				products: mappedProducts,
			}
		})

		logger.info(routeDetailGET, `successfully retrieved ${foundOrders.length} order${foundOrders.length > 1 ? 's' : ''}`)
		return NextResponse.json({ message: basicMessages.success, ordersMade }, { status: 200 })
	} catch {
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}

export interface OrdersPOSTbody {
	merchantSlug: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

export interface OrdersPOSTresponse {
	developerMessage?: string
	message:
		| UnauthorisedMessages
		| typeof systemMessages.success
		| typeof systemMessages.serverError
		| typeof systemMessages.badRequest
		| typeof basicMessages.transactionError
		| typeof missingFieldMessages.merchantSlugMissing
		| typeof relationshipMessages.relationshipMissing
		| typeof authenticationMessages.merchantNotFound
		| typeof missingFieldMessages.merchantSlugMissing
		| typeof missingFieldMessages.productsMissing
		| typeof missingFieldMessages.requestedDeliveryDateMissing
		| typeof illegalCharactersMessages.customerNote
		| typeof invalidFieldsMessages.customerNote
		| typeof invalidFieldsMessages.requestedDelivery
		| typeof serviceConstraintMessages.customerNoteTooLong
	createdOrder?: OrderMade
}

const routeDetailPOST = `POST ${apiPaths.orders.customerPerspective.base}:`

//  Allows a customer to create a new order
export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	let transactionErrorMessage: string | undefined = undefined
	let transactionErrorCode: number | undefined = undefined

	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			logger.warn(routeDetailPOST, message)
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			logger.warn(routeDetailPOST, tokenMessages.userNotFound)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
		}

		const { merchantSlug, products, requestedDeliveryDate, customerNote }: OrdersPOSTbody = await request.json()

		if (!merchantSlug) {
			logger.warn(routeDetailPOST, missingFieldMessages.merchantSlugMissing)
			return NextResponse.json({ message: missingFieldMessages.merchantSlugMissing }, { status: httpStatus.http400badRequest })
		}

		if (merchantSlug === existingDangerousUser.slug) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail: routeDetailPOST,
				level: 'level1error',
				message: 'attempted to order from self',
			})
			return NextResponse.json({ message: systemMessages.badRequest, developerMessage }, { status: 400 })
		}

		if (!products) {
			logger.warn(routeDetailPOST, missingFieldMessages.productsMissing)
			return NextResponse.json({ message: missingFieldMessages.productsMissing }, { status: httpStatus.http400badRequest })
		}

		if (!requestedDeliveryDate) {
			logger.warn(routeDetailPOST, missingFieldMessages.requestedDeliveryDateMissing)
			return NextResponse.json({ message: missingFieldMessages.requestedDeliveryDateMissing }, { status: httpStatus.http400badRequest })
		}

		const parsedDate = new Date(requestedDeliveryDate)

		if (!isValidDate(parsedDate)) {
			logger.warn(routeDetailPOST, invalidFieldsMessages.requestedDelivery, parsedDate)
			return NextResponse.json({ message: invalidFieldsMessages.requestedDelivery }, { status: httpStatus.http400badRequest })
		}

		if (customerNote) {
			let customerNoteError = undefined

			if (typeof customerNote !== 'string') {
				customerNoteError = invalidFieldsMessages.customerNote
			} else if (containsIllegalCharacters(customerNote)) {
				customerNoteError = illegalCharactersMessages.customerNote
			} else if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				customerNoteError = serviceConstraintMessages.customerNoteTooLong
			}
			if (customerNoteError) {
				logger.warn(routeDetailPOST, customerNoteError)
				return NextResponse.json({ message: customerNoteError }, { status: httpStatus.http400badRequest })
			}
		}

		const [merchantProfile] = await database
			.select({
				businessName: users.businessName,
				userId: users.id,
			})
			.from(users)
			.where(eq(users.slug, merchantSlug))

		if (!merchantProfile) {
			logger.warn(routeDetailPOST, authenticationMessages.merchantNotFound)
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http400badRequest })
		}

		const relationshipExists = await checkRelationship({ merchantId: merchantProfile.userId, customerId: extractedUserId })

		if (!relationshipExists) {
			logger.warn(routeDetailPOST, relationshipMessages.relationshipMissing)
			return NextResponse.json({ message: relationshipMessages.relationshipMissing }, { status: httpStatus.http400badRequest })
		}

		const newOrderInsertValues: OrderInsertValues = {
			customerId: extractedUserId,
			merchantId: merchantProfile.userId,
			requestedDeliveryDate: parsedDate,
			customerNote,
		}

		const createdOrder = await database.transaction(async (tx) => {
			transactionErrorMessage = 'failed to create new order'
			transactionErrorCode = httpStatus.http503serviceUnavailable
			const [createdOrder] = await tx.insert(orders).values(newOrderInsertValues).returning()

			transactionErrorMessage = 'failed to retrieve data from products table'
			const productsData = await tx
				.select()
				.from(productsTable)
				.where(
					inArray(
						productsTable.id,
						products.map((product) => product.productId),
					),
				)

			const orderItemsData = products.map((item) => {
				const product = productsData.find((product) => product.id === item.productId)
				if (!product) throw new Error(`Product ${item.productId} not found`)

				return {
					orderId: createdOrder.id,
					productId: item.productId,
					quantity: item.quantity,
					priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
					vat: product.customVat || temporaryVat,
				}
			})

			transactionErrorMessage = 'failed to created order_items rows'
			await tx.insert(orderItems).values(orderItemsData)

			transactionErrorMessage = undefined
			transactionErrorCode = undefined
			return createdOrder
		})

		const allOrderItems = await database.select().from(orderItems).where(eq(orderItems.orderId, createdOrder.id))

		const productIds = allOrderItems.map((item) => item.productId)

		const productsData = await database
			.select({
				id: productsTable.id,
				name: productsTable.name,
				description: productsTable.description,
			})
			.from(productsTable)
			.where(inArray(productsTable.id, productIds))

		const productsMap = new Map(productsData.map((product) => [product.id, product]))

		const mappedProducts: BrowserOrderItem[] = allOrderItems
			.map((orderItem) => {
				const product = productsMap.get(orderItem.productId)
				if (!product) return null

				return {
					id: orderItem.id,
					orderId: orderItem.orderId,
					productId: orderItem.productId,
					name: product.name,
					description: product.description,
					quantity: orderItem.quantity,
					priceInMinorUnitsWithoutVat: orderItem.priceInMinorUnitsWithoutVat,
					vat: orderItem.vat,
				}
			})
			.filter(Boolean) as BrowserOrderItem[]

		const fullOrder: OrderMade = {
			id: createdOrder.id,
			businessName: merchantProfile.businessName,
			requestedDeliveryDate: createdOrder.requestedDeliveryDate,
			status: createdOrder.status,
			customerNote: createdOrder.customerNote || undefined,
			createdAt: createdOrder.createdAt,
			updatedAt: createdOrder.updatedAt,
			products: mappedProducts,
		}

		logger.info(
			routeDetailPOST,
			`${existingDangerousUser.businessName} successfully created a new order from ${merchantProfile.businessName}`,
		)
		return NextResponse.json({ message: systemMessages.success, createdOrder: fullOrder }, { status: 200 })
	} catch (error) {
		logger.error(routeDetailPOST, transactionErrorMessage || error)
		return NextResponse.json(
			{ message: transactionErrorMessage || basicMessages.serverError },
			{ status: transactionErrorCode || httpStatus.http500serverError },
		)
	}
}
