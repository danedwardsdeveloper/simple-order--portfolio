'use client'

import { useEffect, useState } from 'react'

export type SettingFormConfig<T> = {
  initialValue: T
  onSave: (value: T) => Promise<void>
  isEqual?: (a: T, b: T) => boolean
}

export function useSettingForm<T>({ 
  initialValue, 
  onSave,
  isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
}: SettingFormConfig<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftValue, setDraftValue] = useState<T>(initialValue)

  // Update draft when initial value changes or edit mode starts
  useEffect(() => {
    if (isEditing) {
      setDraftValue(initialValue)
    }
  }, [isEditing, initialValue])

  const hasChanges = !isEqual(draftValue, initialValue)

  const startEditing = () => setIsEditing(true)
  const cancelEditing = () => setIsEditing(false)

  const handleSave = async () => {
    if (!hasChanges) return
    
    setIsSubmitting(true)
    try {
      await onSave(draftValue)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEditing,
    isSubmitting,
    draftValue,
    setDraftValue,
    hasChanges,
    startEditing,
    cancelEditing,
    handleSave,
  }
}