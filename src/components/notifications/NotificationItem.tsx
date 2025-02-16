'use client'

import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { ComponentType, SVGProps } from 'react'

import type { NotificationInterface, NotificationLevels } from '@/providers/notifications'

interface Props {
	notification: NotificationInterface
	onClose: (id: number) => void
}

export default function NotificationItem({ notification, onClose }: Props) {
	const iconMap: Record<NotificationLevels, ComponentType<SVGProps<SVGSVGElement>>> = {
		success: CheckCircleIcon,
		error: ExclamationTriangleIcon,
		info: InformationCircleIcon,
		warning: ExclamationCircleIcon,
	}
	const Icon = iconMap[notification.level]

	const colourStyles: Record<
		NotificationLevels,
		{
			title: string
			message: string
			background: string
			icon: string
		}
	> = {
		error: {
			title: 'text-red-50',
			message: 'text-red-200',
			background: 'ring-red-900 bg-red-800',
			icon: 'text-red-200',
		},
		warning: {
			title: 'text-orange-50',
			message: 'text-orange-200',
			background: 'ring-orange-900 bg-orange-800',
			icon: 'text-orange-200',
		},
		info: {
			title: 'text-indigo-50',
			message: 'text-indigo-200',
			background: 'ring-indigo-900 bg-indigo-800',
			icon: 'text-indigo-200',
		},
		success: {
			title: 'text-green-50',
			message: 'text-green-200',
			background: 'ring-green-900 bg-green-800',
			icon: 'text-green-200',
		},
	}

	return (
		<Transition show={true} appear={true}>
			<div
				className={clsx(
					'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-2 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0',
					colourStyles[notification.level].background,
				)}
			>
				<div className="p-4">
					<div className="flex items-start">
						<div className="shrink-0">
							<Icon aria-hidden="true" className={clsx('size-6', colourStyles[notification.level].icon)} />
						</div>
						<div className="ml-3 w-0 flex-1 pt-0.5">
							<p className={clsx('text-sm font-medium text-red-50', colourStyles[notification.level].title)}>{notification.title}</p>
							<p className={clsx('mt-1 text-sm', colourStyles[notification.level].message)}>{notification.message}</p>
						</div>
						<div className="ml-4 flex shrink-0">
							<button
								type="button"
								onClick={() => onClose(notification.id)}
								className="inline-flex rounded-md text-slate-300 hover:text-slate-400 active:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								<span className="sr-only">Close</span>
								<XMarkIcon aria-hidden="true" className="size-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	)
}
