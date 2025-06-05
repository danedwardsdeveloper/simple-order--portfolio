import { durationSettings, searchParamNames } from '@/library/constants'
import { confirmationTokens } from '@/library/database/schema'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { generateUuid } from '@/library/utilities/public'
import type { QueryRunner } from '@/types'

type Input = {
	userId: number
	queryRunner: QueryRunner
}

export async function createConfirmationURL({ userId, queryRunner }: Input): Promise<string> {
	try {
		const emailConfirmationToken = generateUuid()

		await queryRunner.insert(confirmationTokens).values({
			userId,
			token: emailConfirmationToken,
			expiresAt: new Date(Date.now() + durationSettings.confirmEmailExpiry),
		})

		return `${dynamicBaseURL}/confirm?${searchParamNames.emailConfirmationToken}=${emailConfirmationToken}`
	} catch (error) {
		logger.error('createConfirmationURL caught error', error)
		throw error
	}
}

// ;(async () => {
// 	try {
// 		const confirmationURL = await createConfirmationURL({ userId: 1823, queryRunner: database })
// 		logger.info('Confirmation url', confirmationURL)
// 	} catch {
// 		logger.error('error')
// 	}
// })()

/* 
pnpm tsx src/library/database/operations/definitions/createConfirmationURL.ts
*/
