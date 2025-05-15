'use client'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import { useDemoSettings } from '@/components/providers/demo/settings'
import { useDemoUser } from '@/components/providers/demo/user'
import CutOffTime from '@/components/settings/CutOffTime'
import DeliveryDaysSetting from '@/components/settings/DeliveryDaysSetting'
import LeadTime from '@/components/settings/LeadTime'
import MinimumSpend from '@/components/settings/MinimumSpend'

export default function DemoSettingsPage() {
  const { 
    updateDeliveryDays, 
    acceptedWeekDayIndices, 
    saveMinimumSpendPence, 
    saveCutOffTime,
    saveLeadTime 
  } = useDemoSettings()
  
  const { demoUser } = useDemoUser()

  function DemoUserDetails() {
    return (
      <div className="flex flex-col gap-y-2 w-full max-w-md border-2 border-slate-100 rounded-xl p-3">
        <p className="font-medium">{"Jane's Bakery"}</p>
        <p>Jane Smith</p>
        <p>janesmith@janesbakery.com</p>
      </div>
    )
  }

  return (
    <>
      <SignedOutBreadCrumbs trail={[{ displayName: 'Demo', href: '/demo' }]} currentPageTitle="Settings" />
      <div className="flex flex-col gap-y-4 items-start">
        <h1>Settings</h1>
        <DemoUserDetails />
        <div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
          <MinimumSpend
            minimumSpendPence={demoUser.minimumSpendPence}
            saveMinimumSpendPence={saveMinimumSpendPence}
          />

          <LeadTime
            leadTimeDays={demoUser.leadTimeDays}
            saveLeadTime={saveLeadTime}
          />

          <CutOffTime
            cutOffTime={demoUser.cutOffTime}
            saveCutOffTime={saveCutOffTime}
          />

          <DeliveryDaysSetting
            acceptedWeekDayIndices={acceptedWeekDayIndices}
            updateDeliveryDays={updateDeliveryDays}
          />
        </div>
      </div>
    </>
  )
}