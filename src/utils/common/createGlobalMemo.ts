import { setMyDebugMethodToConsole } from 'src/utils/common/debug'
type Obj = Record<string, unknown>

const createCompareAndCacheValues =
  (keysToCompare: readonly string[]) => (cache: Obj, newObj: Obj) => {
    let valuesAreEqual = true
    keysToCompare.forEach((key) => {
      if (cache[key] !== newObj[key]) {
        valuesAreEqual = false
        cache[key] = newObj[key]
      }
    })
    return valuesAreEqual
  }

// https://github.com/Microsoft/TypeScript/issues/24587#issuecomment-412287117
// const ret: string = Symbol('return value') as any

setMyDebugMethodToConsole()
// console.setKey('createGlobalMemo')

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createGlobalMemo = <Keys extends readonly string[]>(
  keysToCompare: Keys,
  globalCache: {
    args?: Record<Keys[number], unknown>
    ret?: unknown
  } = {}
) => {
  const globalMemo = <O extends Record<Keys[number], unknown>, R>(
    args: O,
    fn: (args: O) => R
  ): R => {
    const valuesAreEqual = createCompareAndCacheValues(keysToCompare)
    if (
      globalCache?.ret !== undefined &&
      globalCache?.args &&
      valuesAreEqual(globalCache.args, args)
    ) {
      // console.condlog('createGlobalMemo','[createGlobalMemo] cache was used. ', `keys: ${keysToCompare.join(', ')}`) // prettier-ignore
      return globalCache.ret as R
    }
    globalCache.ret = fn(args)
    globalCache.args = args
    // console.condlog('createGlobalMemo','[createGlobalMemo] new value calculated. ', `keys: ${keysToCompare.join(', ')}`) // prettier-ignore
    return globalCache.ret as R
  }
  globalMemo.globalCache = globalCache
  return globalMemo
}
export default createGlobalMemo

/*

memo: 過去の使用例

const globalRowsMemo = createGlobalMemo([COLS] as const)

// バックグラウンド処理で計算した結果（mutableObj[ROWS]）をキャッシュに記録
const cacheColumn: CancelableFunction<CancelableArgs> = (
  { resolve },
  { timeoutIds },
  { values, mutableObj }
) => {
  timeoutIds.push(
    setTimeout(() => {
      globalRowsMemo.globalCache.args = { [COLS]: values[COLS] }
      globalRowsMemo.globalCache.ret = mutableObj[ROWS]
      resolve('cached')
    })
  )
}

// ⚠ Form への入力のたびに rendering を発生させるので, useMemo と併用する
// cols が最新ならキャッシュを使い，そうでないなら計算する．
export const useGetRows = () => {
  const cols = useCols()
  return useConstRefCallback(() =>
    globalRowsMemo(
      { [COLS]: cols },
      ({ cols }) => idArrayAndIDMapRecord2uniqueRecords(key.id)(cols) as Row[]
    )
  )
}

*/
