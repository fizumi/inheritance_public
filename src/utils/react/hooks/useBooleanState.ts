/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'
import useControlled from './useControlled'

export default function useBooleanState(useControlledProps: {
  controlled: boolean | undefined
  default: boolean
  name: string
  state: string
}) {
  const [booleanState, setBooleanState] = useControlled(useControlledProps)

  const setTrue = () => {
    setBooleanState(true)
  }
  const setFalse = () => {
    setBooleanState(false)
  }

  const booleanUtils = {
    dispatcher: {
      setTrue,
      setFalse,
    },
  }

  return {
    state: [booleanState, setBooleanState],
    utils: booleanUtils,
  } as const
}

export function useBoolean(initialState = false) {
  const [state, set] = React.useState(initialState)

  const setTrue = React.useCallback(() => {
    set(true)
  }, [])
  const setFalse = React.useCallback(() => {
    set(false)
  }, [])

  const toggle = React.useCallback(() => {
    set((prevState) => !prevState)
  }, [])

  const dispatcher = {
    set,
    setTrue,
    setFalse,
    toggle,
  }

  return {
    state,
    dispatcher,
  } as const
}
