import CutoffTime from './components/CutoffTime'
import Email from './components/Email'
import Status from './components/Status'

export default function SettingsPage() {
  return (
    <div className="max-w-md flex flex-col">
      <h1>Settings</h1>
      <div className="flex flex-col gap-y-4">
        <Email />
        <Status />
        <CutoffTime />
      </div>
    </div>
  )
}
