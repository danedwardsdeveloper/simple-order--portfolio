import { eq } from 'drizzle-orm'

import { database } from '@/library/database/connection'
import { merchantProfiles } from '@/library/database/schema'
import logger from '@/library/logger'

async function deleteFromDatabase() {
  const success = await database.delete(merchantProfiles).where(eq(merchantProfiles.userId, 11))
  logger.errorUnknown(success, 'Success?: ')
}

deleteFromDatabase()

/* 
pnpm tsx tests/utilities/manualDatabaseCommands
*/
