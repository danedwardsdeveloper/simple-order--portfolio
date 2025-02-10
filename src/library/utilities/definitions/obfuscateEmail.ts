export function obfuscateEmail(email: string) {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email provided')
  }

  const [localPart, domain] = email.split('@')

  if (!domain) {
    throw new Error('Invalid email format')
  }

  const obfuscatedLocal =
    localPart.length < 6 ? `${localPart.slice(0, 1)}${'*'.repeat(localPart.length - 1)}` : `${localPart.slice(0, -5)}${'*'.repeat(5)}`

  const domainParts = domain.split('.')

  const obfuscatedDomain = domainParts
    .map((part, index) => {
      if (index === domainParts.length - 1) {
        return part
      }
      return `${part.charAt(0)}${'*'.repeat(Math.max(part.length - 1, 2))}`
    })
    .join('.')

  return `${obfuscatedLocal}@${obfuscatedDomain}`
}
