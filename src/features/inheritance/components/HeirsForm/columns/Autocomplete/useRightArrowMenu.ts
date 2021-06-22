import { flow } from 'fp-ts/function'
import * as R from 'ramda'
import React from 'react'
import { GetRels, ID, RelationKey } from 'src/features/inheritance/model'
import {
  getID,
  getIndex,
  makeOptionID,
} from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import { useConstRefCallback } from 'src/utils/react/hooks'
import useRestrictConsecutiveCalls from 'src/utils/react/hooks/useRestrictConsecutiveCalls'
import { RelsForm } from './RelsForm'

export interface RightArrowMenu {
  isOpen: boolean
  getFormProps: (selectedIDs: readonly string[]) => RelsForm
  forceClose: () => void
  close: () => void
  openOnClick?: React.MouseEventHandler<HTMLButtonElement>
  isSelected: (id: ID) => boolean
  getIsOpen: () => boolean
  disableClose: React.MutableRefObject<boolean>
  otherDeps: Record<string, any>
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useRightArrowMenu = <K extends RelationKey>(key: K, id: ID, curRels: GetRels<K>) => {
  const [optionEl, setOptionEl] = React.useState<Element | null>(null)
  console.condlog('Autocomplete', { optionEl })
  const getIsOpen = useConstRefCallback(() => optionEl !== null)
  const disableClose = React.useRef(false)
  const debounce = useRestrictConsecutiveCalls()
  const debouncedSetOptionEl = React.useMemo<typeof setOptionEl>(
    () =>
      debounce((nullOrEl) => {
        if (!disableClose.current) {
          setOptionEl(nullOrEl)
        }
      }),
    [debounce]
  )
  const close = React.useCallback(() => debouncedSetOptionEl(null), [debouncedSetOptionEl])
  const forceClose = React.useCallback(() => setOptionEl(null), [])
  const getOptionEl = React.useCallback(
    (index: number | string | undefined | null) =>
      document.getElementById(makeOptionID(`${key}-${id}`, index ?? '')),
    [id, key]
  )
  const setOptionElByIndex = React.useCallback(
    (index?: number) => debouncedSetOptionEl(getOptionEl(index)),
    [debouncedSetOptionEl, getOptionEl]
  )
  const curTheOtherID = React.useMemo(() => (optionEl ? getID(optionEl) : null), [optionEl])
  const isOpen = optionEl !== null

  const getFormProps = React.useCallback(
    (selectedIDs) => ({
      anchorEl: optionEl,
      id,
      theOtherID: curTheOtherID,
      close,
      getIsOpen,
      disableClose,
      selectedIDs,
      curRels,
    }),
    [close, curRels, curTheOtherID, getIsOpen, id, optionEl]
  )

  const rightArrowMenu: RightArrowMenu = React.useMemo(
    () => ({
      isOpen,
      getFormProps,
      forceClose,
      close,
      openOnClick: flow(
        getIndex,
        getOptionEl,
        R.tap((x) => console.condlog('Autocomplete', 'rightArrow clicked')),
        R.ifElse(
          (x) => x === optionEl,
          () => {
            console.condlog('Autocomplete', 'close because of right arrow click')
            close()
          },
          debouncedSetOptionEl
        )
      ),
      isSelected: (theOtherID) => theOtherID === curTheOtherID,
      getIsOpen,
      disableClose,
      otherDeps: { id, curTheOtherID, optionEl },
    }),
    [isOpen, getFormProps, forceClose, close, getOptionEl, debouncedSetOptionEl, getIsOpen, id, curTheOtherID, optionEl] // prettier-ignore
  )

  return {
    rightArrowMenu,
    setOptionElByIndex,
    curTheOtherID,
  }
}
