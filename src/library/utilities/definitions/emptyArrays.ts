export function nonEmptyArray<T>(arr: T[] | null | undefined): boolean {
	return Array.isArray(arr) && arr.length > 0
}

// I may be able to delete this one in the future...
export function isEmptyArray<T>(arr: T[] | null | undefined): boolean {
	return Array.isArray(arr) && arr.length === 0
}
