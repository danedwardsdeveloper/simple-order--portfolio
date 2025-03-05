import { apiPaths, cookieNames, dataTestIdNames, testPasswords, testUsers } from '@/library/constants'
import { developmentBaseURL, isProduction } from '@/library/environment/publicVariables'
import { type Browser, type Cookie, type Page, launch } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getElementByTestId, initializePage } from './utilities/getElements'

describe('Sign in', () => {
	let browser: Browser
	let page: Page
	let token: Cookie | undefined

	beforeAll(async () => {
		browser = await launch()
		page = await browser.newPage()
		initializePage(page)
		await page.goto(`${developmentBaseURL}/sign-in`)
	})

	afterAll(async () => {
		await browser.close()
	})

	// test(`signing in with the wrong password doesn't work`, async () => {
	//   const someValue = true
	//   expect(someValue).toBe(true)
	// })

	test('fills in and submits the sign-in form', async () => {
		const emailInput = await getElementByTestId(dataTestIdNames.signIn.emailInput)
		expect(emailInput).toBeDefined()
		await emailInput?.type(testUsers.permanentBoth.email)

		const passwordInput = await getElementByTestId(dataTestIdNames.signIn.passwordInput)
		expect(passwordInput).toBeDefined()
		await passwordInput?.type(testPasswords.good)

		const submitButton = await getElementByTestId(dataTestIdNames.signIn.submitButton)
		expect(submitButton).toBeDefined()

		await submitButton?.click()
	})

	test('navigates to the dashboard', async () => {
		await page.waitForNavigation()
		expect(page.url()).toContain('/dashboard')
	})

	test('token cookie has been set', async () => {
		const cookies = await browser.cookies()
		token = cookies.find((cookie) => cookie.name === cookieNames.token)

		expect(token).toBeDefined()
		expect(token?.secure).toBe(isProduction)
		expect(token?.httpOnly).toBe(true)
		expect(token?.sameSite).toBe('Strict')
		expect(token?.session).toBe(false)
	})

	test('token expires in one year', async () => {
		const oneYearInSeconds = 365 * 24 * 60 * 60
		if (!token?.expires) {
			throw new Error(`Token missing, or token missing 'expires' property`)
		}
		const tokenExpiry = token?.expires - Math.floor(Date.now() / 1000)
		expect(tokenExpiry).toBeCloseTo(oneYearInSeconds, -2) // Allow ~100 seconds difference
	})

	// test('token cookie is set properly', async () => {
	//   const someValue = true
	//   expect(someValue).toBe(true)
	// })

	test('signs out with the test user', async () => {
		await page.goto(`${developmentBaseURL}/settings`)
		const signOutButton = await getElementByTestId(dataTestIdNames.account.signOutButton)
		expect(signOutButton).toBeDefined()

		await Promise.all([
			page.waitForResponse((response) => response.url().includes(apiPaths.authentication.signOut)),
			signOutButton?.click(),
		])
	})

	test('token cookie has been deleted', async () => {
		const cookies = await browser.cookies()
		const token = cookies.find((cookie) => cookie.name === cookieNames.token)
		expect(token).toBeUndefined()
	})
})
