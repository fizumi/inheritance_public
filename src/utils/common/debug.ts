/* eslint-disable @typescript-eslint/ban-types */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Key2any {
  test: 'Key2any の 動作確認'
}
type Key = keyof Key2any

export interface MyDebugConsoleMethods {
  condlog: (key: Key, ...args: any[]) => void
  logIf: (willLog: boolean, ...args: any[]) => void
  before: (key: Key, msg: string, beforeValue: any) => void
  after: (key: Key, afterValue: any, ...other: any[]) => void
  setKey: (keys: Key) => void
  setKeys: (keys: Key[]) => void
  hasKey: (key: Key) => boolean
  thisFn: () => string | undefined
  getCallers: (depth?: number) => string | undefined
  shalowStringify: (o: object) => string
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Console extends MyDebugConsoleMethods {}
}

const validKeys = new Set()
const befVal = {} as Record<string, any>
const aftVal = {} as Record<string, any>
const msgWhenDiffer = {} as Record<string, string | undefined>

/**
 * transform-remove-console をフル活用する
 */
export const setMyDebugMethodToConsole = (): void => {
  if (console?.setKey !== undefined) return

  console.setKey = (key) => {
    if (validKeys.has(key)) {
      console.warn(`key: [${key}] は 既に使われています`)
    }
    validKeys.add(key)
  }
  console.setKeys = (keys) => {
    keys.forEach(console.setKey)
  }

  console.hasKey = (key) => validKeys.has(key)

  console.condlog = (key, ...args) => {
    validKeys.has(key) && console.log(`[${key}]`, ...args)
  }

  console.before = (key, msg, beforeValue) => {
    if (!validKeys.has(key)) return
    if (msgWhenDiffer[key] !== undefined && aftVal[key] !== undefined) {
      console.warn(`Don't use 'before' method in a row.
      msg: ${msgWhenDiffer[key]}, ${msg} / key: ${key}`)
    }
    aftVal[key] = undefined
    befVal[key] = beforeValue
    msgWhenDiffer[key] = msg
  }

  console.after = (key, afterValue, ...other) => {
    if (!validKeys.has(key)) return
    aftVal[key] = afterValue
    if (befVal[key] !== aftVal[key]) {
      console.log(msgWhenDiffer[key], befVal[key], '=>', aftVal[key], ...other)
    }
    msgWhenDiffer[key] = befVal[key] = undefined
  }

  console.logIf = (willLog, ...args) => {
    willLog && console.log(...args)
  }

  console.thisFn = () => {
    return new Error().stack
      ?.split('\n')
      .filter((s) => !!s && fnNameMatcher.test(s)) // 関数名無しの行を除去
      .splice(1, 1) // [0]は当関数, [1]は当関数を呼び出した関数
      .map(fnName)
      .join('')
  }

  // https://stackoverflow.com/a/48985787
  console.getCallers = (depth = 1) => {
    return new Error().stack
      ?.split('\n')
      .filter((s) => !!s && fnNameMatcher.test(s)) // 関数名無しの行を除去
      .splice(2, depth)
      .map(fnName)
      .join('<-')
  }

  console.shalowStringify = (obj) => {
    const ret = [] as string[]
    for (const property in obj) {
      const value = (obj as any)[property]
      const type = typeof value
      if (
        type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        value === null
      )
        ret.push(`${property}: ${value}`)
    }
    return ret.join(', ')
  }
}
const fnNameMatcher = /([^(]+)@|at ([^(]+) \(/

function fnName(str: string) {
  const regexResult = fnNameMatcher.exec(str)
  if (!regexResult) return null
  return regexResult[1] || regexResult[2]
}
