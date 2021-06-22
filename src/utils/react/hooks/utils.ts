/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'

export const createGetRef =
  <El extends HTMLElement = HTMLElement>(elementArrayRef: React.MutableRefObject<El[]>) =>
  (index: number) => {
    const getRef = (instance: El | null) => {
      index === 0 && console.log('callback ref', instance)
      if (elementArrayRef.current[index] === undefined && instance !== null) {
        elementArrayRef.current[index] = instance
      }
    }
    return getRef
  }

export const noop = () => {
  /* noop */
}

export function on<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]
): void {
  if (obj && obj.addEventListener) {
    obj.addEventListener(...(args as Parameters<HTMLElement['addEventListener']>))
  }
}

export function off<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]
): void {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(...(args as Parameters<HTMLElement['removeEventListener']>))
  }
}

export const isBrowser = typeof window !== 'undefined'

export const isNavigator = typeof navigator !== 'undefined'
