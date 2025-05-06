import type { BaseBrowserSafeUser, BrowserSafeMerchantProfile, DangerousBaseUser } from '@/types'

export function sanitiseDangerousBaseUser(user: DangerousBaseUser): BaseBrowserSafeUser {
	const { id, hashedPassword, ...safeUser } = user
	return safeUser
}

export function sanitiseMerchant(merchant: DangerousBaseUser): BrowserSafeMerchantProfile {
	const { id, hashedPassword, email, firstName, lastName, emailConfirmed, ...safeUser } = merchant
	return safeUser
}
