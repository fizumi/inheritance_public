import React from 'react'
import { useTheme } from '@material-ui/core'

export const useSolidBorder = () => {
  const theme = useTheme()

  const primaryMainColor = theme.palette.primary.main

  const solidBorder = React.useMemo(
    () => ({ border: `2px solid ${primaryMainColor}` }),
    [primaryMainColor]
  )

  return { theme, primaryMainColor, solidBorder }
}
