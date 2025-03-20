import type { BaseBrowserSafeUser, DangerousBaseUser } from '@/types'

export function sanitiseDangerousBaseUser(user: DangerousBaseUser): BaseBrowserSafeUser {
	const { id, hashedPassword, ...safeUser } = user
	return safeUser
}
