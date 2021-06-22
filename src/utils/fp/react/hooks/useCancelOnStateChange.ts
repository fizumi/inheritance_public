/* eslint-disable @typescript-eslint/no-inferrable-types */
import React from 'react'
import { getCurrentsOrIdentity } from 'src/utils/fp/react/hooks/utils'

type QueuesForCancel = {
  rejects: ((value: unknown) => void)[]
  timeoutIds: number[]
}
export type CancelableFunction<O extends Record<keyof O, any>> = (
  rnr: {
    resolve: (value: string | PromiseLike<string>) => void
    reject: (reason?: any) => void
  },
  queues: QueuesForCancel,
  args: O,
  previousValue?: any
) => void

export const getCreateCancelable = (
  queues: QueuesForCancel,
  isCalculating: React.MutableRefObject<boolean>,
  messages?: DebugMessages
) => {
  const createCancelableFunction =
    <O extends Record<keyof O, any>>(fn: CancelableFunction<O>, args: O) =>
    (previousValue?: any) =>
      new Promise<string>((resolve, reject) => {
        messages && previousValue && console.log(previousValue)
        queues.rejects.push(reject)
        fn({ resolve, reject }, queues, args, previousValue)
      })

  createCancelableFunction.start = () => {
    isCalculating.current = true
    return Promise.resolve(messages?.start)
  }

  createCancelableFunction.end = (previousValue?: any) => {
    if (messages) {
      previousValue && console.log(previousValue)
      console.log(messages.end)
    }
    isCalculating.current = false
  }
  return createCancelableFunction
}

type DebugMessages = {
  cancel: any
  start: any
  end: any
}
const defaultMsg = {
  cancel: '[cancel background calculation]',
  start: '[start background calculation]',
  end: '[end background calculation]',
}
const useCancelOnStateChange = (debug?: boolean | DebugMessages) => {
  const timeoutIds = React.useRef<number[]>([])
  const rejects = React.useRef<((value: unknown) => void)[]>([]) // https://qiita.com/KuwaK/items/0193cddf9d96fdc53728
  const isCalculating = React.useRef(false)

  const messages = typeof debug !== 'boolean' ? debug : debug ? defaultMsg : undefined

  // 過去の useEffect にてキューに入れたマクロタスクが残っていれば、それらのタスクを全てキャンセルする。
  while (timeoutIds.current.length) {
    clearTimeout(timeoutIds.current.pop())
  }
  while (rejects.current.length) {
    rejects.current.pop()?.(messages?.cancel)
  }

  const createCancelableFunction = React.useMemo(
    () =>
      getCreateCancelable(getCurrentsOrIdentity({ timeoutIds, rejects }), isCalculating, messages),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return { createCancelableFunction, isCalculating: isCalculating.current }
}

export default useCancelOnStateChange
