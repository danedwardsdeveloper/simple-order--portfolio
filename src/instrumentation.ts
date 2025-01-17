import { testDatabaseConnection } from './library/database/configuration'
import logger from './library/logger'

import { isDevelopment } from './library/environment/publicVariables'

export async function register() {
  if (isDevelopment) {
    logger.info('Waiting for Fly proxy to connect before testing database connection...')
    await new Promise<void>(resolve =>
      setTimeout(async () => {
        await testDatabaseConnection()
        resolve()
      }, 5000),
    )
  }
}
