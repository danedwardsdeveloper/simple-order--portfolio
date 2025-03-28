import { apiPaths, httpStatus, serviceConstraints, temporaryVat, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship, getOrdersData } from '@/library/database/operations'
import { orderItems, orders, users } from '@/library/database/schema'
import { products as productsTable } from '@/library/database/schema'
import { containsIllegalCharacters, initialiseDevelopmentLogger, isValidDate, mapOrders } from '@/library/utilities/public'
import type { OrderInsertValues, OrderMade, SelectedProduct } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersMade?: OrderMade[]
}

/**
 * Get orders that you have placed as a customer (with search parameters (eventually))
 * Optimisation ToDo: sort with pending first
 */
export async function GET(request: NextRequest): Promise<NextResponse<OrdersGETresponse>> {
	const routeSignature = `GET ${apiPaths.orders.customerPerspective.base}:`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)

	try {
		const { dangerousUser } = await checkAccess({
			request,
			routeSignature,
			requireConfirmed: true, // Not sure about this. Might be too strict
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			const developmentMessage = developmentLogger('dangerousUser not found or invalid')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { ordersMadeData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersMade',
			routeSignature,
		})

		if (!ordersMadeData) {
			const developmentMessage = developmentLogger('Legitimately no orders found')
			return NextResponse.json({ developmentMessage }, { status: 200 })
		}

		const { ordersMade } = mapOrders({
			orders: ordersMadeData.orders,
			orderItems: ordersMadeData.orderItems,
			merchants: ordersMadeData.merchants,
			products: ordersMadeData.products,
			returnType: 'ordersMade',
		})

		return NextResponse.json({ ordersMade }, { status: 200 })
	} catch {
		return NextResponse.json({ userMessage: userMessages.serverError }, { status: 500 })
	}
}

export interface OrdersPOSTbody {
	merchantSlug: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

export interface OrdersPOSTresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	createdOrder?: OrderMade
}

/**
 * Allows a customer to create a new order
 */
export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	const routeSignature = `POST ${apiPaths.orders.customerPerspective.base}:`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)

	let transactionErrorMessage: string | undefined = undefined
	let transactionErrorCode: number | undefined = undefined

	try {
		const { merchantSlug, products, requestedDeliveryDate, customerNote }: OrdersPOSTbody = await request.json()

		let badRequestMessage = undefined

		if (!merchantSlug) badRequestMessage = 'merchantSlug Missing'
		if (!products) badRequestMessage = 'products Missing'
		if (!requestedDeliveryDate) badRequestMessage = 'requestedDeliveryDate missing'

		const parsedDate = new Date(requestedDeliveryDate)

		if (!isValidDate(parsedDate)) badRequestMessage = 'requestedDeliveryDate invalid'

		if (badRequestMessage) {
			const developmentMessage = developmentLogger(badRequestMessage)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser } = await checkAccess({
			routeSignature,
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			const developmentMessage = developmentLogger('Unauthorised')
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		if (merchantSlug === dangerousUser.slug) {
			const developmentMessage = developmentLogger('attempted to order from self')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		if (customerNote) {
			let customerNoteError = undefined

			if (typeof customerNote !== 'string') customerNoteError = 'customerNote should be a string'

			if (containsIllegalCharacters(customerNote)) customerNoteError = 'customerNote contains illegal characters'

			if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				customerNoteError = 'customerNote exceeds service constraints'
			}

			if (customerNoteError) {
				const developmentMessage = developmentLogger(customerNoteError)
				return NextResponse.json({ developmentMessage }, { status: 400 })
			}
		}

		// This relationship checking logic can be moved to checkAccess
		const [merchantProfile] = await database.select().from(users).where(eq(users.slug, merchantSlug)).limit(1)

		if (!merchantProfile) {
			const developmentMessage = developmentLogger(`merchant with slug ${merchantSlug} not found`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const relationshipExists = await checkRelationship({ merchantId: merchantProfile.id, customerId: dangerousUser.id })

		if (!relationshipExists) {
			const developmentMessage = developmentLogger(`No relationship found between customer ${dangerousUser.slug} and ${merchantSlug}`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const newOrderInsertValues: OrderInsertValues = {
			customerId: dangerousUser.id,
			merchantId: merchantProfile.id,
			requestedDeliveryDate: parsedDate,
			customerNote,
		}

		// This logic is complex but I don't think anything similar is used anywhere else in the application
		const newOrder = await database.transaction(async (tx) => {
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

		const allOrderItems = await database.select().from(orderItems).where(eq(orderItems.orderId, newOrder.id))

		const productIds = allOrderItems.map((item) => item.productId)

		const productsData = await database.select().from(productsTable).where(inArray(productsTable.id, productIds))

		const [createdOrder = undefined] =
			mapOrders({
				orders: [newOrder],
				orderItems: allOrderItems,
				products: productsData,
				merchants: [merchantProfile],
				returnType: 'ordersMade',
			}).ordersMade || []

		const developmentMessage = developmentLogger(
			`${dangerousUser.businessName} successfully created a new order from ${merchantProfile.businessName}`,
			undefined,
			'level3success',
		)
		return NextResponse.json({ developmentMessage, createdOrder }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger(transactionErrorMessage || 'Caught error', error)
		return NextResponse.json({ developmentMessage, userMessage: userMessages.serverError }, { status: transactionErrorCode || 500 })
	}
}
