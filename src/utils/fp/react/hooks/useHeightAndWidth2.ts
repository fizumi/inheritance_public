import React from 'react'
import { function as F, option as O } from 'fp-ts'
import { getHeightAndWidth, HeightWidth } from 'src/utils/fp/web'

const cache = new Map<string, HeightWidth>()

export default function useHeightAndWidth<T extends HTMLElement = HTMLElement>(id?: string) {
  const [ref, setRef] = React.useState<T>()
  const [HW_, setHW] = React.useState<HeightWidth>()

  React.useEffect(() => {
    if (!ref) return
    if (id && cache.has(id)) return
    F.pipe(ref, getHeightAndWidth(window), O.getOrElseW(F.constUndefined), (HW) => {
      setHW(HW)
      if (id && HW) {
        cache.set(id, HW)
      }
    })
  }, [id, ref])

  const HW = id && cache.has(id) ? cache.get(id) : HW_

  return { setRef, HeightAndWidth: HW }
}
