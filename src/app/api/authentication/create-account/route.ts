import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { freeTrials, merchantProfiles, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { createFreeTrialEndTime, createMerchantSlug } from '@/library/utilities'
import { createSafeUser } from '@/library/utilities'
import {
  createCookieWithToken,
  createSessionCookieWithToken,
} from '@/library/utilities/definitions/createCookies'

import {
  basicMessages,
  ClientSafeUser,
  cookieDurations,
  CreateAccountPOSTbody,
  CreateAccountPOSTresponse,
  FreeTrial,
  HttpStatus,
  MerchantProfile,
  User,
} from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<CreateAccountPOSTresponse>> {
  const { firstName, lastName, email, password, businessName, staySignedIn }: CreateAccountPOSTbody =
    await request.json()

  if (!firstName || !lastName || !email || !password || !businessName) {
    logger.error(
      `${!firstName ? 'firstName' : !lastName ? 'lastName' : !email ? 'email' : 'password'} missing`,
    )
    return NextResponse.json(
      {
        message: basicMessages.parametersMissing,
      },
      {
        status: HttpStatus.http400badRequest,
      },
    )
  }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  try {
    const { newUser, newMerchant, newFreeTrial } = await database.transaction(async tx => {
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

      const [newMerchant] = (await tx
        .insert(merchantProfiles)
        .values({
          slug: createMerchantSlug(businessName),
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

      return { newUser, newMerchant, newFreeTrial }
    })

    const safeNewUser = createSafeUser(newUser)

    const transformedUser: ClientSafeUser = {
      ...safeNewUser,
      merchantDetails: {
        slug: newMerchant.slug,
        freeTrial: {
          endDate: new Date(newFreeTrial.endDate),
        },
        customersAsMerchant: [],
      },
    }

    logger.info('Transformed user:', JSON.stringify(transformedUser))

    const response = NextResponse.json(
      {
        message: basicMessages.success,
        user: transformedUser,
      },
      {
        status: HttpStatus.http200ok,
      },
    )

    if (staySignedIn) {
      response.cookies.set(createCookieWithToken(newUser.id, cookieDurations.oneYear))
    } else {
      response.cookies.set(createSessionCookieWithToken(newUser.id))
    }

    return response
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: basicMessages.databaseError },
      { status: HttpStatus.http500serverError },
    )
  }
}
