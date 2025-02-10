import { eq } from 'drizzle-orm'
import { Browser, launch, Page } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import { database } from '@/library/database/connection'
import { testEmailInbox } from '@/library/database/schema'
import { developmentBaseURL } from '@/library/environment/publicVariables'

import { testPasswords, testUsers } from '../src/library/constants/testUsers'
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
    await passwordInput?.type(testPasswords.good)

    await staySignedInCheckbox?.click()
    await submitButton?.click()
  })

  it('should redirect to /dashboard', async () => {
    await page.waitForNavigation()
    expect(page.url()).toContain('/dashboard')
  })

  it('should ask the user to confirm their email', async () => {
    const message = await getElements.byTestId(dataTestIdNames.pleaseConfirmYourEmailMessage)
    expect(message).toBeDefined()
    const text = await message?.evaluate(element => element.textContent)
    expect(text).toContain(bothUser.email)
  })

  test('retrieve the confirmation link from the test_email_inbox table and click the link', async () => {
    const [emailRow] = await database.select().from(testEmailInbox).where(eq(testEmailInbox.id, 1))
    await page.goto(emailRow.content)
    const confirmationMessage = await getElements.byTestId(dataTestIdNames.emailConfirmationFeedback)
    expect(confirmationMessage).toBeDefined()
    const successMessage = await confirmationMessage?.evaluate(element => element.textContent)
    expect(successMessage).toContain('success')
  })
})
