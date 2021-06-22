import React from 'react'
import { ID } from 'src/features/inheritance/model'
import { useFocusedID } from '.'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useNameIsFocusedID = (value: readonly string[]) => {
  const [focusedID, setFocusedID] = React.useState<null | ID>(null)
  const focusedID_ = useFocusedID('name')
  React.useEffect(() => {
    if (focusedID_) {
      if (value.includes(focusedID_)) {
        setFocusedID(focusedID_)
        return
      }
    }
    setFocusedID(null)
  }, [focusedID_, value])

  return focusedID
}
