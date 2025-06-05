import type { NonEmptyArray } from '@/types'

export function containsItems<T>(arr: T[] | null | undefined): boolean {
	return Array.isArray(arr) && arr.length > 0
}

export function isEmptyArray<T>(arr: T[] | null | undefined): boolean {
	return Array.isArray(arr) && arr.length === 0
}

export function emptyToUndefined<T>(data: T[] | null | undefined): T[] | undefined {
	if (!Array.isArray(data) || data.length === 0) {
		return undefined
	}
	return data
}

export function emptyToNull<T>(data: T[]): NonEmptyArray<T> | null {
	return data.length === 0 ? null : (data as NonEmptyArray<T>)
}
