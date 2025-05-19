import { format, toZonedTime } from 'date-fns-tz'

export default function DeliveryDates({
	availableDeliveryDays,
	selectedDate,
	onDateChange,
}: {
	availableDeliveryDays: Date[] | null
	selectedDate: Date | null
	onDateChange: (date: Date) => void
}) {
	if (!availableDeliveryDays || !selectedDate) return null

	return (
		<fieldset aria-label="Delivery date options" className="relative -space-y-px rounded-md bg-white">
			{availableDeliveryDays.slice(0, 5).map((date) => {
				const stringDate = String(date)
				const selectedDateString = selectedDate.toString()
				const isSelected = stringDate === selectedDateString

				return (
					<label
						key={stringDate}
						className="group flex cursor-pointer flex-col border border-zinc-200 p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md focus:outline-none has-[:checked]:relative has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50"
					>
						<span className="flex items-center gap-3">
							<input
								defaultValue={stringDate}
								checked={isSelected}
								onChange={() => onDateChange(date)}
								name="pricing-plan"
								type="radio"
								className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden shrink-0"
							/>
							<span className="font-medium text-gray-900 group-has-[:checked]:text-blue-900 w-full">
								{(() => {
									const timeZone = 'Europe/London'
									const zonedDate = toZonedTime(date, timeZone)

									return <>{format(zonedDate, 'EEEE, d MMMM', { timeZone })}</>
								})()}
							</span>
						</span>
					</label>
				)
			})}
		</fieldset>
	)
}
