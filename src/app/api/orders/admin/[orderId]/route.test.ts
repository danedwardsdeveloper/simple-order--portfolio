import { describe, test } from 'vitest'

type ToDoCase = {
	caseDescription: string //
}

const toDos: ToDoCase[] = [
	{ caseDescription: '' }, //
]

describe('/api/orders/admin/[orderId]', () => {
	for (const { caseDescription } of toDos) {
		test.skip(caseDescription, () => {
			//
		})
	}
})

/*
pnpm vitest src/app/api/orders/admin/[orderId\]
*/
