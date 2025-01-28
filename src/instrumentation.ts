import { testDatabaseConnection } from './library/database/configuration'

export async function register() {
  testDatabaseConnection()
}
