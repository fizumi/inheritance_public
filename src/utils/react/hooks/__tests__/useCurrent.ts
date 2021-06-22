/**
 * @jest-environment jsdom
 */
// https://jestjs.io/docs/configuration#testenvironment-string

import React from 'react'
import useCurrent from '../useCurrent'
import { renderHook } from '@testing-library/react-hooks'

function useCurrent2<T>(value: T): T {
  const valueRef = React.useRef(value)
  valueRef.current = value

  return valueRef.current
}

const useUseCurrent = (n: number) => {
  const current = useCurrent(n)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = React.useCallback(() => current.current, [])
  return fn()
}
const useUseCurrent2 = (n: number) => {
  const current = useCurrent2(n)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = React.useCallback(() => current, [])
  return fn()
}

describe('useCurrent', () => {
  it('useCallback をすり抜ける', () => {
    const { result, rerender } = renderHook((n) => useUseCurrent(n), { initialProps: 1 })
    expect(result.current).toBe(1)
    rerender(2)
    expect(result.current).toBe(2)
  })
  it('useCurrent2 ではすり抜けられない', () => {
    const { result, rerender } = renderHook((n) => useUseCurrent2(n), { initialProps: 1 })
    expect(result.current).toBe(1)
    rerender(2)
    expect(result.current).toBe(1) // ❗
  })
})
