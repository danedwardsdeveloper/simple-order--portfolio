import { dataTestIdNames, testPasswords, testUsers } from '@/library/constants'
import { developmentBaseURL } from '@/library/environment/publicVariables'
import { type Browser, type Page, launch } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest'
import { deleteUserSequence } from './utilities/deleteUserSequence'
import { getElementByTestId, initializePage } from './utilities/getElements'

const bothUser = testUsers.both

describe('Create Account Form', () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		deleteUserSequence(bothUser.email)
		browser = await launch()
		page = await browser.newPage()
		initializePage(page)
		await page.goto(`${developmentBaseURL}/free-trial`)
	})

	afterAll(async () => {
		deleteUserSequence(bothUser.email)
		if (page && !page.isClosed()) {
			await page.close()
		}
		if (browser) {
			await browser.close()
		}
	})

	test('can fill out and submit the form', async () => {
		const firstNameInput = await getElementByTestId(dataTestIdNames.createAccountFirstNameInput)
		const lastNameInput = await getElementByTestId(dataTestIdNames.createAccountLastNameInput)
		const businessNameInput = await getElementByTestId(dataTestIdNames.createAccountBusinessNameInput)
		const emailInput = await getElementByTestId(dataTestIdNames.createAccountEmailInput)
		const passwordInput = await getElementByTestId(dataTestIdNames.createAccountPasswordInput)
		const staySignedInCheckbox = await getElementByTestId(dataTestIdNames.createAccountStaySignedInCheckbox)
		const submitButton = await getElementByTestId(dataTestIdNames.createAccountSubmitButton)

		await firstNameInput?.type(bothUser.firstName)
		await lastNameInput?.type(bothUser.lastName)
		await businessNameInput?.type(bothUser.businessName)
		await emailInput?.type(bothUser.email)
		await staySignedInCheckbox?.click()
		await passwordInput?.type(testPasswords.illegalCharacters)
		await staySignedInCheckbox?.click()
		await submitButton?.click()
	})

	it('should not redirect to /dashboard', async () => {
		expect(page.url()).toBe(`${developmentBaseURL}/free-trial`)
	})
})
