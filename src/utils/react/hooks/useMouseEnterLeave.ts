import React from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
// import useCurrentValue from './useCurrentValue' handleAncestorClick に使うと, 迷子のエベントリスナーが無限に増える

interface Params {
  onAncestorClick?: () => void
  initial?: boolean
}
/**
 * Popper Element 内での利用を想定.
 * onBlur によらない Popper の close が可能になるところが利点.
 * onBlur によって Popper の開閉をコントロールしようとすると, focus を管理する必要がでてきてしまう.
 * @param onAncestorClick React Tree 上の Ancestor Element がクリックされた場合に実行したい関数
 */
export default function useMouseEnterLeave({ onAncestorClick, initial = true }: Params) {
  const mouseIsAtAncestor = React.useRef(initial)

  const watchMouseEnterLeave = {
    onMouseEnter: () => {
      mouseIsAtAncestor.current = false
    },
    onMouseLeave: () => {
      mouseIsAtAncestor.current = true
    },
  }

  const handleAncestorClick = () => {
    if (mouseIsAtAncestor.current) {
      console.log('handleAncestorClick')
      onAncestorClick?.()
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (onAncestorClick === undefined) return

    window.addEventListener('click', handleAncestorClick)
    return () => {
      window.removeEventListener('click', handleAncestorClick)
    }
  }, [onAncestorClick, handleAncestorClick])

  return { watchMouseEnterLeave, mouseIsAtAncestor }
}
