import React from 'react'
import { getRemSize } from 'src/utils/fp/web'
import useMeasure from 'src/utils/react/hooks/useMeasure'

const useRem = (initial = 16) => {
  const [setObserveTarget] = useMeasure<HTMLDivElement>()
  const [remSize, setRemSize] = React.useState<number>(initial)

  const ObservedResizeElement = React.useMemo(
    () => (
      <div ref={setObserveTarget} style={{ visibility: 'hidden', position: 'fixed', zIndex: -1 }}>
        dummy
      </div>
    ),
    [setObserveTarget]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const newSize = getRemSize(window)
    if (!newSize) return
    console.log('new rem size', newSize)
    setRemSize(newSize)
  })

  return [remSize, ObservedResizeElement] as const
}
export default useRem
