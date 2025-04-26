import { describe, test } from 'vitest'

type ToDoCase = {
	caseDescription: string //
}

const toDos: ToDoCase[] = [
	{ caseDescription: '' }, //
]

describe('/api/inventory/merchants/[merchantSlug]', () => {
	for (const { caseDescription } of toDos) {
		test.skip(caseDescription, () => {
			//
		})
	}
})

/*
pnpm vitest src/app/api/inventory/merchants/\[merchantSlug\]/route
*/
