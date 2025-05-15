'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useMerchantSettings } from '@/components/providers/settings'
import { useUser } from '@/components/providers/user'
import CutOffTime from '@/components/settings/CutOffTime'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import LeadTime from '@/components/settings/LeadTime'
import MinimumSpend from '@/components/settings/MinimumSpend'

export default function MerchantSettings() {
  const { user } = useUser()
  const {
    saveMinimumSpendPence,
    acceptedWeekDayIndices,
    updateDeliveryDays,
    saveCutOffTime,
    saveLeadTime,
  } = useMerchantSettings()

  if (!user) return <UnauthorisedLinks />

  return (
    <div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
      <MinimumSpend
        minimumSpendPence={user.minimumSpendPence}
        saveMinimumSpendPence={saveMinimumSpendPence}
      />

      <LeadTime
        leadTimeDays={user.leadTimeDays}
        saveLeadTime={saveLeadTime}
      />

      <CutOffTime
        cutOffTime={user.cutOffTime}
        saveCutOffTime={saveCutOffTime}
      />

      <DeliveryDaysSetting
        acceptedWeekDayIndices={acceptedWeekDayIndices}
        updateDeliveryDays={updateDeliveryDays}
      />

      {/* <HolidaySettings /> */}
    </div>
  )
}