import { Browser, launch, Page } from 'puppeteer'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import { testPasswords, testUsers } from '@/library/constants/testUsers'
import { developmentBaseURL, isProduction } from '@/library/environment/publicVariables'

import { getElements } from './utilities/getElements'
import { cookieNames } from '@/types'

describe('Sign in', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launch()
    page = await browser.newPage()
    getElements.initialise(page)
    await page.goto(`${developmentBaseURL}/sign-in`)
  })

  afterAll(async () => {
    await browser.close()
  })

  // test(`signing in with the wrong password doesn't work`, async () => {
  //   const someValue = true
  //   expect(someValue).toBe(true)
  // })

  test('signs in with the test user', async () => {
    const emailInput = await getElements.byTestId(dataTestIdNames.signIn.emailInput)
    expect(emailInput).toBeDefined()
    await emailInput?.type(testUsers.permanentTestUser.email)

    const passwordInput = await getElements.byTestId(dataTestIdNames.signIn.passwordInput)
    expect(passwordInput).toBeDefined()
    await passwordInput?.type(testPasswords.good)

    const staySignedInCheckbox = await getElements.byTestId(dataTestIdNames.signIn.staySignedInCheckbox)
    expect(staySignedInCheckbox).toBeDefined()
    await staySignedInCheckbox?.click()

    const submitButton = await getElements.byTestId(dataTestIdNames.signIn.submitButton)
    expect(submitButton).toBeDefined()

    await submitButton?.click()

    await page.waitForNavigation()
    expect(page.url()).toContain('/dashboard')

    const cookies = await browser.cookies()
    const token = cookies.find(cookie => cookie.name === cookieNames.token)

    expect(token).toBeDefined()
    expect(token?.secure).toBe(isProduction)
    expect(token?.httpOnly).toBe(true)
    expect(token?.sameSite).toBe('Strict')
    expect(token?.session).toBe(false)

    const oneYearInSeconds = 365 * 24 * 60 * 60
    const tokenExpiry = token!.expires - Math.floor(Date.now() / 1000)
    expect(tokenExpiry).toBeCloseTo(oneYearInSeconds, -2) // Allow ~100 seconds difference
  })

  // test('token cookie is set properly', async () => {
  //   const someValue = true
  //   expect(someValue).toBe(true)
  // })

  test('signs out with the test user', async () => {
    await page.goto(`${developmentBaseURL}/settings`)
    const signOutButton = await getElements.byTestId(dataTestIdNames.account.signOutButton)
    expect(signOutButton).toBeDefined()

    await Promise.all([page.waitForNavigation(), signOutButton!.click()])

    expect(page.url()).toBe(`${developmentBaseURL}/`)
  })

  test('token cookie has been deleted', async () => {
    const cookies = await browser.cookies()
    const token = cookies.find(cookie => cookie.name === cookieNames.token)
    expect(token).toBeUndefined()
  })
})
