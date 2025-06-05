import type { BrowserSafeCustomerProfile, BrowserSafeMerchantProfile, DangerousBaseUser, NonEmptyArray, RelationshipRecord } from '@/types'
import { emptyToNull, obfuscateEmail } from '../../public'

interface Props {
	dangerousUser: DangerousBaseUser
	relationshipRecords: NonEmptyArray<RelationshipRecord> | null
	profiles: NonEmptyArray<DangerousBaseUser> | null
}

export function mapConfirmedRelationships(props: Props): {
	confirmedCustomers: NonEmptyArray<BrowserSafeCustomerProfile> | null
	confirmedMerchants: NonEmptyArray<BrowserSafeMerchantProfile> | null
} {
	if (!props.relationshipRecords || !props.profiles) {
		return { confirmedCustomers: null, confirmedMerchants: null }
	}

	const profilesMap = new Map(props.profiles.map((p) => [p.id, p]))

	const customers: BrowserSafeCustomerProfile[] = props.relationshipRecords
		.filter((relationship) => relationship.merchantId === props.dangerousUser.id)
		.map((relationship) => profilesMap.get(relationship.customerId))
		.filter((user): user is DangerousBaseUser => user !== undefined)
		.map((customer) => ({
			businessName: customer.businessName,
			obfuscatedEmail: obfuscateEmail(customer.email), //
		}))

	const merchants: BrowserSafeMerchantProfile[] = props.relationshipRecords
		.filter((relationship) => relationship.customerId === props.dangerousUser.id)
		.map((relationship) => profilesMap.get(relationship.merchantId))
		.filter((user): user is DangerousBaseUser => user !== undefined)
		.map((merchant) => ({
			businessName: merchant.businessName,
			slug: merchant.slug,
			cutOffTime: merchant.cutOffTime,
			leadTimeDays: merchant.leadTimeDays,
			minimumSpendPence: merchant.minimumSpendPence,
		}))

	return {
		confirmedCustomers: emptyToNull(customers),
		confirmedMerchants: emptyToNull(merchants),
	}
}
