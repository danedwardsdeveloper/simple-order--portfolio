export const orderStatus = {
	pending: 'pending',
	completed: 'completed',
	cancelled: 'cancelled',
} as const

// This if for the database schema. pgTable expects an array
export const orderStatusArray = [orderStatus.pending, orderStatus.completed, orderStatus.cancelled] as const
