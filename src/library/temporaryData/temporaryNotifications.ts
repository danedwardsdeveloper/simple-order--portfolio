import type { NotificationInterface } from '@/types'

export const exampleNotifications: NotificationInterface[] = [
	{
		id: 0,
		title: 'Success',
		message: `You've won a prize!`,
		level: 'success',
	},
	{
		id: 1,
		title: 'Information',
		message: 'French people are French',
		level: 'info',
	},
	{
		id: 2,
		title: 'Warning',
		message: 'Your bank account has been hacked! Send me £1,000 to fix it',
		level: 'warning',
	},
	{
		id: 3,
		title: 'Error',
		message: 'You will die in seven days',
		level: 'error',
	},
]
