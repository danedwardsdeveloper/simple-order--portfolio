import 'dotenv/config' // Only needed for running scripts with pnpm tsx

export function requireVariable(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`${name} missing`)
	}
	return value
}
