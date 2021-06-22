import React from 'react'
import { createGetRef } from './utils'

export default function useRefArray() {
  const elementsRef = React.useRef<HTMLElement[]>([])
  const createSetRefByIndex = React.useRef(createGetRef(elementsRef)).current
  const resetElementsRef = React.useCallback(() => (elementsRef.current = []), [])

  return { elementsRef, createSetRefByIndex, resetElementsRef }
}
