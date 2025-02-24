import { database } from '@/library/database/connection'
import { merchantProfiles } from '@/library/database/schema'
import { eq } from 'drizzle-orm'

async function _deleteFromDatabase() {
	const _success = await database.delete(merchantProfiles).where(eq(merchantProfiles.userId, 11)).returning()
}

// const session = {
// 	metadata: {
// 		email: 'myemail@gmail.com',
// 		simpleOrderUserId: '148',
// 	},
// }

// const values: SubscriptionInsertValues = {
// 	userId: Number(session.metadata.simpleOrderUserId),
// 	stripeCustomerId: String(session.customer),
// 	subscriptionActive: true,
// 	currentPeriodStart: new Date(session.current_period_start * 1000),
// 	currentPeriodEnd: new Date(session.current_period_end * 1000),
// }

// await database.insert(subscriptions).values(values)

/* 
pnpm tsx tests/utilities/manualDatabaseCommands
*/
