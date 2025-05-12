'use client'
import { userMessages } from '@/library/constants'
import type { NewNotification, NotificationInterface } from '@/types'
import { type ReactNode, createContext, useCallback, useContext, useState } from 'react'

interface NotificationsContextType {
	createNotification: ({ title, message }: NewNotification) => void
	successNotification: (message: string) => void
	errorNotification: (message: string) => void
	serverErrorNotification: () => void
	removeNotification: (id: number) => void
	notifications: NotificationInterface[] | null
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<NotificationInterface[] | null>(null)

	function createNotification({ title, message, level }: NewNotification): void {
		const id = Date.now()
		setNotifications((prev) => {
			if (!prev) return [{ id, title, message, level }]
			return [...prev, { id, title, message, level }]
		})
	}

	const removeNotification = useCallback((id: number) => {
		setNotifications((prev) => (prev ? prev.filter((notification) => notification.id !== id) : null))
	}, [])

	function successNotification(message: string) {
		createNotification({
			title: 'Success',
			level: 'success',
			message,
		})
	}

	function errorNotification(message: string) {
		createNotification({
			title: 'Error',
			level: 'error',
			message,
		})
	}

	function serverErrorNotification() {
		createNotification({
			title: 'Error',
			level: 'error',
			message: userMessages.serverError,
		})
	}

	return (
		<NotificationsContext.Provider
			value={{
				notifications,
				createNotification,
				successNotification,
				errorNotification,
				serverErrorNotification,
				removeNotification,
			}}
		>
			{children}
		</NotificationsContext.Provider>
	)
}

export function useNotifications() {
	const context = useContext(NotificationsContext)
	if (context === undefined) {
		throw new Error('useNotifications must be used within a NotificationsProvider')
	}
	return context
}

/*
const exampleNotifications: NotificationInterface[] = [
	{
		id: 0,
		title: 'Congratulations!',
		message: "You've won an all-expenses-paid trip to Iran for a facelift!",
		level: 'success',
	},
	{
		id: 1,
		title: 'Information',
		message: 'French people are French',
		level: 'info',
	},
	{
		id: 3,
		title: 'Warning!',
		message: 'You will die in seven days',
		level: 'warning',
	},
	{
		id: 2,
		title: 'Error!',
		message: 'Your bank account has been hacked! Send me £1,000 to fix it',
		level: 'error',
	},
]
*/
