'use client'
import { SettingProvider } from './SettingContext'
import Setting, { SettingContent } from './Setting'
import type { SettingFormConfig } from './useSettingForm'
import { useSettingForm } from './useSettingForm'

type SettingFormProps<T> = SettingFormConfig<T> & {
  title: string
  renderView: (value: T) => React.ReactNode
  renderEdit: (value: T, onChange: (value: T) => void) => React.ReactNode
}

export default function SettingForm<T>({
  title,
  initialValue,
  onSave,
  isEqual,
  renderView,
  renderEdit,
}: SettingFormProps<T>) {
  const {
    isEditing,
    isSubmitting,
    draftValue,
    setDraftValue,
    hasChanges,
    startEditing,
    cancelEditing,
    handleSave,
  } = useSettingForm({
    initialValue,
    onSave,
    isEqual,
  })

  const contextValue = {
    title,
    isEditing,
    isSubmitting,
    hasChanges,
    startEditing,
    cancelEditing,
    handleSave,
  }

  return (
    <SettingProvider value={contextValue}>
      <Setting>
        <SettingContent
          viewMode={renderView(initialValue)}
          editMode={renderEdit(draftValue, setDraftValue)}
        />
      </Setting>
    </SettingProvider>
  )
}