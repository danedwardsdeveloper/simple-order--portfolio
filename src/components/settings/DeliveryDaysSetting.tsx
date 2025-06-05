'use client'
import { daysOfTheWeek } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import type { SettingsContextType, WeekDayIndex } from '@/types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import SettingForm from './SettingForm'

type Props = {
	acceptedWeekDayIndices: WeekDayIndex[] | null
	saveDeliveryDays: SettingsContextType['saveDeliveryDays']
}

export default function DeliveryDaysSetting({ acceptedWeekDayIndices, saveDeliveryDays }: Props) {
	const handleSave = async (indices: WeekDayIndex[]) => {
		return await saveDeliveryDays(indices)
	}

	const isEqual = (a: WeekDayIndex[] | null, b: WeekDayIndex[] | null) => {
		if (a === null && b === null) return true
		if (a === null || b === null) return false
		return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
	}

	const dayIsSelected = (days: WeekDayIndex[] | null, sortOrder: number) => {
		return days?.includes(sortOrder as WeekDayIndex) || false
	}

	return (
		<SettingForm
			title="Accepted delivery days"
			helpText={
				<>
					<p key={1}>
						Which days of the week you deliver or allow pickup. Customers can only select delivery dates that fall on your available days.
					</p>
					<p key={2}>
						{`For example, If you don't fulfill orders on Sundays, uncheck Sunday so customers can't book deliveries that day. They will still
						be able to place orders on Sunday though.`}
					</p>
				</>
			}
			initialValue={acceptedWeekDayIndices || []}
			onSave={handleSave}
			isEqual={isEqual}
			renderView={(value) => (
				<ul className="w-full">
					{daysOfTheWeek.map(({ name, sortOrder }) => {
						const isAccepted = dayIsSelected(value, sortOrder)

						return (
							<li
								key={sortOrder}
								className={mergeClasses('h-10 mb-1 flex items-start gap-x-2', !isAccepted ? 'line-through decoration-red-600' : '')}
							>
								{isAccepted ? <CheckCircleIcon className="size-6 text-green-600" /> : <XCircleIcon className="size-6 text-red-600" />}
								{name}
							</li>
						)
					})}
				</ul>
			)}
			renderEdit={(value, onChange) => (
				<div className="w-full">
					{daysOfTheWeek.map(({ name, sortOrder }) => {
						const isSelected = dayIsSelected(value, sortOrder)

						return (
							<div key={sortOrder} className="h-10 mb-1 flex items-start gap-x-2">
								<div className="group grid size-6 grid-cols-1">
									<input
										type="checkbox"
										id={`day-${sortOrder}`}
										checked={isSelected}
										onChange={(event) => {
											if (event.target.checked) {
												if (!value.includes(sortOrder as WeekDayIndex)) {
													onChange([...value, sortOrder as WeekDayIndex])
												}
											} else {
												onChange(value.filter((index) => index !== sortOrder))
											}
										}}
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
			)}
		/>
	)
}
