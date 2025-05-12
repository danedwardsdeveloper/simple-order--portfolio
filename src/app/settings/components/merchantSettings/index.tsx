'use client'
import { useUser } from '@/components/providers/user'
import { epochDateToTimeInput, formatPrice, formatTime, timeInputToEpochDate } from '@/library/utilities/public'
import DeliveryDaysSettings from './DeliveryDaySettings'
import HolidaySettings from './HolidaySettings'
import { MerchantSettingsProvider, useMerchantSettings } from './MerchantSettingsProvider'
import Setting from './Setting'

export default function MerchantSettings() {
	return (
		<MerchantSettingsProvider>
			<Content />
		</MerchantSettingsProvider>
	)
}

export function Content() {
	const { user } = useUser()
	const { saveCutOffTime, saveMinimumSpend, saveLeadTime, newSettings, setNewSettings } = useMerchantSettings()

	if (!user) return null

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			{/* ToDo: Input is in pence */}
			<Setting
				title="Minimum spend"
				editKey="minimumSpend"
				onSave={saveMinimumSpend}
				hasChanges={newSettings.minimumSpend !== user.minimumSpendPence}
				content={<span>{formatPrice(user.minimumSpendPence)}</span>}
				editContent={
					<input
						type="number"
						min="0"
						step="1"
						className="w-24 px-2 py-1 border rounded"
						value={newSettings.minimumSpend !== null ? newSettings.minimumSpend : user.minimumSpendPence || 0}
						onChange={(event) => {
							const value = Number.parseInt(event.target.value, 10)
							setNewSettings((prev) => ({ ...prev, minimumSpend: value }))
						}}
					/>
				}
			/>

			<Setting
				title="Order cut off time"
				editKey="cutOff"
				onSave={saveCutOffTime}
				hasChanges={newSettings.cutOff !== user.cutOffTime}
				content={<span>{formatTime(user.cutOffTime)}</span>}
				editContent={
					<input
						type="time"
						id="cutOffTime"
						value={epochDateToTimeInput(newSettings.cutOff || user.cutOffTime)}
						onChange={(event) => {
							const timeInputValue = event.target.value
							const updatedDate = timeInputToEpochDate(timeInputValue)
							setNewSettings((prev) => ({ ...prev, cutOff: updatedDate }))
						}}
					/>
				}
			/>

			<Setting
				title="Lead time"
				editKey="leadTime"
				onSave={saveLeadTime}
				hasChanges={newSettings.leadTime !== user.leadTimeDays}
				content={<span>{`${user.leadTimeDays || 0} day${user.leadTimeDays !== 1 ? 's' : ''}`}</span>}
				editContent={
					<input
						type="number"
						min="0"
						className="w-16 px-2 py-1 border rounded"
						value={newSettings.leadTime !== null ? newSettings.leadTime : user.leadTimeDays || 0}
						onChange={(event) => {
							const value = Number.parseInt(event.target.value, 10)
							setNewSettings((prev) => ({ ...prev, leadTime: value }))
						}}
					/>
				}
			/>

			<DeliveryDaysSettings />

			<HolidaySettings />
		</div>
	)
}
