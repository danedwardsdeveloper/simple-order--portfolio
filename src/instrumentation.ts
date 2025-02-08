import { testDatabaseConnection } from './library/database/connection'

export async function register() {
  testDatabaseConnection()
}
