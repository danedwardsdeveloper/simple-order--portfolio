import type { ZodError } from 'zod'

// This needs work - doesn't handle general errors like missing body
export function formatFirstError(error: ZodError): string {
	const firstError = error.errors[0]
	const fieldPath = firstError.path.join('.')
	const errorMessage = fieldPath ? `${fieldPath}: ${firstError.message}` : firstError.message
	return errorMessage
}
