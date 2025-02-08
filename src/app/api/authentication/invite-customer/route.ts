import { sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/connection'
import { customerToMerchant, invitations } from '@/library/database/schema'
import { productionBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { generateConfirmationToken } from '@/library/utilities/definitions/generateConfirmationToken'

import { BasicMessages, basicMessages, httpStatus } from '@/types'

export interface InviteCustomerPOSTresponse {
  message: BasicMessages | 'already a confirmed customer of this merchant' | 'already invited' | 'error generating invitation link'
}

export interface InviteCustomerPOSTbody {
  userId: number
  invitedEmail: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InviteCustomerPOSTresponse>> {
  // Wrap in protected route!
  try {
    const body = (await request.json()) as InviteCustomerPOSTbody
    const { userId, invitedEmail } = body

    const result = await database.transaction(async tx => {
      const [existingCustomer] = await tx
        .select()
        .from(customerToMerchant)
        .where(sql`customer_profile_id = ${userId} AND accepted = true`)
        .limit(1)

      if (existingCustomer) {
        return { status: 'already_customer' }
      }

      // ToDo: don't use SQL
      const [existingInvitation] = await tx
        .select()
        .from(invitations)
        .where(sql`email = ${invitedEmail} AND expires_at > datetime('now')`)
        .limit(1)

      if (existingInvitation) {
        return { status: 'already_invited' }
      }

      const token = generateConfirmationToken()
      const [newInvitation] = await tx
        .insert(invitations)
        .values({
          email: invitedEmail,
          merchantProfileId: userId,
          token,
          // ToDo: create global expiration object
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          lastEmailSent: new Date(),
        })
        .returning()

      return { status: 'invitation_created', invitation: newInvitation }
    })

    if (result.status === 'already_customer') {
      return NextResponse.json({ message: 'already a confirmed customer of this merchant' }, { status: httpStatus.http400badRequest })
    }

    if (result.status === 'already_invited') {
      return NextResponse.json({ message: 'already invited' }, { status: httpStatus.http400badRequest })
    }

    if (!result.invitation) {
      return NextResponse.json({ message: 'error generating invitation link' }, { status: httpStatus.http501notImplemented })
    }

    const invitationURL = `${productionBaseURL}/api/authentication/confirm/${result.invitation.token}`
    logger.info('Invitation url: ', invitationURL)

    return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http200ok })
  } catch (error) {
    logger.error('Error inviting customer: ', error instanceof Error ? error.message : `Unknown error: ${JSON.stringify(error)}`)
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
