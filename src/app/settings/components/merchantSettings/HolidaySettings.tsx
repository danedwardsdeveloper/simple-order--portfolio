'use client'
import { useMerchantSettings } from '@/components/providers/settings'
import Setting from '@/components/settings/Setting'
import type { Holiday } from '@/types'
import { differenceInCalendarDays, format, isSameDay } from 'date-fns'
import { XCircleIcon } from 'lucide-react'
import { useState } from 'react'

// Main ToDo

export default function HolidaySettings() {
	const { holidays, addHoliday, isSubmitting } = useMerchantSettings()
	const [isEditing, setIsEditing] = useState(false)
	const [newSetting, setNewSetting] = useState()

	const holidayStart = newSettings.holidays?.[0]?.startDate
		? new Date(newSettings.holidays[0].startDate).toISOString().split('T')[0]
		: new Date().toISOString().split('T')[0]

	const holidayEnd = newSettings.holidays?.[0]?.endDate
		? new Date(newSettings.holidays[0].endDate).toISOString().split('T')[0]
		: new Date().toISOString().split('T')[0]

	const updateHolidayDate = (field: 'startDate' | 'endDate', value: string) => {
		setNewSettings((prev) => ({
			...prev,
			holidays: [
				{
					startDate: field === 'startDate' ? new Date(value) : prev.holidays?.[0]?.startDate || new Date(),
					endDate: field === 'endDate' ? new Date(value) : prev.holidays?.[0]?.endDate || new Date(),
				},
			],
		}))
	}

	function HolidayItem({ holiday }: { holiday: Holiday }) {
		const { startDate, endDate } = holiday

		if (isSameDay(startDate, endDate)) {
			return <>{format(startDate, 'EEEE, d MMMM yyyy')}</>
		}

		const dayDifference = differenceInCalendarDays(endDate, startDate) + 1 // Make inclusive

		return (
			<div>
				<span>{format(startDate, 'EEEE, d MMMM')} to</span>
				<br />
				{format(endDate, 'EEEE, d MMMM yyyy')}
				<span className="text-zinc-600">{`, inclusive (${dayDifference} days)`}</span>
			</div>
		)
	}

	function HolidaysList({ holidays, showDeleteButton = false }: { holidays: Holiday[] | null; showDeleteButton?: boolean }) {
		if (!holidays || holidays.length === 0) {
			return <p>No holidays</p>
		}

		return (
			<ul className="flex flex-col gap-y-4">
				{holidays?.map((holiday) => (
					<li key={String(holiday.startDate)}>
						<HolidayItem holiday={holiday} />
						{showDeleteButton && (
							<button
								type="button"
								className="text-red-500"
								onClick={() => {
									// ToDo
								}}
							>
								<XCircleIcon className="size-6 text-red-600" />
							</button>
						)}
					</li>
				))}
			</ul>
		)
	}

	return (
		<Setting
			title="Holidays"
			isBeingEdited={isEditing}
			setIsBeingEdited={setIsEditing}
			hasChanges={false} // ToDo
			onSave={() => {}} // ToDo!
			isSubmitting={isSubmitting.holidays}
			content={<HolidaysList holidays={holidays} />}
			editContent={
				<>
					<div className="flex flex-col gap-2 mb-6 bg-blue-50 p-2 border-2 border-blue-100 rounded-xl">
						<p className="font-medium">Add new holiday</p>
						<div className="flex gap-x-2 mb-3">
							<div className="w-1/2">
								<label htmlFor="holiday-start" className="block">
									Start
								</label>
								<input
									type="date"
									id="holiday-start"
									className="border p-1 rounded w-full"
									value={holidayStart}
									onChange={(event) => updateHolidayDate('startDate', event.target.value)}
								/>
							</div>
							<div className="w-1/2">
								<label htmlFor="holiday-end" className="block">
									End
								</label>
								<input
									type="date"
									id="holiday-end"
									className="border p-1 rounded w-full"
									value={holidayEnd}
									onChange={(event) => updateHolidayDate('endDate', event.target.value)}
								/>
							</div>
						</div>
						<button
							type="button"
							className="px-2 py-1 bg-blue-400 hover:bg-blue-300 transition-colors duration-300 rounded-md"
							onClick={() => {
								const startDate = new Date(holidayStart)
								const endDate = new Date(holidayEnd)
								addHoliday(startDate, endDate)
							}}
						>
							Add holiday
						</button>
					</div>

					<HolidaysList
						holidays={holidays}
						showDeleteButton={false} // ToDo!
					/>
				</>
			}
		/>
	)
}
