import * as React from 'react'
import { BasePickerProps } from '@material-ui/pickers'

// LINK ../../../../hooks/useControlled.ts
// やっていることは useControlled と同じ
export function useOpenState({ open, onOpen, onClose }: BasePickerProps<any, any>) {
  const isControllingOpenProp = React.useRef(typeof open === 'boolean').current // default では false
  const [openState, setIsOpenState] = React.useState(false)

  // It is required to update inner state in useEffect in order to avoid situation when
  // Our component is not mounted yet, but `open` state is set to `true` (e.g. initially opened)
  React.useEffect(() => {
    if (isControllingOpenProp) {
      if (typeof open !== 'boolean') {
        throw new Error('You must not mix controlling and uncontrolled mode for `open` prop')
      }

      setIsOpenState(open)
    }
  }, [isControllingOpenProp, open])

  const setIsOpen = React.useCallback(
    (newIsOpen: boolean) => {
      console.condlog('date picker', 'setIsOpen', { newIsOpen })
      if (!isControllingOpenProp) {
        setIsOpenState(newIsOpen)
      }

      return newIsOpen ? onOpen && onOpen() : onClose && onClose()
    },
    [isControllingOpenProp, onOpen, onClose]
  )

  return { isOpen: openState, setIsOpen }
}
