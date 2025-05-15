'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useMerchantSettings } from '@/components/providers/settings'
import { useUser } from '@/components/providers/user'
import CutOffTime from '@/components/settings/CutOffTime'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import MinimumSpend from '@/components/settings/MinimumSpend'

export default function MerchantSettings() {
	const { user } = useUser()
	const {
		saveMinimumSpendPence,
		isEditing,
		setIsEditing,
		acceptedWeekDayIndices,
		updateDeliveryDays,
		isSubmitting,
		saveCutOffTime,
		// saveLeadTime,
	} = useMerchantSettings()

	if (!user) return <UnauthorisedLinks />

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			<MinimumSpend
				minimumSpendPence={user.minimumSpendPence}
				saveMinimumSpendPence={saveMinimumSpendPence}
				isBeingEdited={isEditing.minimumSpend}
				setIsBeingEdited={(value) => setIsEditing((prev) => ({ ...prev, minimumSpend: value }))}
				isSubmitting={isSubmitting.minimumSpend}
			/>

			<CutOffTime
				cutOffTime={user.cutOffTime}
				saveCutOffTime={saveCutOffTime}
				isBeingEdited={isEditing.cutOff}
				setIsBeingEdited={(value) => setIsEditing((prev) => ({ ...prev, cutOff: value }))}
				isSubmitting={isSubmitting.cutOff}
			/>

			{/* 
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

			{/* <HolidaySettings /> */}
		</div>
	)
}
