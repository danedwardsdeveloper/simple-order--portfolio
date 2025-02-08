import { addDays } from 'date-fns'
import { and, eq as equals } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial } from '@/library/database/operations'
import { checkUser } from '@/library/database/operations/operations'
import { customerToMerchant, invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL, isProduction } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import {
  authenticationMessages,
  AuthenticationMessages,
  BaseUser,
  BasicMessages,
  basicMessages,
  CustomerToMerchant,
  httpStatus,
  Invitation,
  InvitationInsert,
} from '@/types'
import { ConfirmEmailQueryParameters } from '@/types/api/authentication/email/confirm'

export interface InvitationsCreatePOSTresponse {
  message: BasicMessages | AuthenticationMessages | 'existing relationship' | 'already invited' | 'transaction error'
}

export interface InvitationsCreatePOSTbody {
  email: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InvitationsCreatePOSTresponse>> {
  try {
    const { email }: InvitationsCreatePOSTbody = await request.json()

    // 1. Check email has been provided
    if (!email) {
      return NextResponse.json({ message: authenticationMessages.emailMissing }, { status: httpStatus.http400badRequest })
    }

    //2. Check email format is correct
    const normalisedInviteeEmail = email.toLowerCase().trim()
    if (!emailRegex.test(normalisedInviteeEmail)) {
      return NextResponse.json({ message: authenticationMessages.emailInvalid }, { status: httpStatus.http400badRequest })
    }

    // 3. Check user is signed in
    const { extractedUserId, status, message } = extractIdFromRequestCookie(request)
    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    const { userExists, emailConfirmed, cachedTrialExpired, businessName } = await checkUser(extractedUserId)
    if (!userExists) {
      return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
    }

    // 4. Check user has confirmed their email
    if (!emailConfirmed) {
      return NextResponse.json({ message: authenticationMessages.emailNotConfirmed }, { status: httpStatus.http401unauthorised })
    }

    //5 Check for active trial/subscription
    const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, cachedTrialExpired)
    if (!validSubscriptionOrTrial) {
      return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
    }

    // 6. Check if the invitee has a user row
    const [alreadyInvitedUser]: BaseUser[] = await database.select().from(users).where(equals(users.email, normalisedInviteeEmail)).limit(1)
    // 7. If they do, check `customer_relationships` for a relationship using their userId retrieved from the previous step
    if (alreadyInvitedUser) {
      // ToDo: I'm not completely sure this does what I think it does!
      const [existingRelationship]: CustomerToMerchant[] = await database
        .select()
        .from(customerToMerchant)
        .where(equals(customerToMerchant.merchantProfileId, alreadyInvitedUser.id))
      if (existingRelationship) {
        return NextResponse.json({ message: 'existing relationship' }, { status: httpStatus.http409conflict })
      }
    }

    // 8. Check `invitations` for existing invitation
    const [existingInvitation]: Invitation[] = await database
      .select()
      .from(invitations)
      .where(and(equals(invitations.email, normalisedInviteeEmail), equals(invitations.merchantProfileId, extractedUserId)))
      .limit(1)
    if (existingInvitation) {
      return NextResponse.json({ message: 'already invited' }, { status: httpStatus.http409conflict })
    }

    // Enhancement for later: handle email resends

    let transactionErrorMessage
    let transactionErrorCode: number | null = httpStatus.http503serviceUnavailable

    await database.transaction(async tx => {
      // 10.  Transaction: create new invitation row
      const invitationInsert: InvitationInsert = {
        email: normalisedInviteeEmail,
        merchantProfileId: extractedUserId,
        expiresAt: addDays(new Date(), 7),
        lastEmailSent: new Date(),
        emailAttempts: 1,
      }

      transactionErrorMessage = 'error creating invitation'
      const [createdInvitation]: Invitation[] = await database.insert(invitations).values(invitationInsert).returning()

      // ToDo: Make the front-end actually work then make a link, not a url
      const acceptanceLink = `${dynamicBaseURL}/accept-invitation?${ConfirmEmailQueryParameters.token}=${createdInvitation.token}`

      // ToDo: style this properly
      const htmlVersion = `${businessName} has invited you to join Simple Order as their customer. Click this link to accept: ${acceptanceLink}`
      const textVersion = htmlVersion

      // 11. Transaction: send confirmation email
      transactionErrorMessage = 'error sending email'
      const emailSentSuccessfully = await sendEmail({
        to: isProduction ? normalisedInviteeEmail : myPersonalEmail,
        subject: 'Invitation',
        htmlVersion,
        textVersion,
      })

      if (!emailSentSuccessfully) {
        tx.rollback()
      }
      transactionErrorMessage = null
      transactionErrorCode = null
    })

    if (transactionErrorMessage || transactionErrorCode) {
      return NextResponse.json(
        { message: transactionErrorMessage || 'transaction error' },
        { status: transactionErrorCode || httpStatus.http503serviceUnavailable },
      )
    }

    return NextResponse.json({ message: basicMessages.success }, { status })
  } catch (error) {
    logger.errorUnknown(error, 'Failed to create invitation: ')
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
