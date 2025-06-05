import { describe, test } from 'vitest'

/*
SETUP
- Create a merchant
- Create some products
- Create a customer
- Customer creates an order
*/

type ToDoCase = {
	caseDescription: string //
}

const toDos: ToDoCase[] = [
	// Rejected cases
	{ caseDescription: 'No body' },
	{ caseDescription: 'Empty body' },
	{ caseDescription: 'Incorrect body' },
	{ caseDescription: 'Nothing to update' },
	{ caseDescription: 'Malformed cookie' },
	{ caseDescription: 'Non-existent user cookie' },
	{ caseDescription: 'Expired cookie' },
	{ caseDescription: 'Merchant email is unconfirmed' },
	{ caseDescription: "Merchant doesn't have active trial or subscription" },

	// Success cases
	{ caseDescription: 'Update order status' },
	{ caseDescription: 'Update admin-only note' },
	{ caseDescription: 'Update status and note' },
]

describe('/api/orders/[orderId]', () => {
	for (const { caseDescription } of toDos) {
		test.skip(caseDescription, () => {
			//
		})
	}
})

/*
pnpm vitest src/app/api/orders/\[orderId\]
*/
