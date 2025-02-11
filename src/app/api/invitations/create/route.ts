import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import urlJoin from 'url-join'
import { v4 as generateConfirmationToken } from 'uuid'

import { durationSettings } from '@/library/constants/durations'
import { isTestEmail } from '@/library/constants/testUsers'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { customerToMerchant, invitations, testEmailInbox, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createExistingUserInvitation } from '@/library/email/templates/invitations/existingUser'
import { createNewUserInvitation } from '@/library/email/templates/invitations/newUser'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL, isProduction } from '@/library/environment/publicVariables'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { obfuscateEmail } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import {
  apiPaths,
  authenticationMessages,
  AuthenticationMessages,
  BaseUser,
  BasicMessages,
  basicMessages,
  BrowserSafeInvitationRecord,
  CustomerToMerchant,
  httpStatus,
  Invitation,
  InvitationInsert,
} from '@/types'
import { TestEmailInsert } from '@/types/definitions/testEmailInbox'

export interface InviteCustomerPOSTresponse {
  message: BasicMessages | AuthenticationMessages | string // ToDo: make this strict
  browserSafeInvitationRecord?: BrowserSafeInvitationRecord
}

export interface InviteCustomerPOSTbody {
  invitedEmail: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InviteCustomerPOSTresponse>> {
  try {
    const { invitedEmail }: InviteCustomerPOSTbody = await request.json()

    // 1. Check the email has been provided
    if (!invitedEmail) {
      return NextResponse.json({ message: 'email missing' }, { status: 400 })
    }

    // 2. Normalise email
    const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

    // 3. Check email format
    if (!emailRegex.test(normalisedInvitedEmail)) {
      return NextResponse.json({ message: 'invalid email' }, { status: 400 })
    }

    // 4. Check for valid token
    const { extractedUserId, status, message } = extractIdFromRequestCookie(request)
    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    // 5. Check user exists and emailConfirmed
    const { userExists, existingUser } = await checkUserExists(extractedUserId)

    if (!userExists || !existingUser) {
      return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
    }

    if (!existingUser.emailConfirmed) {
      return NextResponse.json({ message: authenticationMessages.emailNotConfirmed }, { status: httpStatus.http401unauthorised })
    }

    if (existingUser.email === normalisedInvitedEmail) {
      return NextResponse.json({ message: 'attempted to invite self' }, { status: 400 })
    }

    // 6. Check user has an active subscription or trial
    const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingUser.cachedTrialExpired)
    if (!validSubscriptionOrTrial) {
      return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
    }

    // 7. Check if invitee already has an account
    const [inviteeAlreadyHasAccount]: BaseUser[] = await database
      .select()
      .from(users)
      .where(eq(users.email, normalisedInvitedEmail))
      .limit(1)

    if (inviteeAlreadyHasAccount) {
      // 8. If so, look for an existing relationship
      const [existingRelationship]: CustomerToMerchant[] = await database
        .select()
        .from(customerToMerchant)
        .where(
          and(
            eq(customerToMerchant.merchantProfileId, extractedUserId),
            eq(customerToMerchant.customerProfileId, inviteeAlreadyHasAccount.id),
          ),
        )
      if (existingRelationship) {
        return NextResponse.json({ message: 'relationship exists' }, { status: httpStatus.http202accepted })
      }
    }

    // 9. Check for an existing invitation
    const [existingInvitation]: Invitation[] = await database
      .select()
      .from(invitations)
      .where(and(eq(invitations.merchantProfileId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))

    let expiredInvitation: Invitation | null
    if (existingInvitation) {
      // 10. Check existing invitation expiry
      expiredInvitation = existingInvitation.expiresAt < new Date() ? existingInvitation : null
      if (!expiredInvitation) {
        // An in-date invitation already exists, so early return to prevent merchants from spamming potential customers
        return NextResponse.json({ message: 'in-date invitation exists' }, { status: 400 })
      }
    }

    let transactionErrorMessage: string | null
    let transactionErrorCode: number | null

    const newInvitationExpiryDate = new Date(Date.now() + durationSettings.acceptInvitationExpiry)

    await database.transaction(async tx => {
      transactionErrorCode = httpStatus.http503serviceUnavailable

      if (expiredInvitation) {
        transactionErrorMessage = 'error deleting expired invitation'
        // 8. Transaction: Delete expired invitation if it exists
        tx.delete(invitations).where(and(eq(invitations.merchantProfileId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))
      }

      // 9. Transaction: create a new invitation row
      const invitationInsert: InvitationInsert = {
        email: normalisedInvitedEmail,
        merchantProfileId: extractedUserId,
        token: generateConfirmationToken(),
        expiresAt: newInvitationExpiryDate,
        lastEmailSent: new Date(),
      }
      transactionErrorMessage = 'error creating new invitation'
      const [newInvitation]: Invitation[] = await tx.insert(invitations).values(invitationInsert).returning()

      // 10. Generate the invitation link.
      const invitationURL = urlJoin(
        dynamicBaseURL,
        // Remember this is a link to the front-end, which then passes the token to the server
        'accept-invitation',
        newInvitation.token,
      )

      logger.info('Invitation url: ', invitationURL)

      const testEmail = isTestEmail(normalisedInvitedEmail)

      if (testEmail) {
        // 10. Transaction: if a test, record the email in test_email_inbox
        const testEmailValues: TestEmailInsert = {
          id: 1,
          content: invitationURL,
        }
        transactionErrorMessage = 'error saving link in test_email_inbox'
        const [testEmailRow]: TestEmailInsert[] = await tx
          .insert(testEmailInbox)
          .values(testEmailValues)
          .onConflictDoUpdate({
            target: testEmailInbox.id,
            set: {
              content: testEmailValues.content,
            },
          })
          .returning()
        if (!testEmailRow) tx.rollback()
      }

      if (!testEmail) {
        // 11. Transaction: send the invitation email if it isn't a test address
        transactionErrorMessage = authenticationMessages.errorSendingEmail
        const emailTemplate = inviteeAlreadyHasAccount
          ? createExistingUserInvitation({
              recipientEmail: normalisedInvitedEmail,
              merchantBusinessName: existingUser.businessName,
              invitationURL,
              expiryDate: newInvitationExpiryDate,
            })
          : createNewUserInvitation({
              recipientEmail: normalisedInvitedEmail,
              merchantBusinessName: existingUser.businessName,
              invitationURL,
              expiryDate: newInvitationExpiryDate,
            })

        const sendEmailResponse = await sendEmail({
          to: isProduction ? normalisedInvitedEmail : myPersonalEmail,
          ...emailTemplate,
        })
        if (!sendEmailResponse.success) tx.rollback()
      }
    })

    transactionErrorMessage = null
    transactionErrorCode = null

    if (transactionErrorMessage || transactionErrorCode) {
      return NextResponse.json({ message: transactionErrorMessage || 'unknown transaction error' }, { status: transactionErrorCode || 503 })
    }

    // 12. Return browser-safe details
    const browserSafeInvitationRecord: BrowserSafeInvitationRecord = {
      obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
      expirationDate: newInvitationExpiryDate,
    }

    return NextResponse.json({ message: basicMessages.success, browserSafeInvitationRecord }, { status: httpStatus.http200ok })
  } catch (error) {
    logger.errorUnknown(error)
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
