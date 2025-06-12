import { serviceConstraints } from '@/library/constants'
import { database, developmentDatabase } from '@/library/database/connection'
import { createFreeTrial } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, JsonData, Product, TestUserInputValues } from '@/types'
import { gingerBeer } from '@tests/constants'
import { addProducts, createTestUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { InventoryItemPATCHbody } from './patch'

const userInputValues: TestUserInputValues = {
	firstName: 'Belle',
	lastName: 'Beauty',
	businessName: 'Provincial Library',
	email: 'belle@castle.com',
	password: 'B00kw0rm!Rose',
}

const makeRequest = initialiseTestRequestMaker({
	basePath: '/inventory',
	method: 'PATCH',
})

function assertBelle(): DangerousBaseUser {
	if (!belle) throw new Error('Belle not defined')
	return belle
}

async function getGingerBeer(): Promise<Product> {
	try {
		const [gingerBeer] = await database.select().from(products).where(equals(products.ownerId, assertBelle().id)).limit(1)
		return gingerBeer
	} catch {
		throw Error('Ginger beer not found')
	}
}

let validCookie: string
let belle: DangerousBaseUser

interface TestSuite {
	suiteDescription: string
	suiteExpectedStatus?: number
	suiteBeforeAll?: AsyncFunction
	suiteBeforeEach?: AsyncFunction
	suiteAfterEach?: AsyncFunction
	cases: TestCase[]
}

interface TestCase {
	caseDescription: string
	caseSetUp?: AsyncFunction
	caseBody: (() => JsonData) | JsonData | null
	caseExpectedStatus?: number
	caseTearDown?: AsyncFunction
	assertions?: AsyncFunction
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Rejected cases',
		cases: [
			{
				caseDescription: 'Empty body',
				caseBody: {},
				caseExpectedStatus: 400,
			},
		],
	},
	{
		suiteDescription: 'Success cases',
		suiteExpectedStatus: 200,
		cases: [
			{
				caseDescription: 'Update a name',
				caseBody: { name: 'New name' } as InventoryItemPATCHbody,
			},
		],
	},
	{
		suiteDescription: 'Database',
		suiteExpectedStatus: 200,
		suiteBeforeEach: async () => {
			await developmentDatabase.delete(products).where(equals(products.ownerId, assertBelle().id))
			await addProducts([{ ...gingerBeer, ownerId: assertBelle().id }])
		},
		cases: [
			{
				caseDescription: 'Everything else stays the same when only name is updated',
				caseBody: { name: 'Updated name' } as InventoryItemPATCHbody,
				assertions: async () => {
					const databaseGingerBeer = await getGingerBeer()

					expect(databaseGingerBeer.name).toEqual('Updated name')

					expect(databaseGingerBeer.description).toEqual(gingerBeer.description)
					expect(databaseGingerBeer.priceInMinorUnits).toEqual(gingerBeer.priceInMinorUnits)
					expect(databaseGingerBeer.customVat).toEqual(gingerBeer.customVat)
				},
			},
			{
				caseDescription: 'Everything else stays the same when only description is updated',
				caseBody: { description: 'Updated description' } as InventoryItemPATCHbody,
				assertions: async () => {
					const databaseGingerBeer = await getGingerBeer()

					expect(databaseGingerBeer.description).toEqual('Updated description')

					expect(databaseGingerBeer.name).toEqual(gingerBeer.name)
					expect(databaseGingerBeer.priceInMinorUnits).toEqual(gingerBeer.priceInMinorUnits)
					expect(databaseGingerBeer.customVat).toEqual(gingerBeer.customVat)
				},
			},
			{
				caseDescription: 'Everything else stays the same when only the price is updated',
				caseBody: { priceInMinorUnits: '500' } as InventoryItemPATCHbody,
				assertions: async () => {
					const databaseGingerBeer = await getGingerBeer()

					expect(databaseGingerBeer.priceInMinorUnits).toEqual(500)

					expect(databaseGingerBeer.name).toEqual(gingerBeer.name)
					expect(databaseGingerBeer.description).toEqual(gingerBeer.description)
					expect(databaseGingerBeer.customVat).toEqual(gingerBeer.customVat)
				},
			},
			{
				caseDescription: 'Everything else stays the same when only the VAT is updated',
				caseBody: { customVat: '18' } as InventoryItemPATCHbody,
				assertions: async () => {
					const databaseGingerBeer = await getGingerBeer()

					expect(databaseGingerBeer.customVat).toEqual(18)

					expect(databaseGingerBeer.name).toEqual(gingerBeer.name)
					expect(databaseGingerBeer.description).toEqual(gingerBeer.description)
					expect(databaseGingerBeer.priceInMinorUnits).toEqual(gingerBeer.priceInMinorUnits)
				},
			},
		],
	},
	{
		suiteDescription: 'Service constraints',
		suiteBeforeAll: async () => {
			await developmentDatabase.delete(products).where(equals(products.ownerId, assertBelle().id))
			await addProducts([{ ...gingerBeer, ownerId: assertBelle().id }])
		},
		suiteExpectedStatus: 400,
		cases: [
			{
				caseDescription: 'Price too high',
				caseBody: {
					priceInMinorUnits: String(serviceConstraints.maximumProductValueInMinorUnits + 1),
				} as InventoryItemPATCHbody,
			},
			{
				caseDescription: 'Description too long',
				caseBody: {
					description: 'a'.repeat(serviceConstraints.maximumProductDescriptionCharacters + 1),
				} as InventoryItemPATCHbody,
			},
		],
	},
]

describe('PATCH /api/inventory/[itemId]', () => {
	beforeAll(async () => {
		const { createdUser, validCookie: createdCookie } = await createTestUser(userInputValues)
		belle = createdUser
		validCookie = createdCookie

		await createFreeTrial({ userId: belle.id })

		await addProducts([{ ...gingerBeer, ownerId: assertBelle().id }])
	})

	afterAll(async () => {
		await deleteUser(userInputValues.email)
	})

	for (const { suiteDescription, suiteExpectedStatus, suiteBeforeAll, suiteBeforeEach, cases, suiteAfterEach } of suites) {
		//
		describe(suiteDescription, async () => {
			beforeAll(async () => {
				if (suiteBeforeAll) await suiteBeforeAll()
			})

			beforeEach(async () => {
				if (suiteBeforeEach) await suiteBeforeEach()
			})

			afterEach(async () => {
				if (suiteAfterEach) await suiteAfterEach()
			})

			for (const { caseDescription, caseSetUp, caseBody, caseExpectedStatus, caseTearDown, assertions } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					const resolvedBody = caseBody === null ? undefined : typeof caseBody === 'function' ? caseBody() : caseBody

					const data = await makeRequest({
						requestCookie: validCookie, //
						body: resolvedBody,
						segment: (await getGingerBeer()).id,
					})

					expect(data.response.status).toEqual(caseExpectedStatus || suiteExpectedStatus)

					if (assertions) await assertions()
					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/inventory/\[itemId\]/patch
*/
