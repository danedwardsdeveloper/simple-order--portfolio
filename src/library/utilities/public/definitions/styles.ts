import { mergeClasses } from '..'

export function inputClasses(baseClasses = '', zodErrorMessage?: string) {
	return mergeClasses(baseClasses, Boolean(zodErrorMessage) && 'bg-red-100 border-l-4 border-l-red-600')
}
