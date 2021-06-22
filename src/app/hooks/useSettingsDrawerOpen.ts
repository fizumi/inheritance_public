// import React from 'react'
import { useBoolean } from 'src/utils/react/hooks'
import constate from 'src/libraries/constate'

export const [SettingsDrawerProvider, useSettingsDrawerOpen] = constate(() => {
  const {
    state: settingsOpen,
    dispatcher: { setTrue: settingsDrawerOpen, setFalse: settingsDrawerClose },
  } = useBoolean()
  return { settingsOpen, settingsDrawerOpen, settingsDrawerClose }
})
