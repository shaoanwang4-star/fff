import { useCallback, useState } from 'react'
import type { ReaderSettings } from '../types/comic'
import { loadSettings, saveSettings } from '../services/storage'

export function useSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings)

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, update }
}
