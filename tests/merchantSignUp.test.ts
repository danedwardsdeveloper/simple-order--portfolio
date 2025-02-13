import { eq } from 'drizzle-orm'
import { Browser, launch, Page } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import { testUsers } from '@/library/constants/testUsers'
import { database } from '@/library/database/connection'
import { freeTrials, merchantProfiles, testEmailInbox, users } from '@/library/database/schema'
import { developmentBaseURL } from '@/library/environment/publicVariables'

import { deleteUserSequence } from './utilities/deleteUserSequence'
import { getElements } from './utilities/getElements'
import { BaseUser, FreeTrial, MerchantProfile } from '@/types'

const susanPoodle = testUsers.both

describe('Create Account Form', async () => {
  let browser: Browser
  let page: Page
  let createdUser: BaseUser
  let createdMerchant: MerchantProfile
  let createdFreeTrial: FreeTrial

  beforeAll(async () => {
    deleteUserSequence(susanPoodle.email)
    browser = await launch()
    page = await browser.newPage()
    getElements.initialise(page)
    await page.goto(`${developmentBaseURL}/free-trial`)
  })

  afterAll(async () => {
    deleteUserSequence(susanPoodle.email)
    await browser.close()
  })

  test('fill and submit the create account form', async () => {
    const firstNameInput = await getElements.byTestId(dataTestIdNames.createAccountFirstNameInput)
    const lastNameInput = await getElements.byTestId(dataTestIdNames.createAccountLastNameInput)
    const businessNameInput = await getElements.byTestId(dataTestIdNames.createAccountBusinessNameInput)
    const emailInput = await getElements.byTestId(dataTestIdNames.createAccountEmailInput)
    const passwordInput = await getElements.byTestId(dataTestIdNames.createAccountPasswordInput)
    const staySignedInCheckbox = await getElements.byTestId(dataTestIdNames.createAccountStaySignedInCheckbox)
    const submitButton = await getElements.byTestId(dataTestIdNames.createAccountSubmitButton)

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
    createdFreeTrial = freeTrialRow
  })

  test('ask the user to confirm their email', async () => {
    const message = await getElements.byTestId(dataTestIdNames.pleaseConfirmYourEmailMessage)
    expect(message).toBeDefined()
    const text = await message?.evaluate(element => element.textContent)
    expect(text).toContain(susanPoodle.email)
  })

  test.skip('user should have emailConfirmed=false', async () => {
    expect(createdUser.emailConfirmed).toBe(false)
  })

  test('click the test_email_inbox invitation link', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const [emailRow] = await database.select().from(testEmailInbox).where(eq(testEmailInbox.id, 1))
    await page.goto(emailRow.content)
    const confirmationMessage = await getElements.byTestId(dataTestIdNames.emailConfirmation.response)
    expect(confirmationMessage).toBeDefined()
    const successMessage = await confirmationMessage?.evaluate(element => element.textContent)
    expect(successMessage).toContain('success')
  })

  test.skip('user should now have emailConfirmed=true', async () => {
    ;[createdUser] = await database.select().from(users).where(eq(users.email, susanPoodle.email)).limit(1)
    expect(createdUser.emailConfirmed).toBe(true)
  })

  test('message asking to confirm email should be gone', async () => {
    await page.goto(`${developmentBaseURL}/dashboard`)
    const message = await getElements.byTestId(dataTestIdNames.pleaseConfirmYourEmailMessage)
    expect(message).toBeNull()
  })

  test('A form should be present at /customers', async () => {
    await page.goto(`${developmentBaseURL}/customers`)
    const inviteCustomerForm = await getElements.byTestId(dataTestIdNames.invite.form)
    expect(inviteCustomerForm).toBeDefined()
  })
})
