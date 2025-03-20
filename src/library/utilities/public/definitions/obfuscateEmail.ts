export function obfuscateEmail(email: string) {
	if (!email || typeof email !== 'string') {
		throw new Error('Invalid email provided')
	}

	const [localPart, domain] = email.split('@')

	if (!domain) {
		throw new Error('Invalid email format')
	}

	function obfuscatePart(part: string) {
		if (part.length <= 3) {
			return `${part.charAt(0)}${'*'.repeat(Math.max(2, part.length - 1))}`
		}
		if (part.length <= 6) {
			const charsToShow = Math.max(1, Math.floor(part.length * 0.4))
			return `${part.slice(0, charsToShow)}${'*'.repeat(Math.max(3, part.length - charsToShow))}`
		}
		const asterisksCount = Math.min(6, Math.max(3, Math.ceil(part.length / 3)))
		return `${part.slice(0, part.length - asterisksCount)}${'*'.repeat(asterisksCount)}`
	}

	const obfuscatedLocal = obfuscatePart(localPart)

	const domainParts = domain.split('.')

	const obfuscatedDomain = domainParts
		.map((part, index) => {
			if (index === domainParts.length - 1) {
				return part
			}
			return obfuscatePart(part)
		})
		.join('.')

	return `${obfuscatedLocal}@${obfuscatedDomain}`
}
