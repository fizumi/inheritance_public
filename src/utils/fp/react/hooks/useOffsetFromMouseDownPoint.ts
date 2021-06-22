import { clientXYSubtract, pickClientXY, ClientXY, NOT_MOVE } from 'src/utils/fp/web/clientXY'
import React from 'react'

/*
    memo

      addEventListener に対しては MouseEvent を使う必要がある。一方、
      React Component に対しては React.MouseEvent を使う必要がある。
      そのため、 MouseEvent も React.MouseEvent も使用している。
*/

export default function useOffsetFromMouseDownPoint() {
  const [offsetFromMouseDownPoint, setOffsetFromMouseDownPoint] = React.useState(NOT_MOVE)
  const mouseDownPoint = React.useRef<ClientXY | null>(null)

  const mouseHandlers = React.useMemo(
    () => ({
      // for React Component
      onMouseDown: (e: React.MouseEvent<Element, MouseEvent>) => {
        mouseDownPoint.current = pickClientXY(e)
        setOffsetFromMouseDownPoint(NOT_MOVE)
      },

      // for addEventListener
      onMouseMove: (e: MouseEvent) => {
        if (mouseDownPoint.current === null) return
        const newOffsetFromMouseDownPoint = clientXYSubtract(
          pickClientXY(e),
          mouseDownPoint.current
        )
        setOffsetFromMouseDownPoint(newOffsetFromMouseDownPoint)
        return newOffsetFromMouseDownPoint
      },

      // for addEventListener
      onMouseUp: () => {
        mouseDownPoint.current = null
        setOffsetFromMouseDownPoint(NOT_MOVE)
      },
    }),
    []
  )

  return {
    offsetFromMouseDownPoint,
    setOffsetFromMouseDownPoint,
    mouseHandlers,
  }
}
