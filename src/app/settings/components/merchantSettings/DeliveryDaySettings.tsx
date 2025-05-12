'use client'
import { daysOfTheWeek } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import type { WeekDayIndex } from '@/types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useMerchantSettings } from './MerchantSettingsProvider'
import Setting from './Setting'

export default function DeliveryDaysSettings() {
	const { acceptedDeliveryDays, newSettings, setNewSettings, updateDeliveryDays } = useMerchantSettings()

	function toggleDeliveryDay(dayIndex: WeekDayIndex, isSelected: boolean) {
		setNewSettings((prev) => {
			const currentDays = prev.acceptedDeliveryDays || []

			if (isSelected) {
				if (!currentDays.includes(dayIndex)) {
					return {
						...prev,
						acceptedDeliveryDays: [...currentDays, dayIndex],
					}
				}
			} else {
				return {
					...prev,
					acceptedDeliveryDays: currentDays.filter((index) => index !== dayIndex),
				}
			}

			return prev
		})
	}

	return (
		<Setting
			title="Accepted delivery days"
			editKey="acceptedDeliveryDays"
			onSave={() => updateDeliveryDays(newSettings.acceptedDeliveryDays || [])}
			hasChanges={JSON.stringify(newSettings.acceptedDeliveryDays) !== JSON.stringify(acceptedDeliveryDays)}
			content={
				<ul className="w-full">
					{daysOfTheWeek.map(({ name, sortOrder }) => {
						const isAccepted = acceptedDeliveryDays?.includes(sortOrder as WeekDayIndex)

						return (
							<li
								key={sortOrder}
								className={mergeClasses('min-h-10 mb-1 flex items-center gap-x-2', !isAccepted ? 'line-through decoration-red-600' : '')}
							>
								{isAccepted ? <CheckCircleIcon className="size-6 text-green-600" /> : <XCircleIcon className="size-6 text-red-600" />}
								{name}
							</li>
						)
					})}
				</ul>
			}
			editContent={
				<div className="w-full">
					{daysOfTheWeek.map(({ name, sortOrder }) => {
						const isSelected = newSettings.acceptedDeliveryDays?.includes(sortOrder as WeekDayIndex)

						return (
							<div key={sortOrder} className="min-h-10 mb-1 flex items-center gap-x-2">
								<div className="group grid size-6 grid-cols-1">
									<input
										type="checkbox"
										id={`day-${sortOrder}`}
										checked={isSelected}
										onChange={(event) => {
											toggleDeliveryDay(sortOrder as WeekDayIndex, event.target.checked)
										}}
										className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-green-600 checked:bg-green-600 indeterminate:border-green-600 indeterminate:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
									/>
									<svg
										fill="none"
										viewBox="0 0 14 14"
										className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
									>
										<title>Check box</title>
										<path
											d="M3 8L6 11L11 3.5"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
											className="opacity-0 group-has-[:checked]:opacity-100"
										/>
										<path
											d="M3 7H11"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
											className="opacity-0 group-has-[:indeterminate]:opacity-100"
										/>
									</svg>
								</div>
								<label htmlFor={`day-${sortOrder}`}>{name}</label>
							</div>
						)
					})}
				</div>
			}
		/>
	)
}
