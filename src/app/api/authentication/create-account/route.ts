import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { durationOptions } from '@/library/constants/durations'
import { database } from '@/library/database/configuration'
import { confirmationTokens, freeTrials, merchantProfiles, users } from '@/library/database/schema'
import logger, { logUnknownError } from '@/library/logger'
import { createFreeTrialEndTime, createMerchantSlug, createSafeUser } from '@/library/utilities'
import {
  createCookieWithToken,
  createSessionCookieWithToken,
} from '@/library/utilities/definitions/createCookies'
import { generateConfirmationToken } from '@/library/utilities/generateConfirmationToken'

import {
  authenticationMessages,
  basicMessages,
  ClientSafeUser,
  cookieDurations,
  CreateAccountPOSTbody,
  CreateAccountPOSTresponse,
  FreeTrial,
  httpStatus,
  MerchantProfile,
  User,
} from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
  const { firstName, lastName, email, password, businessName, staySignedIn }: CreateAccountPOSTbody =
    await request.json()

  let missingFieldMessage

  if (!firstName) missingFieldMessage = authenticationMessages.fistNameMissing
  if (!lastName) missingFieldMessage = authenticationMessages.lastNameMissing
  if (!email) missingFieldMessage = authenticationMessages.emailMissing
  if (!password) missingFieldMessage = authenticationMessages.passwordMissing
  if (!businessName) missingFieldMessage = authenticationMessages.businessNameMissing

  if (missingFieldMessage) {
    return NextResponse.json(
      {
        message: missingFieldMessage,
      },
      {
        status: httpStatus.http400badRequest,
      },
    )
  }

  try {
    const [existingUser] = await database
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.businessName, businessName)))
      .limit(1)

    let conflictMessage
    if (existingUser) {
      if (existingUser.email === email) conflictMessage = authenticationMessages.emailTaken
      if (existingUser.businessName === businessName)
        conflictMessage = authenticationMessages.businessNameTaken

      if (conflictMessage) {
        return NextResponse.json({ message: conflictMessage }, { status: httpStatus.http409conflict })
      }
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const { newUser, newMerchant, newFreeTrial } = await database.transaction(async tx => {
      try {
        const [newUser] = (await tx
          .insert(users)
          .values({
            firstName,
            lastName,
            email,
            hashedPassword,
            businessName,
            emailConfirmed: false,
          })
          .returning()) as [User]

        const baseSlug = createMerchantSlug(businessName)
        let slug = baseSlug

        for (let attempt = 0; attempt < 5; attempt++) {
          const existingSlug = await tx
            .select()
            .from(merchantProfiles)
            .where(eq(merchantProfiles.slug, slug))
            .limit(1)

          if (existingSlug.length === 0) break
          slug = `${baseSlug}-${attempt + 1}`
        }

        const [newMerchant] = (await tx
          .insert(merchantProfiles)
          .values({
            slug,
            userId: newUser.id,
          })
          .returning()) as [MerchantProfile]

        const [newFreeTrial] = (await tx
          .insert(freeTrials)
          .values({
            startDate: new Date(),
            endDate: createFreeTrialEndTime(),
            merchantProfileId: newMerchant.id,
          })
          .returning()) as [FreeTrial]

        await tx.insert(confirmationTokens).values({
          userId: newUser.id,
          token: generateConfirmationToken(),
          expiresAt: new Date(Date.now() + durationOptions.twentyFourHoursInMilliseconds),
        })

        return { newUser, newMerchant, newFreeTrial }
      } catch (error) {
        logger.error('Transaction failed:', error)
        throw error
      }
    })

    const safeNewUser = createSafeUser(newUser)

    const transformedUser: ClientSafeUser = {
      ...safeNewUser,
      merchantDetails: {
        slug: newMerchant.slug,
        freeTrial: { endDate: new Date(newFreeTrial.endDate) },
        customersAsMerchant: [],
      },
    }

    const response = NextResponse.json(
      { message: basicMessages.success, user: transformedUser },
      { status: httpStatus.http200ok },
    )

    response.cookies.set(
      staySignedIn
        ? createCookieWithToken(newUser.id, cookieDurations.oneYear)
        : createSessionCookieWithToken(newUser.id),
    )

    return response
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message
      if (errorMessage.includes('UNIQUE constraint failed')) {
        let constraintMessage
        if (errorMessage.includes(users.email.name)) constraintMessage = authenticationMessages.emailTaken
        if (errorMessage.includes(users.businessName.name))
          constraintMessage = authenticationMessages.businessNameTaken
        if (errorMessage.includes(merchantProfiles.slug.name))
          constraintMessage = authenticationMessages.slugTaken

        if (constraintMessage) {
          return NextResponse.json({ message: constraintMessage }, { status: httpStatus.http409conflict })
        }
      }
    }

    logUnknownError(error, 'Error creating user')
    return NextResponse.json(
      { message: basicMessages.databaseError },
      { status: httpStatus.http500serverError },
    )
  }
}
