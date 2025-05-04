export const orderStatusNames = {
	Pending: 'Pending',
	Completed: 'Completed',
	Cancelled: 'Cancelled',
} as const

export const orderStatusIdToName = {
	1: 'Pending',
	2: 'Completed',
	3: 'Cancelled',
} as const

export const orderStatusNameToId = {
	Pending: 1,
	Completed: 2,
	Cancelled: 3,
} as const

// Should be number as per the normalised database schema
export function orderIsCompleted(statusId: number) {
	return statusId === orderStatusNameToId.Completed
}
