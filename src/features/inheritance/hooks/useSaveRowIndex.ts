import React from 'react'
import constate from 'src/libraries/constate'
import useLocalStorage from 'src/utils/fp/react/hooks/useLocalStorage'
import { useCancelAndDelay, useLifecycles } from 'src/utils/react/hooks'
import { useReactWindowInstance } from './useListRef'
import { delay } from 'src/utils/common'

/**
 * 前回の表示箇所を保存しておく
 */
const useSaveRowIndex = () => {
  const latestMountIndexRef = React.useRef(0)
  const [latestUnmountIndex, setLatestUnmountIndex_] = React.useState(0)
  const [middleIndexLoaded, setMiddleIndexLoaded] = React.useState<number | null>(null)
  const unsafeSetMiddleIndex = (value: any) => {
    setMiddleIndexLoaded(value)
  }
  const getLatestMountIndex = (rowIndex: number) => {
    latestMountIndexRef.current = rowIndex
  }
  const cancelAndDelay = useCancelAndDelay(1000)
  const setLatestUnmountIndex = (rowIndex: number) => {
    cancelAndDelay(() => {
      setLatestUnmountIndex_(rowIndex)
    })
  }

  const middleIndex = Math.floor((latestMountIndexRef.current + latestUnmountIndex) / 2)

  useLocalStorage({
    key: 'useSaveRowIndex',
    value: middleIndex,
    setValue: unsafeSetMiddleIndex,
  })

  // memo: FixedSizeGrid:initialScrollTop の活用は上手く行かなかった
  const rwRef = useReactWindowInstance()
  const hasScrolled = React.useRef(false)
  if (!hasScrolled.current) {
    delay(
      () => middleIndexLoaded !== null && rwRef.current,
      () => {
        if (!middleIndexLoaded) return
        rwRef.current?.scrollToItem(middleIndexLoaded, 'smart')
        hasScrolled.current = true
      }
    )
  }

  const useSetRowIndex = (index: number) => {
    useLifecycles({
      onDidMount: () => getLatestMountIndex(index),
      onWillUnmount: () => setLatestUnmountIndex(index),
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => useSetRowIndex, [])
}

/**
 * depend on useGridRef.ts
 */
export const [RowIndexProvider, useUseSetRowIndex] = constate(useSaveRowIndex)
