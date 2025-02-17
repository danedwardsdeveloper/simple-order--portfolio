export type NotificationLevels = 'success' | 'info' | 'warning' | 'error'

export interface NotificationInterface {
	id: number
	title: string
	message: string
	level: NotificationLevels
}

export type NewNotification = Pick<NotificationInterface, 'message' | 'title' | 'level'>
