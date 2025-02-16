import { type Browser, type Page, launch } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import { testPasswords, testUsers } from '@/library/constants/testUsers'
import { developmentBaseURL } from '@/library/environment/publicVariables'

import { deleteUserSequence } from './utilities/deleteUserSequence'
import { getElements } from './utilities/getElements'

const bothUser = testUsers.both

describe('Create Account Form', () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		deleteUserSequence(bothUser.email)
		browser = await launch()
		page = await browser.newPage()
		getElements.initialise(page)
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
		const firstNameInput = await getElements.byTestId(dataTestIdNames.createAccountFirstNameInput)
		const lastNameInput = await getElements.byTestId(dataTestIdNames.createAccountLastNameInput)
		const businessNameInput = await getElements.byTestId(dataTestIdNames.createAccountBusinessNameInput)
		const emailInput = await getElements.byTestId(dataTestIdNames.createAccountEmailInput)
		const passwordInput = await getElements.byTestId(dataTestIdNames.createAccountPasswordInput)
		const staySignedInCheckbox = await getElements.byTestId(dataTestIdNames.createAccountStaySignedInCheckbox)
		const submitButton = await getElements.byTestId(dataTestIdNames.createAccountSubmitButton)

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
