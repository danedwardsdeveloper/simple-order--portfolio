import { durationSettings } from '@/library/constants'
import { searchParamNames } from '@/library/constants/definitions/searchParams'
import { confirmationTokens } from '@/library/database/schema'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { generateUuid } from '@/library/utilities/public'
import type { QueryRunner } from '@/types'

type Input = {
	userId: number
	queryRunner: QueryRunner
}

export async function createConfirmationToken({ userId, queryRunner }: Input): Promise<string> {
	try {
		const emailConfirmationToken = generateUuid()

		await queryRunner.insert(confirmationTokens).values({
			userId,
			token: emailConfirmationToken,
			expiresAt: new Date(Date.now() + durationSettings.confirmEmailExpiry),
		})

		return `${dynamicBaseURL}/confirm?${searchParamNames.emailConfirmationToken}=${emailConfirmationToken}`
	} catch (error) {
		logger.error('createConfirmationToken caught error', error)
		throw error
	}
}
