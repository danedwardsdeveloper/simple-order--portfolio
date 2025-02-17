import type { BaseBrowserSafeUser, DangerousBaseUser } from '@/types'

export function sanitiseDangerousBaseUser(user: DangerousBaseUser): BaseBrowserSafeUser {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { id, hashedPassword, ...safeUser } = user
	return safeUser
}
