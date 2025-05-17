'use client'
import { useDemoSettings } from '@/components/providers/demo/settings'
import CutOffTime from '@/components/settings/CutOffTime'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import HolidaySettings from '@/components/settings/HolidaySettings'
import LeadTime from '@/components/settings/LeadTime'
import MinimumSpend from '@/components/settings/MinimumSpend'
import type { BrowserSafeCompositeUser } from '@/types'

export default function DemoMerchantSettings({ demoUser }: { demoUser: BrowserSafeCompositeUser }) {
	const { saveDeliveryDays, acceptedWeekDayIndices, saveMinimumSpendPence, saveCutOffTime, saveLeadTime, holidays, addHoliday } =
		useDemoSettings()

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			<MinimumSpend minimumSpendPence={demoUser.minimumSpendPence} saveMinimumSpendPence={saveMinimumSpendPence} />

			<LeadTime leadTimeDays={demoUser.leadTimeDays} saveLeadTime={saveLeadTime} />

			<CutOffTime cutOffTime={demoUser.cutOffTime} saveCutOffTime={saveCutOffTime} />

			<DeliveryDaysSetting acceptedWeekDayIndices={acceptedWeekDayIndices} saveDeliveryDays={saveDeliveryDays} />

			<HolidaySettings holidays={holidays} addHoliday={addHoliday} />
		</div>
	)
}
