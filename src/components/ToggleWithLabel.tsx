import { Field, Label, Switch } from '@headlessui/react'
import clsx from 'clsx'

interface Props {
  enabled: boolean
  setEnabled: (value: boolean) => void
  enabledLabel: string
  disabledLabel: string
}

export default function ToggleWithLabel({ enabled, setEnabled, enabledLabel, disabledLabel }: Props) {
  return (
    <Field className="flex items-center">
      <Label as="span" className="mr-3 text-sm">
        <button
          onClick={() => setEnabled(true)}
          disabled={!enabled}
          className={clsx(
            'text-zinc-500 mr-1 hover:text-zinc-600 active:text-zinc-700 transition-all duration-300 ',
            !enabled && 'text-zinc-900 cursor-default',
          )}>
          {disabledLabel}
        </button>
      </Label>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked]:bg-blue-600">
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
        />
      </Switch>
      <Label as="span" className="ml-3 text-sm">
        <button
          onClick={() => setEnabled(false)}
          disabled={enabled}
          className={clsx(
            ' text-zinc-500 mr-1 hover:text-zinc-600 active:text-zinc-700 transition-all duration-300',
            enabled ? 'text-zinc-900 cursor-default' : 'cursor-pointer',
          )}>
          {enabledLabel}
        </button>
      </Label>
    </Field>
  )
}
