import { emptyToNull, obfuscateEmail } from '@/library/utilities/public'
import { and, equals, or } from '@/library/utilities/server'
import type { UserContextType } from '@/types'
import { database } from '../../connection'
import { relationships, users } from '../../schema'

type Output = Pick<UserContextType, 'confirmedCustomers' | 'confirmedMerchants'>

/**
 * @deprecated This does too many things at once
 */
export async function getRelationshipsOld(userId: number): Promise<Output> {
	const relationshipsResult = emptyToNull(
		await database
			.select({
				userId: users.id,
				businessName: users.businessName,
				email: users.email,
				slug: users.slug,
				cutOffTime: users.cutOffTime,
				leadTimeDays: users.leadTimeDays,
				minimumSpendPence: users.minimumSpendPence,
				isMerchant: equals(relationships.merchantId, users.id),
			})
			.from(relationships)
			.innerJoin(
				users,
				or(
					and(equals(relationships.merchantId, userId), equals(relationships.customerId, users.id)),
					and(equals(relationships.customerId, userId), equals(relationships.merchantId, users.id)),
				),
			),
	)

	if (!relationshipsResult) {
		return { confirmedCustomers: null, confirmedMerchants: null }
	}

	const mappedMerchants = relationshipsResult
		.filter((user) => user.isMerchant)
		.map(
			({
				businessName, //
				slug,
				cutOffTime,
				leadTimeDays,
				minimumSpendPence,
			}) => ({
				businessName,
				slug,
				cutOffTime,
				leadTimeDays,
				minimumSpendPence,
			}),
		)

	const mappedCustomers = relationshipsResult
		.filter((relatedUser) => !relatedUser.isMerchant)
		.map((customer) => ({
			businessName: customer.businessName,
			obfuscatedEmail: obfuscateEmail(customer.email),
		}))

	return { confirmedMerchants: emptyToNull(mappedMerchants), confirmedCustomers: emptyToNull(mappedCustomers) }
}
