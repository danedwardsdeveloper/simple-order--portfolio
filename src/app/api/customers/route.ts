import { apiPaths, authenticationMessages, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { invitations, merchantProfiles, relationships, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { containsItems, obfuscateEmail } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeCustomerProfile, BrowserSafeInvitationRecord, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface CustomersGETresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| TokenMessages
		| typeof authenticationMessages.merchantNotFound
		| typeof authenticationMessages.dataBelongsToOtherUser
	confirmedCustomers?: BrowserSafeCustomerProfile[]
	invitedCustomers?: BrowserSafeInvitationRecord[]
}

// Get confirmed and invited customers for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<CustomersGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const [foundMerchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, extractedUserId))

		if (!foundMerchantProfile) {
			return NextResponse.json({ message: authenticationMessages.merchantNotFound }, { status: httpStatus.http401unauthorised })
		}

		if (existingDangerousUser.id !== foundMerchantProfile.userId) {
			return NextResponse.json({ message: authenticationMessages.dataBelongsToOtherUser }, { status: httpStatus.http403forbidden })
		}

		const foundConfirmedCustomers = await database
			.select({
				businessName: users.businessName,
				plainEmail: users.email,
			})
			.from(relationships)
			.innerJoin(users, eq(relationships.customerId, users.id))
			.where(eq(relationships.merchantId, extractedUserId))

		const confirmedCustomers = containsItems(foundConfirmedCustomers)
			? foundConfirmedCustomers.map((customer) => ({
					businessName: customer.businessName,
					obfuscatedEmail: obfuscateEmail(customer.plainEmail),
				}))
			: undefined

		const foundInvitedCustomers = await database.select().from(invitations).where(eq(invitations.senderUserId, extractedUserId))

		const invitedCustomers = containsItems(foundInvitedCustomers)
			? foundInvitedCustomers.map((customer) => ({
					obfuscatedEmail: obfuscateEmail(customer.email),
					lastEmailSentDate: customer.lastEmailSent,
					expirationDate: customer.expiresAt,
				}))
			: undefined

		return NextResponse.json(
			{
				message: basicMessages.success,
				confirmedCustomers,
				invitedCustomers,
			},
			{ status: httpStatus.http200ok },
		)
	} catch (error) {
		logger.error(`${apiPaths.customers} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
