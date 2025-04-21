import { initialiseRequestMaker } from '@tests/utilities'
import { describe, expect, test } from 'vitest'

interface Suite {
	description: string
	expectedStatus: number
	cases: {
		description: string
		value: string
	}[]
}

const suites: Suite[] = [
	{
		description: 'Bad requests',
		expectedStatus: 400,
		cases: [
			{ description: '', value: '' },
			{ description: '', value: '' },
			{ description: '', value: '' },
		],
	},
	{
		description: 'Success',
		expectedStatus: 200,
		cases: [{ description: '', value: '' }],
	},
]

const makeRequest = initialiseRequestMaker({
	path: '',
	method: 'POST',
})

describe('Description', () => {
	for (const { description, expectedStatus, cases } of suites) {
		describe(description, () => {
			for (const { description, value } of cases) {
				test(description, async () => {
					const { response } = await makeRequest({ body: value })
					expect(response.status).toBe(expectedStatus)
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/
*/
