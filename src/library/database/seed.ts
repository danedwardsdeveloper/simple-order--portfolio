import { sql } from 'drizzle-orm'
import logger from '../logger'
import { database } from './connection'
import { daysOfWeek } from './schema'

async function seed() {
	logger.info('🌱 Seeding database...')

	try {
		await database
			.insert(daysOfWeek)
			.values([
				{ id: 1, name: 'monday', sortOrder: 1 },
				{ id: 2, name: 'tuesday', sortOrder: 2 },
				{ id: 3, name: 'wednesday', sortOrder: 3 },
				{ id: 4, name: 'thursday', sortOrder: 4 },
				{ id: 5, name: 'friday', sortOrder: 5 },
				{ id: 6, name: 'saturday', sortOrder: 6 },
				{ id: 7, name: 'sunday', sortOrder: 7 },
			])
			.onConflictDoUpdate({
				target: daysOfWeek.id,
				set: {
					name: sql`excluded.name`,
					sortOrder: sql`excluded.sort_order`,
				},
			})
		logger.success('Seeding complete!')
	} catch (error) {
		logger.error('❌ Seeding failed:', error)
		throw error
	}
}

seed().catch((error) => {
	logger.error('Failed to seed:', error)
	process.exit(1)
})
