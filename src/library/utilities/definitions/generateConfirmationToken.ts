export function generateConfirmationToken(): string {
  return crypto.randomUUID()
}
