import { emptyToNull } from '@/library/utilities/public'
import { equals, or } from '@/library/utilities/server'
import type { DangerousBaseUser, Invitation, NonEmptyArray } from '@/types'
import { database } from '../../connection'
import { invitations } from '../../schema'

export async function getInvitationRecords(user: DangerousBaseUser): Promise<NonEmptyArray<Invitation> | null> {
	const allInvitations = await database
		.select()
		.from(invitations)
		.where(or(equals(invitations.email, user.email), equals(invitations.senderUserId, user.id)))

	return emptyToNull(allInvitations)
}
