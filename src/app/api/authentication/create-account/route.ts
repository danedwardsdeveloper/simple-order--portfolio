import bcrypt from 'bcrypt'
import { eq as equals, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

import { durationOptions } from '@/library/constants/durations'
import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, merchantProfiles, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createNewMerchantEmail } from '@/library/email/templates/newMerchant'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { createFreeTrialEndTime, createMerchantSlug } from '@/library/utilities'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'

import {
  authenticationMessages,
  BaseUser,
  BaseUserWithoutPassword,
  basicMessages,
  ClientSafeBaseUser,
  cookieDurations,
  FreeTrial,
  FullClientSafeUser,
  httpStatus,
} from '@/types'
import { CreateAccountPOSTbody, CreateAccountPOSTresponse } from '@/types/api/authentication/create-account'
import { ConfirmEmailQueryParameters } from '@/types/api/authentication/email/confirm'

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

  if (!emailRegex.test(email)) {
    return NextResponse.json({ message: authenticationMessages.emailInvalid }, { status: httpStatus.http400badRequest })
  }

  try {
    const [existingUser] = await database
      .select()
      .from(users)
      .where(or(equals(users.email, email), equals(users.businessName, businessName)))
      .limit(1)

    let conflictMessage
    if (existingUser) {
      if (existingUser.email === email) conflictMessage = authenticationMessages.emailTaken
      if (existingUser.businessName === businessName) conflictMessage = authenticationMessages.businessNameTaken

      if (conflictMessage) {
        logger.error('There was a conflict')
        return NextResponse.json({ message: conflictMessage }, { status: httpStatus.http409conflict })
      }
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const { newUser, newMerchant, newFreeTrial } = await database.transaction(async tx => {
      try {
        // ToDo: Type this properly with a separate values object first
        const [newUser] = (await tx
          .insert(users)
          .values({
            firstName,
            lastName,
            email: email.toLowerCase(),
            hashedPassword,
            businessName,
            emailConfirmed: false,
          })
          .returning({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            businessName: users.businessName,
            emailConfirmed: users.emailConfirmed,
          })) as BaseUserWithoutPassword[]

        const baseSlug = createMerchantSlug(businessName)
        let slug = baseSlug

        for (let attempt = 0; attempt < 5; attempt++) {
          const existingSlug = await tx.select().from(merchantProfiles).where(equals(merchantProfiles.slug, slug)).limit(1)

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

        const [newFreeTrial] = (await tx
          .insert(freeTrials)
          .values({
            startDate: new Date(),
            endDate: createFreeTrialEndTime(),
            merchantProfileId: newMerchant.id,
          })
          .returning()) as [FreeTrial]

        const emailConfirmationToken = generateConfirmationToken()

        await tx.insert(confirmationTokens).values({
          userId: newUser.id,
          token: emailConfirmationToken,
          expiresAt: new Date(Date.now() + durationOptions.twentyFourHoursInMilliseconds),
        })

        const confirmationURL = `${dynamicBaseURL}/confirm?${ConfirmEmailQueryParameters.token}=${emailConfirmationToken}`

        const emailResponse = await sendEmail({
          to: myPersonalEmail, // ToDo: send actual emails one day soon!
          ...createNewMerchantEmail({
            recipientName: firstName,
            confirmationURL,
          }),
        })

        if (!emailResponse.success) {
          throw new Error(authenticationMessages.errorSendingEmail)
        }

        logger.info('Confirmation URL: ', confirmationURL)
        return { newUser, newMerchant, newFreeTrial }
      } catch (error) {
        logger.error('Transaction failed:', error)
        throw error
      }
    })

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
