/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import { shallowDiffers } from 'src/utils/common'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useStyleMemo<T extends Record<string, any>>(props: T) {
  const prev = React.useRef<T>()

  if (prev.current === undefined || !areEqual(prev.current, props)) {
    prev.current = props
  }
  return prev.current
}

/**
 * Pulled from react-window
 * https://github.com/bvaughn/react-window/blob/master/src/areEqual.js
 *
 * style が falthy な場合を考慮
 */
type Obj = Record<string, any>
export function areEqual(prevProps: { style?: Obj }, nextProps: { style?: Obj }): boolean {
  const { style: prevStyle, ...prevRest } = prevProps
  const { style: nextStyle, ...nextRest } = nextProps

  if (!prevStyle || !nextStyle)
    return prevStyle === nextStyle && !shallowDiffers(prevRest, nextRest)

  return !shallowDiffers(prevStyle, nextStyle) && !shallowDiffers(prevRest, nextRest)
}
