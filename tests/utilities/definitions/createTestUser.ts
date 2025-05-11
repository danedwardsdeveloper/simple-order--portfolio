import { createUser } from '@/library/database/operations'
import logger from '@/library/logger'
import type { BaseUserBrowserInputValues } from '@/types'
import { createCookieString } from './createCookieString'

export async function createTestUser(userInputValues: BaseUserBrowserInputValues) {
	try {
		const { createdUser } = await createUser(userInputValues)
		const validCookie = createCookieString({ userId: createdUser.id })
		return { createdUser, validCookie }
	} catch (error) {
		logger.error('createTestUser error: ', error)
		throw error
	}
}
