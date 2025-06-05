import { durationSettings } from '@/library/constants'
import { database } from '@/library/database/connection'
import { invitations } from '@/library/database/schema'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { generateUuid } from '@/library/utilities/public'
import type { Invitation, InvitationInsert, Transaction } from '@/types'
import urlJoin from 'url-join'
import type { UUIDTypes } from 'uuid'

export function createInvitationURL(token: UUIDTypes) {
	// Links to the front-end, which then passes the token to the server
	return urlJoin(dynamicBaseURL, 'accept-invitation', String(token))
}

type Input = {
	senderUserId: number
	recipientEmail: string
	attempts?: number
	tx?: Transaction
}

type Output = Promise<{
	invitationURL: string
	newInvitationExpiryDate: Date
	lastEmailSent: Date
}>

// ToDo: Add try/catch and success flag!
export async function createInvitation({ senderUserId, recipientEmail, attempts, tx }: Input): Output {
	const expiryDate = new Date(Date.now() + durationSettings.acceptInvitationExpiry)

	const invitationInsert: InvitationInsert = {
		email: recipientEmail,
		senderUserId,
		token: generateUuid(),
		expiresAt: expiryDate,
		lastEmailSent: new Date(),
		emailAttempts: attempts || 1,
	}

	const queryRunner = tx ?? database
	const [{ token, expiresAt: newInvitationExpiryDate, lastEmailSent }]: Invitation[] = await queryRunner
		.insert(invitations)
		.values(invitationInsert)
		.returning()

	const invitationURL = createInvitationURL(token)
	logger.info('Invitation URL: ', invitationURL)

	return { invitationURL, newInvitationExpiryDate, lastEmailSent }
}
