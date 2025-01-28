import { SafeUser, User } from '@/types/definitions/users'

export function createSafeUser(user: User): SafeUser {
  const { hashedPassword, ...safeUser } = user
  return safeUser
}
