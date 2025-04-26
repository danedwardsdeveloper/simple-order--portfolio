import { describe, test } from 'vitest'

type ToDoCase = {
	caseDescription: string //
}

const toDos: ToDoCase[] = [
	{ caseDescription: '' }, //
]

describe('/api/invitations', () => {
	for (const { caseDescription } of toDos) {
		test.skip(caseDescription, () => {
			//
		})
	}
})

/*
pnpm vitest src/app/api/invitations/route
*/
