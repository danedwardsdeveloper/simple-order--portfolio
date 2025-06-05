import { emptyToNull } from '@/library/utilities/public'
import type { DangerousBaseUser, Invitation, NonEmptyArray, RelationshipRecord } from '@/types'

type Props = {
	dangerousUser: DangerousBaseUser
	relationshipRecords: NonEmptyArray<RelationshipRecord> | null
	invitationRecords: NonEmptyArray<Invitation> | null
}

export function mapUserIds(props: Props): NonEmptyArray<number> | null {
	const relationshipIds: number[] = []

	if (props.relationshipRecords) {
		for (const record of props.relationshipRecords) {
			relationshipIds.push(record.merchantId, record.customerId)
		}
	}

	const invitationIds = props.invitationRecords?.map((invitation) => invitation.senderUserId) ?? []

	const allIds = [...new Set([...relationshipIds, ...invitationIds])]
	const otherUserIds = allIds.filter((id) => id !== props.dangerousUser.id)

	if (otherUserIds.length === 0) {
		return null
	}

	return emptyToNull(otherUserIds)
}
