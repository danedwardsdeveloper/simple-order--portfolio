import { testDatabaseConnection } from './library/database/connection'
import { isDevelopment } from './library/environment/publicVariables'

export async function register() {
	if (isDevelopment) {
		testDatabaseConnection()
	}
}
