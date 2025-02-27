'use client'
import type { NotificationInterface, NotificationLevels } from '@/types'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { ComponentType, SVGProps } from 'react'

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
			title: 'text-red-900',
			message: 'text-red-600',
			background: 'ring-red-500 bg-white',
			icon: 'text-red-600',
		},
		warning: {
			title: 'text-yellow-900',
			message: 'text-yellow-600',
			background: 'ring-yellow-500 bg-white',
			icon: 'text-yellow-600',
		},
		info: {
			title: 'text-blue-900',
			message: 'text-blue-600',
			background: 'ring-blue-500 bg-white',
			icon: 'text-blue-600',
		},
		success: {
			title: 'text-green-900',
			message: 'text-green-600',
			background: 'ring-green-500 bg-white',
			icon: 'text-green-600',
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
						<div className="ml-3 w-0 flex-1">
							<p className={clsx('text-sm font-semibold', colourStyles[notification.level].title)}>{notification.title}</p>
							<p className={clsx('mt-1 text-sm leading-6', colourStyles[notification.level].message)}>{notification.message}</p>
						</div>
						<div className="ml-4 flex shrink-0">
							<button
								type="button"
								onClick={() => onClose(notification.id)}
								className="inline-flex rounded-md text-slate-300 hover:text-slate-400 active:text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
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
