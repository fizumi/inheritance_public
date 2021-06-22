import React from 'react'
import { function as F, option as O } from 'fp-ts'
import { getEmSize } from 'src/utils/fp/web'

export default function usePixcelPerEm<T extends HTMLElement = HTMLElement>() {
  const refForMeasureEm = React.useRef<T>(null)
  const pixelPerEm = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!refForMeasureEm.current) return
    pixelPerEm.current = F.pipe(
      refForMeasureEm.current,
      getEmSize(window),
      O.getOrElseW(F.constant(null))
    )
  }, [])

  return { refForMeasureEm, pixelPerEm: pixelPerEm.current }
}
