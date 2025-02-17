import { eq } from 'drizzle-orm'

import { database } from '@/library/database/connection'
import { merchantProfiles } from '@/library/database/schema'

async function _deleteFromDatabase() {
	const _success = await database.delete(merchantProfiles).where(eq(merchantProfiles.userId, 11)).returning()
}

/* 
pnpm tsx tests/utilities/manualDatabaseCommands
*/
