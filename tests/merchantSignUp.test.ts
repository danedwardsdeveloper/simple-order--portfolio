import { desc, eq } from 'drizzle-orm'
import { type Browser, type Page, launch } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { dataTestIdNames } from '@/library/constants/definitions/dataTestId'
import { testUsers } from '@/library/constants/definitions/testUsers'
import { database } from '@/library/database/connection'
import { freeTrials, merchantProfiles, testEmailInbox, users } from '@/library/database/schema'
import { developmentBaseURL } from '@/library/environment/publicVariables'

import type { DangerousBaseUser, FreeTrial, MerchantProfile } from '@/types'
import { deleteUserSequence } from './utilities/deleteUserSequence'
import { getElementByTestId, initializePage } from './utilities/getElements'

const susanPoodle = testUsers.both

describe('Create Account Form', async () => {
	let browser: Browser
	let page: Page
	let createdUser: DangerousBaseUser
	let createdMerchant: MerchantProfile
	let _createdFreeTrial: FreeTrial
	let invitationLink: string | undefined

	beforeAll(async () => {
		deleteUserSequence(susanPoodle.email)
		browser = await launch()
		page = await browser.newPage()
		initializePage(page)
		await page.goto(`${developmentBaseURL}/free-trial`)
	})

	afterAll(async () => {
		deleteUserSequence(susanPoodle.email)
		await browser.close()
	})

	test('fill and submit the create account form', async () => {
		const firstNameInput = await getElementByTestId(dataTestIdNames.createAccountFirstNameInput)
		const lastNameInput = await getElementByTestId(dataTestIdNames.createAccountLastNameInput)
		const businessNameInput = await getElementByTestId(dataTestIdNames.createAccountBusinessNameInput)
		const emailInput = await getElementByTestId(dataTestIdNames.createAccountEmailInput)
		const passwordInput = await getElementByTestId(dataTestIdNames.createAccountPasswordInput)
		const staySignedInCheckbox = await getElementByTestId(dataTestIdNames.createAccountStaySignedInCheckbox)
		const submitButton = await getElementByTestId(dataTestIdNames.createAccountSubmitButton)

		await firstNameInput?.type('Susan')
		await lastNameInput?.type('Poodle')
		await businessNameInput?.type(`Susan's Spicey Sausages`)
		await emailInput?.type(susanPoodle.email)
		await staySignedInCheckbox?.click()
		await passwordInput?.type('securePassword123')

		await staySignedInCheckbox?.click()
		await Promise.all([page.waitForNavigation(), submitButton?.click()])
		expect(page.url()).toContain('/dashboard')
	})

	// Test cookie

	// Allow database operations to complete

	test('created user should exist in the database', async () => {
		;[createdUser] = await database.select().from(users).where(eq(users.email, susanPoodle.email)).limit(1)

		expect(createdUser).toBeDefined()
	})

	test('created merchant should exist in the database', async () => {
		const [merchant]: MerchantProfile[] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, createdUser.id))

		createdMerchant = merchant
	})

	test('free trial row should exist in the database', async () => {
		const [freeTrialRow]: FreeTrial[] = await database.select().from(freeTrials).where(eq(freeTrials.id, createdMerchant.id)).limit(1)

		expect(freeTrialRow).toBeDefined()
		_createdFreeTrial = freeTrialRow
	})

	test('ask the user to confirm their email', async () => {
		const message = await getElementByTestId(dataTestIdNames.pleaseConfirmYourEmailMessage)
		expect(message).toBeDefined()
		const text = await message?.evaluate((element) => element.textContent)
		expect(text).toContain(susanPoodle.email)
	})

	test.skip('user should have emailConfirmed=false', async () => {
		expect(createdUser.emailConfirmed).toBe(false)
	})

	test('click the test_email_inbox invitation link', async () => {
		const recentEmails = await database.select().from(testEmailInbox).orderBy(desc(testEmailInbox.id)).limit(3)

		const confirmLinkRegex = /http:\/\/[^\s<>"]+\/confirm\?token=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

		for (const email of recentEmails) {
			const matches = email.content.match(confirmLinkRegex)
			if (matches) {
				invitationLink = matches[0]
				break
			}
		}

		expect(invitationLink).toBeDefined()
	})

	test('Click the confirmation link', async () => {
		if (!invitationLink) {
			throw new Error('Invitation link missing')
		}
		await page.goto(invitationLink)

		const confirmationMessage = await getElementByTestId(dataTestIdNames.emailConfirmation.response)
		expect(confirmationMessage).toBeDefined()
		const successMessage = await confirmationMessage?.evaluate((element) => element.textContent)
		expect(successMessage).toContain('success')
	})

	test.skip('user should now have emailConfirmed=true', async () => {
		;[createdUser] = await database.select().from(users).where(eq(users.email, susanPoodle.email)).limit(1)
		expect(createdUser.emailConfirmed).toBe(true)
	})

	test('message asking to confirm email should be gone', async () => {
		await page.goto(`${developmentBaseURL}/dashboard`)
		const message = await getElementByTestId(dataTestIdNames.pleaseConfirmYourEmailMessage)
		expect(message).toBeNull()
	})

	test('A form should be present at /customers', async () => {
		await page.goto(`${developmentBaseURL}/customers`)
		const inviteCustomerForm = await getElementByTestId(dataTestIdNames.invite.form)
		expect(inviteCustomerForm).toBeDefined()
	})

	test.skip('Fill out and submit the invitation form', async () => {
		//
	})

	test.skip('Displays a success message', async () => {
		//
	})

	test.skip('An invitation now exists in the database', async () => {
		//
	})

	test.skip('Click the link from test_email_inbox', async () => {
		//
	})
})
