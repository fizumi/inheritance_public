import React from 'react'
import { function as F, option as O } from 'fp-ts'
import { getHeightAndWidth, HeightWidth } from 'src/utils/fp/web'

const cache = new Map<string, HeightWidth>()

export default function useHeightAndWidth<T extends HTMLElement = HTMLElement>(id?: string) {
  const refForMeasureHW = React.useRef<T>(null)
  const [HW_, setHW] = React.useState<HeightWidth>()

  React.useEffect(() => {
    if (!refForMeasureHW.current) return
    if (id && cache.has(id)) return
    F.pipe(
      refForMeasureHW.current,
      getHeightAndWidth(window),
      O.getOrElseW(F.constUndefined),
      (HW) => {
        setHW(HW)
        if (id && HW) {
          cache.set(id, HW)
        }
      }
    )
  }, [id])

  const HW = id && cache.has(id) ? cache.get(id) : HW_

  return { refForMeasureHW, heightAndWidth: HW }
}
