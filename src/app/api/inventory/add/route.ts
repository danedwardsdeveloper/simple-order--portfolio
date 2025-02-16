import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { serviceConstraints } from '@/library/constants/serviceConstraints';
import { database } from '@/library/database/connection';
import { checkActiveSubscriptionOrTrial } from '@/library/database/operations';
import {
	checkMerchantProfileExists,
	checkUserExists,
} from '@/library/database/operations';
import { products } from '@/library/database/schema';
import logger from '@/library/logger';
import { containsIllegalCharacters } from '@/library/utilities';
import { extractIdFromRequestCookie } from '@/library/utilities/server';

import { apiPaths } from '@/library/constants/apiPaths';
import {
	type AuthenticationMessages,
	type BasicMessages,
	type ClientProduct,
	type NewProduct,
	type Product,
	authenticationMessages,
	basicMessages,
	httpStatus,
} from '@/types';

export type InventoryAddPOSTbody = Pick<
	NewProduct,
	'name' | 'priceInMinorUnits'
>;

const newProduct: InventoryAddPOSTbody = {
	name: '',
	priceInMinorUnits: 0,
};

export interface InventoryAddPOSTresponse {
	message:
		| BasicMessages
		| AuthenticationMessages
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
		| 'product name exists';
	product?: ClientProduct;
}

export async function POST(
	request: NextRequest
): Promise<NextResponse<InventoryAddPOSTresponse>> {
	const {
		name,
		priceInMinorUnits,
		customVat,
		description,
	}: InventoryAddPOSTbody = await request.json();

	let badRequestMessage: InventoryAddPOSTresponse['message'] | undefined;

	if (!name) {
		badRequestMessage = 'name missing';
	} else if (containsIllegalCharacters(name)) {
		badRequestMessage = 'name contains illegal characters';
	}

	if (!priceInMinorUnits) {
		badRequestMessage = 'priceInMinorUnits missing';
	} else if (Number.isNaN(priceInMinorUnits)) {
		badRequestMessage = 'priceInMinorUnits not a number';
	} else if (
		priceInMinorUnits > serviceConstraints.maximumProductValueInMinorUnits
	) {
		badRequestMessage = 'priceInMinorUnits too high';
	}

	if (description) {
		if (containsIllegalCharacters(description)) {
			badRequestMessage = 'description contains illegal characters';
		} else if (
			description.length >
			serviceConstraints.maximumProductDescriptionCharacters
		) {
			badRequestMessage = 'description too long';
		}
	}

	if (customVat) {
		if (Number.isNaN(customVat)) {
			badRequestMessage = 'customVat not a number';
		} else if (customVat > serviceConstraints.highestVat) {
			badRequestMessage = 'customVat too high';
		} else if (customVat < 0) {
			badRequestMessage = 'customVat is negative';
		} else if (customVat % 1 !== 0) {
			badRequestMessage = 'customVat is a decimal';
		}
	}

	if (badRequestMessage) {
		return NextResponse.json(
			{ message: badRequestMessage },
			{ status: httpStatus.http400badRequest }
		);
	}

	const { extractedUserId, status, message } =
		extractIdFromRequestCookie(request);

	if (!extractedUserId) {
		return NextResponse.json({ message }, { status });
	}

	const { userExists } = await checkUserExists(extractedUserId);
	if (!userExists) {
		return NextResponse.json(
			{ message: authenticationMessages.userNotFound },
			{ status: httpStatus.http401unauthorised }
		);
	}

	const { merchantProfileExists } = await checkMerchantProfileExists(
		extractedUserId
	);
	if (!merchantProfileExists) {
		return NextResponse.json(
			{ message: authenticationMessages.merchantMissing },
			{ status: httpStatus.http401unauthorised }
		);
	}

	const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(
		extractedUserId
	);
	if (!validSubscriptionOrTrial) {
		return NextResponse.json(
			{ message: authenticationMessages.noActiveTrialSubscription },
			{ status: httpStatus.http401unauthorised }
		);
	}

	let transactionFailureMessage: string | null = null;
	let transactionFailureStatus: number | null = null;
	let product: Product | null = null;

	try {
		// ToDo: remove this unnecessary transaction
		await database.transaction(async (tx) => {
			const existingProducts = await tx
				.select()
				.from(products)
				.where(eq(products.merchantProfileId, extractedUserId));
			if (existingProducts.length >= serviceConstraints.maximumProducts) {
				transactionFailureMessage = 'too many products';
				transactionFailureStatus = httpStatus.http400badRequest;
			}

			const [existingProduct] = await tx
				.select()
				.from(products)
				.where(
					and(
						eq(products.merchantProfileId, extractedUserId),
						eq(products.name, name)
					)
				)
				.limit(1);

			if (existingProduct) {
				transactionFailureMessage = 'product name exists';
				transactionFailureStatus = httpStatus.http400badRequest;
				return;
			}

			const newProduct: NewProduct = {
				name,
				merchantProfileId: extractedUserId,
				priceInMinorUnits,
				description,
				customVat,
			};

			const [addedProduct]: Product[] = await tx
				.insert(products)
				.values(newProduct)
				.returning();

			if (addedProduct) {
				logger.info('Added product: ', JSON.stringify(addedProduct));
				product = addedProduct;
			} else {
				// unknown database error
			}
		});

		if (transactionFailureMessage || transactionFailureStatus) {
			return NextResponse.json(
				{
					message:
						transactionFailureMessage || basicMessages.databaseError,
				},
				{
					status:
						transactionFailureStatus ||
						httpStatus.http503serviceUnavailable,
				}
			);
		}

		if (!product) {
			return NextResponse.json({ message: 'server error' }, { status: 500 });
		}

		return NextResponse.json(
			{ message: basicMessages.success, product },
			{ status: httpStatus.http200ok }
		);
	} catch (error) {
		logger.error(`${apiPaths.inventory.add}`, error);
		// Name conflict error

		return NextResponse.json(
			{ message: transactionFailureMessage || basicMessages.serverError },
			{ status: transactionFailureStatus || httpStatus.http500serverError }
		);
	}
}
