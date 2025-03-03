export function containsItems<T>(arr: T[] | null | undefined): boolean {
	return Array.isArray(arr) && arr.length > 0
}

export function convertEmptyToUndefined<T>(data: T[] | null | undefined): T[] | undefined {
	if (!Array.isArray(data) || data.length === 0) {
		return undefined
	}
	return data
}
