'use client'
import { useMerchantSettings } from '@/components/providers/settings'
import { useUser } from '@/components/providers/user'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import MinimumSpend from '@/components/settings/MinimumSpend'
import HolidaySettings from './HolidaySettings'

export default function MerchantSettings() {
	const { user } = useUser()
	const {
		saveMinimumSpendPence,
		isEditing,
		setIsEditing,
		acceptedWeekDayIndices,
		updateDeliveryDays,
		isSubmitting,
		// saveLeadTime,
		// saveCutOffTime,
	} = useMerchantSettings()

	if (!user) return null

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			<MinimumSpend
				minimumSpendPence={user.minimumSpendPence}
				saveMinimumSpendPence={saveMinimumSpendPence}
				isBeingEdited={isEditing.minimumSpend}
				setIsBeingEdited={(value) => setIsEditing((prev) => ({ ...prev, minimumSpend: value }))}
				isSubmitting={isSubmitting.minimumSpend}
			/>
			{/* <Setting
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
			/> */}

			<DeliveryDaysSetting
				acceptedWeekDayIndices={acceptedWeekDayIndices}
				updateDeliveryDays={updateDeliveryDays}
				isBeingEdited={isEditing.acceptedDeliveryDays}
				setIsBeingEdited={(value) => setIsEditing((prev) => ({ ...prev, acceptedDeliveryDays: value }))}
				isSubmitting={isSubmitting.acceptedDeliveryDays}
			/>

			<HolidaySettings />
		</div>
	)
}
