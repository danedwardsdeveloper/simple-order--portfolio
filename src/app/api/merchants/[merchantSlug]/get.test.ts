import {} from '@/library/constants'
import { createFreeTrial } from '@/library/database/operations'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import { strawberryJam } from '@tests/constants'
import type { JsonData } from '@tests/types'
import { addProducts, createUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { createRelationship } from '@tests/utilities/definitions/createRelationship'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const aggieInputValues: TestUserInputValues = {
	firstName: 'Aggie',
	lastName: 'MacKenzie',
	businessName: 'Spotless Solutions',
	email: 'aggie@spotless.com',
	password: 'D1rtBust3r!',
	emailConfirmed: true,
}

const britneyInputValues: TestUserInputValues = {
	firstName: 'Britney',
	lastName: 'Spears',
	businessName: 'Toxic Enterprises',
	email: 'britney@spears.com',
	password: 'OopsID1dItAg@in!',
}

let aggieMacKenzie: DangerousBaseUser
let britneySpears: DangerousBaseUser
let validRequestCookie: string
let jsonResponse: JsonData

function getAggieMacKenzie(): DangerousBaseUser {
	if (!aggieMacKenzie) throw new Error('Aggie MacKenzie not defined')
	return aggieMacKenzie
}

function getBritneySpears(): DangerousBaseUser {
	if (!britneySpears) throw new Error('Britney Spears not defined')
	return britneySpears
}

const makeRequest = initialiseTestGETRequestMaker('/merchants')

interface TestFile {
	fileDescription: string
	fileSetUp?: AsyncFunction
	fileTearDown?: AsyncFunction
	suites: TestSuite[]
}

interface TestSuite {
	suiteDescription: string
	suiteExpectedStatus?: number
	suiteSetUp?: AsyncFunction
	suiteTearDown?: AsyncFunction
	cases: TestCase[]
}

interface TestCase {
	caseDescription: string
	caseMockedTime?: Date
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	caseExpectedStatus: number
	assertions: AsyncFunction
}

const file: TestFile = {
	fileDescription: 'GET /api/merchants/[merchantSlug]',
	suites: [
		{
			suiteDescription: 'Forbidden cases',
			suiteSetUp: async () => {
				const { createdUser, requestCookie } = await createUser(aggieInputValues)

				aggieMacKenzie = createdUser
				validRequestCookie = requestCookie

				const { createdUser: createdBritney } = await createUser(britneyInputValues)

				britneySpears = createdBritney

				await createFreeTrial({ userId: aggieMacKenzie.id })

				await createRelationship({
					customerId: getAggieMacKenzie().id,
					merchantId: getBritneySpears().id,
				})

				await addProducts([{ ...strawberryJam, ownerId: getBritneySpears().id }])

				// Add some products
				// add delivery days
				// Add a holiday
			},
			suiteTearDown: async () => {
				await deleteUser(aggieInputValues.email)
				await deleteUser(britneyInputValues.email)
			},
			cases: [
				{
					caseDescription: 'Has an availableProducts property',
					caseExpectedStatus: 200,
					assertions: async () => {
						expect(jsonResponse).toHaveProperty('availableProducts')
					},
				},
				{
					caseDescription: 'Has an availableDeliveryDays property',
					caseExpectedStatus: 200,
					assertions: async () => {
						expect(jsonResponse).toHaveProperty('availableDeliveryDays')
					},
				},
				// ToDo: Make much more comprehensive, ensuring that the cutoff time and delivery dates work properly.
			],
		},
	],
}

const { fileDescription, fileSetUp, fileTearDown, suites } = file

describe(fileDescription, () => {
	beforeAll(async () => {
		if (fileSetUp) await fileSetUp()
	})

	afterAll(async () => {
		if (fileTearDown) await fileTearDown()
	})

	for (const { suiteDescription, suiteSetUp, cases, suiteTearDown } of suites) {
		describe(suiteDescription, () => {
			beforeAll(async () => {
				if (suiteSetUp) await suiteSetUp()
			})

			afterAll(async () => {
				if (suiteTearDown) await suiteTearDown()
			})

			for (const { caseDescription, caseSetUp, caseTearDown, assertions, caseExpectedStatus } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					const { response } = await makeRequest({
						requestCookie: validRequestCookie,
						segment: getBritneySpears().slug,
					})

					jsonResponse = (await response.json()) as JsonData

					expect(response.status).toBe(caseExpectedStatus)

					await assertions()
					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/merchants/\[merchantSlug\]
*/
