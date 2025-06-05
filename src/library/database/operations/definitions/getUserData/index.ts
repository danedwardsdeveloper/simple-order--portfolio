import { mapOrdersNew } from '@/library/utilities/public'
import {
	createCompositeUser,
	determineRoles,
	filterInventory,
	getProductIds,
	mapConfirmedRelationships,
	mapInvitations,
	mapUserIds,
} from '@/library/utilities/server'
import type { DangerousBaseUser, UserData } from '@/types'
import { getFreeTrial } from '../getFreeTrial'
import { getInvitationRecords } from '../getInvitationRecords'
import { getOrderItems } from '../getOrderItems'
import { getOrderRows } from '../getOrderRows'
import { getProducts } from '../getProducts'
import { getRelationshipRecords } from '../getRelationshipRecords'
import { getSubscription } from '../getSubscription'
import { getUsers } from '../getUsers'

export async function getUserData(dangerousUser: DangerousBaseUser): Promise<UserData> {
	// Deliberately no try/catch here. Let routes handle errors
	const userId = dangerousUser.id
	const [subscription, freeTrial, relationshipRecords, invitationRecords] = await Promise.all([
		getSubscription(userId),
		getFreeTrial(userId),
		getRelationshipRecords(userId),
		getInvitationRecords(dangerousUser),
	])

	const roles = determineRoles({
		dangerousUser,
		subscription,
		freeTrial,
		relationshipRecords,
		invitationRecords,
	})

	const profileIds = mapUserIds({ dangerousUser, relationshipRecords, invitationRecords })

	const [profiles, orderRows] = await Promise.all([
		getUsers(profileIds), //
		getOrderRows({ userId, roles, daysBack: 14 }),
	])

	const orderItems = await getOrderItems(orderRows)
	const productIds = getProductIds(orderItems)
	const products = await getProducts({
		userId,
		productIds,
		roles,
	})

	const inventory = filterInventory({ products, userId })

	const { ordersMade, ordersReceived } = mapOrdersNew({
		profiles, //
		products,
		dangerousUser,
		orderRows,
		orderItems,
	})

	const { invitationsReceived, invitationsSent } = mapInvitations({
		dangerousUser,
		invitationRecords,
		profiles,
	})

	const { confirmedCustomers, confirmedMerchants } = mapConfirmedRelationships({
		dangerousUser,
		relationshipRecords,
		profiles,
	})

	const user = createCompositeUser({
		dangerousUser,
		roles,
		freeTrial,
		subscription,
	})

	return {
		user,

		inventory,

		invitationsReceived,
		invitationsSent,

		confirmedCustomers,
		confirmedMerchants,

		ordersMade,
		ordersReceived,
	}
}
