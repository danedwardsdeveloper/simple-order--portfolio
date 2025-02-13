import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

import { durationOptions } from '@/library/constants/durations'
import { checkIsTestEmail } from '@/library/constants/testUsers'
import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, merchantProfiles, testEmailInbox, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail } from '@/library/email/templates/newMerchant'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL, isProduction } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { containsIllegalCharacters, createFreeTrialEndTime, createMerchantSlug } from '@/library/utilities'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'

import {
  authenticationMessages,
  BaseUser,
  BaseUserWithoutPassword,
  basicMessages,
  cookieDurations,
  FreeTrial,
  FullClientSafeUser,
  httpStatus,
  illegalCharactersMessages,
  NewBaseUser,
  NewFreeTrial,
} from '@/types'
import { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '@/types/api/authentication/create-account'
import { ConfirmEmailQueryParameters } from '@/types/api/authentication/email/confirm'
import { TestEmailInsert } from '@/types/definitions/testEmailInbox'

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
  const { firstName, lastName, email, password, businessName, staySignedIn }: CreateAccountPOSTbody = await request.json()

  let missingFieldMessage
  if (!firstName) missingFieldMessage = authenticationMessages.fistNameMissing
  if (!lastName) missingFieldMessage = authenticationMessages.lastNameMissing
  if (!email) missingFieldMessage = authenticationMessages.emailMissing
  if (!password) missingFieldMessage = authenticationMessages.passwordMissing
  if (!businessName) missingFieldMessage = authenticationMessages.businessNameMissing

  if (missingFieldMessage) {
    return NextResponse.json({ message: missingFieldMessage }, { status: httpStatus.http400badRequest })
  }

  let illegalCharactersMessage
  if (containsIllegalCharacters(firstName)) illegalCharactersMessage = illegalCharactersMessages.firstName
  if (containsIllegalCharacters(lastName)) illegalCharactersMessage = illegalCharactersMessages.lastName
  if (containsIllegalCharacters(password)) illegalCharactersMessage = illegalCharactersMessages.password
  if (containsIllegalCharacters(businessName)) illegalCharactersMessage = illegalCharactersMessages.businessName

  if (illegalCharactersMessage) {
    return NextResponse.json({ message: illegalCharactersMessage }, { status: httpStatus.http400badRequest })
  }

  const normalisedEmail = email.toLowerCase().trim()
  if (!emailRegex.test(normalisedEmail)) {
    return NextResponse.json({ message: authenticationMessages.emailInvalid }, { status: httpStatus.http400badRequest })
  }

  try {
    const [existingUser] = await database
      .select()
      .from(users)
      .where(or(eq(users.email, normalisedEmail), eq(users.businessName, businessName)))
      .limit(1)

    let conflictMessage
    if (existingUser) {
      if (existingUser.email === normalisedEmail) conflictMessage = authenticationMessages.emailTaken
      if (existingUser.businessName === businessName) conflictMessage = authenticationMessages.businessNameTaken

      if (conflictMessage) {
        logger.error('There was a conflict')
        return NextResponse.json({ message: conflictMessage }, { status: httpStatus.http409conflict })
      }
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // ToDo: Use proper codes
    let transactionErrorMessage: string | null = basicMessages.serverError
    let transactionErrorStatusCode: number | null = httpStatus.http503serviceUnavailable

    const { newUser, newMerchant, newFreeTrial } = await database.transaction(async tx => {
      const newUserInsert: NewBaseUser = {
        firstName,
        lastName,
        email: normalisedEmail,
        hashedPassword,
        businessName,
        emailConfirmed: false,
        cachedTrialExpired: false,
      }

      const [newUser]: BaseUserWithoutPassword[] = await tx.insert(users).values(newUserInsert).returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        businessName: users.businessName,
        emailConfirmed: users.emailConfirmed,
        cachedTrialExpired: users.cachedTrialExpired,
      })

      logger.debug('New user: ', JSON.stringify(newUser))

      const baseSlug = createMerchantSlug(businessName)
      let slug = baseSlug

      for (let attempt = 0; attempt < 5; attempt++) {
        const existingSlug = await tx.select().from(merchantProfiles).where(eq(merchantProfiles.slug, slug)).limit(1)

        if (existingSlug.length === 0) break
        slug = `${baseSlug}-${attempt + 1}`
      }

      const [newMerchant] = await tx
        .insert(merchantProfiles)
        .values({
          slug,
          userId: newUser.id,
        })
        .returning()

      logger.debug('New merchant profile: ', JSON.stringify(newMerchant))

      // The free trial is linked to the merchantId, not the userId! This is because not all users are merchants
      const freeTrialInsert: NewFreeTrial = {
        startDate: new Date(),
        endDate: createFreeTrialEndTime(),
        userId: newUser.id,
      }

      const [newFreeTrial]: FreeTrial[] = await tx.insert(freeTrials).values(freeTrialInsert).returning()

      logger.debug('New free trial: ', JSON.stringify(newFreeTrial))

      const emailConfirmationToken = generateConfirmationToken()

      await tx.insert(confirmationTokens).values({
        userId: newUser.id,
        token: emailConfirmationToken,
        expiresAt: new Date(Date.now() + durationOptions.twentyFourHoursInMilliseconds),
      })

      const confirmationURL = `${dynamicBaseURL}/confirm?${ConfirmEmailQueryParameters.token}=${emailConfirmationToken}`
      logger.info('Confirmation URL: ', confirmationURL)

      const testEmailValues: TestEmailInsert = {
        id: 1,
        content: confirmationURL,
      }

      const isTestEmail = checkIsTestEmail(normalisedEmail)

      if (isTestEmail) {
        // ToDo: Make this into a reusable function. I tried but it's complicated...
        await tx
          .insert(testEmailInbox)
          .values(testEmailValues)
          .onConflictDoUpdate({
            target: testEmailInbox.id,
            set: {
              content: confirmationURL,
            },
          })
      } else {
        // ToDo: style actual email
        transactionErrorMessage = authenticationMessages.errorSendingEmail
        const emailSentSuccessfully = await sendEmail({
          to: isProduction ? email : myPersonalEmail,
          ...createNewMerchantEmail({
            recipientName: firstName,
            confirmationURL,
          }),
        })
        if (!emailSentSuccessfully) tx.rollback()
      }
      transactionErrorMessage = null
      transactionErrorStatusCode = null

      return { newUser, newMerchant, newFreeTrial }
    })

    if (!newUser || !newMerchant || !newFreeTrial || transactionErrorMessage || transactionErrorStatusCode) {
      // ToDo: Use proper codes
      return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http503serviceUnavailable })
    }

    const { id, ...clientSafeBaseUser } = newUser as BaseUser

    const transformedUser: FullClientSafeUser = {
      ...clientSafeBaseUser,
      merchantDetails: {
        slug: newMerchant.slug,
        freeTrial: { endDate: new Date(newFreeTrial.endDate) },
        customersAsMerchant: [],
      },
    }

    const response = NextResponse.json({ message: basicMessages.success, user: transformedUser }, { status: httpStatus.http200ok })

    response.cookies.set(
      staySignedIn ? createCookieWithToken(newUser.id, cookieDurations.oneYear) : createSessionCookieWithToken(newUser.id),
    )

    return response
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message

      if (errorMessage.includes('duplicate key value violates unique constraint')) {
        let constraintMessage
        if (errorMessage.includes(users.email.name)) constraintMessage = authenticationMessages.emailTaken
        if (errorMessage.includes(users.businessName.name)) constraintMessage = authenticationMessages.businessNameTaken
        if (errorMessage.includes(merchantProfiles.slug.name)) constraintMessage = authenticationMessages.slugTaken

        if (constraintMessage) {
          return NextResponse.json({ message: constraintMessage }, { status: httpStatus.http409conflict })
        }

        if (errorMessage === 'error sending email') {
          return NextResponse.json({ message: authenticationMessages.errorSendingEmail }, { status: httpStatus.http503serviceUnavailable })
        }
      }
    }

    logger.errorUnknown(error, 'Error creating user: ')
    return NextResponse.json({ message: basicMessages.databaseError }, { status: httpStatus.http500serverError })
  }
}
