// https://stackoverflow.com/a/55189381
import React from 'react'

type Deps = Record<string, unknown>

export type DebugLogFunction = (key: string, oldValue: unknown, newValue: unknown) => void

export const log =
  (module: string, id: number | string): DebugLogFunction =>
  (key, oldValue, newValue) => {
    console.log(`${module} [${id}] change detected: `, key)
    console.log({ '1.old': oldValue, '2.new': newValue })
  }

const defaultLog: DebugLogFunction = (key, oldValue, newValue) => {
  console.log('change detected: ', key)
  console.log({ '1.old': oldValue, '2.new': newValue })
}

const logChangedValue = (oldDeps: Deps, newDeps: Deps, logFn?: DebugLogFunction) => {
  Object.keys(newDeps).forEach((key) => {
    const oldValue = oldDeps[key]
    const newValue = newDeps[key]
    if (oldValue !== newValue) {
      const log = logFn || defaultLog
      log(key, oldValue, newValue)
    }
  })
}

const useDependenciesDebugger = (deps: Deps, logFn?: DebugLogFunction, on = false) => {
  const oldDepsRef = React.useRef(deps)
  React.useMemo(() => {
    if (!on) return
    logChangedValue(oldDepsRef.current, deps, logFn)
    oldDepsRef.current = deps
  }, [...Object.values(deps)]) // eslint-disable-line react-hooks/exhaustive-deps
}
export default useDependenciesDebugger
