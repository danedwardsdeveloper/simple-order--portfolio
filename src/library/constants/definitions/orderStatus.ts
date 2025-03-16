export const orderStatus = {
	pending: 'pending',
	completed: 'completed',
	cancelled: 'cancelled',
} as const

// This if for the database schema. pgTable expects an array
// Also for OrderStatusDropdown so I can map them in traffic light order
export const orderStatusArray = [orderStatus.cancelled, orderStatus.pending, orderStatus.completed] as const
