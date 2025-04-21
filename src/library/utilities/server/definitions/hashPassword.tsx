import bcrypt from 'bcryptjs'

export async function hashPassword(plainPassword: string) {
	return await bcrypt.hash(plainPassword, 10)
}
