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
	temporaryVat,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkRelationship, checkUserExists } from '@/library/database/operations'
import { orderItems, orders, users } from '@/library/database/schema'
import { products as productsTable } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsIllegalCharacters, isValidDate } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { OrderInsertValues, TokenMessages } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface SelectedProduct {
	productId: number
	quantity: number
}

export interface OrdersPOSTbody {
	merchantSlug: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

export interface OrdersPOSTresponse {
	message:
		| TokenMessages
		| typeof basicMessages.success
		| typeof basicMessages.serverError
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
	orderId?: number
}

//  Allows a customer to create a new order
export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	let transactionErrorMessage: string | undefined = undefined
	let transactionErrorCode: number | undefined = undefined

	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ message: 'user not found' }, { status: httpStatus.http404notFound })
		}

		const { merchantSlug, products, requestedDeliveryDate, customerNote }: OrdersPOSTbody = await request.json()

		if (!merchantSlug) {
			return NextResponse.json({ message: missingFieldMessages.merchantSlugMissing }, { status: httpStatus.http400badRequest })
		}

		if (!products) {
			return NextResponse.json({ message: missingFieldMessages.productsMissing }, { status: httpStatus.http400badRequest })
		}

		if (!requestedDeliveryDate) {
			return NextResponse.json({ message: missingFieldMessages.requestedDeliveryDateMissing }, { status: httpStatus.http400badRequest })
		}

		if (!isValidDate(requestedDeliveryDate)) {
			logger.error(`POST ${apiPaths.orders.merchantPerspective.base} invalid requestedDeliveryDate format: `, requestedDeliveryDate)
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
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http400badRequest })
		}

		const relationshipExists = await checkRelationship({ merchantId: merchantProfile.userId, customerId: extractedUserId })

		if (!relationshipExists) {
			return NextResponse.json({ message: relationshipMessages.relationshipMissing }, { status: httpStatus.http400badRequest })
		}

		const newOrderInsertValues: OrderInsertValues = {
			customerId: extractedUserId,
			merchantId: merchantProfile.userId,
			requestedDeliveryDate,
			customerNote,
		}

		const { newOrderId } = await database.transaction(async (tx) => {
			transactionErrorMessage = 'failed to create new order'
			transactionErrorCode = httpStatus.http503serviceUnavailable
			const [{ newOrderId }] = await tx.insert(orders).values(newOrderInsertValues).returning({ newOrderId: orders.id })

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

				const vatRate = product.customVat ?? temporaryVat

				return {
					orderId: newOrderId,
					productId: item.productId,
					quantity: item.quantity,
					priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
					vat: vatRate,
				}
			})

			transactionErrorMessage = 'failed to created order_items rows'
			await tx.insert(orderItems).values(orderItemsData)

			transactionErrorMessage = undefined
			transactionErrorCode = undefined
			return { newOrderId }
		})

		logger.info(`${existingDangerousUser.businessName} successfully created a new order from ${merchantProfile.businessName}`)
		return NextResponse.json({ message: basicMessages.success, orderId: newOrderId }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`POST ${apiPaths.orders.customerPerspective.base} error: `, transactionErrorMessage || error)
		return NextResponse.json(
			{ message: transactionErrorMessage || basicMessages.serverError },
			{ status: transactionErrorCode || httpStatus.http500serverError },
		)
	}
}

// Get orders that you have placed as a customer (with search parameters)
// Search parameters are a premature optimisation though!
export async function GET(_request: NextRequest) {
	return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http200ok })
}
