import type { DangerousBaseUser, FreeTrial, Invitation, NonEmptyArray, RelationshipRecord, Roles, Subscription } from '@/types'

type Props = {
	dangerousUser: DangerousBaseUser
	subscription: Subscription | null
	freeTrial: FreeTrial | null
	relationshipRecords: NonEmptyArray<RelationshipRecord> | null
	invitationRecords: NonEmptyArray<Invitation> | null
}

export function determineRoles(props: Props): Roles {
	const isMerchant = Boolean(props.subscription || props.freeTrial)

	const hasRelationshipsAsCustomer = props.relationshipRecords?.some((relationship) => relationship.customerId === props.dangerousUser.id)

	const hasBeenInvitedAsCustomer = props.invitationRecords?.some((invitation) => invitation.email === props.dangerousUser.email)

	const isCustomer = Boolean(hasRelationshipsAsCustomer || hasBeenInvitedAsCustomer)

	if (isMerchant && isCustomer) return 'both'

	return isMerchant ? 'merchant' : 'customer'
}
