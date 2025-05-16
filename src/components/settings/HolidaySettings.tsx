'use client'
import type { Holiday, SettingsContextType } from '@/types'
import { differenceInCalendarDays, format, isSameDay } from 'date-fns'
import { XCircleIcon } from 'lucide-react'
import { useState } from 'react'
import SettingForm from './Setting'

type Props = {
	holidays: Holiday[] | null
	addHoliday: SettingsContextType['addHoliday']
}

export default function HolidaySettings({ holidays, addHoliday }: Props) {
	const [newHoliday, setNewHoliday] = useState<{
		startDate: Date
		endDate: Date
	}>({
		startDate: new Date(),
		endDate: new Date(),
	})

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
					<li key={String(holiday.startDate)} className="flex justify-between items-center">
						<HolidayItem holiday={holiday} />
						{showDeleteButton && (
							<button
								type="button"
								className="text-red-500"
								onClick={() => {
									// To be implemented
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

	const holidayStart = newHoliday.startDate.toISOString().split('T')[0]
	const holidayEnd = newHoliday.endDate.toISOString().split('T')[0]

	const updateHolidayDate = (field: 'startDate' | 'endDate', value: string) => {
		setNewHoliday((prev) => ({
			...prev,
			[field]: new Date(value),
		}))
	}

	const handleAddHoliday = async () => {
		await addHoliday(newHoliday.startDate, newHoliday.endDate)
		// Reset form after adding
		setNewHoliday({
			startDate: new Date(),
			endDate: new Date(),
		})
		return true
	}

	return (
		<SettingForm
			title="Holidays"
			initialValue={holidays || []}
			onSave={handleAddHoliday}
			renderView={(value) => <HolidaysList holidays={value} />}
			renderEdit={(value) => (
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
							onClick={handleAddHoliday}
						>
							Add holiday
						</button>
					</div>

					<HolidaysList holidays={value} showDeleteButton={false} />
				</>
			)}
		/>
	)
}
