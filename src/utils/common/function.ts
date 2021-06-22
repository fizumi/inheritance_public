export type Reducer<A, B> = (b: B, a: A) => B
export const toReducer =
  <A, B>(fn: (a: A) => (b: B) => B): Reducer<A, B> =>
  (b: B, a: A) =>
    fn(a)(b)

export const Do = <T>(fn: () => T): T => fn() // https://github.com/yarnaimo/lifts/blob/master/src/Do.ts

export const pipe =
  <X>(...fns: ((x: X) => X)[]) =>
  (x: X): X =>
    fns.reduce((acc, fn) => fn(acc), x)
export const reduceFns =
  <X>(fns: ((x: X) => X)[]) =>
  (x: X): X =>
    fns.reduce((acc, fn) => fn(acc), x)

export const delay = (
  pred: () => any,
  willCalledOnTruthy: (val: any) => any,
  ms = 0,
  max = 10
): void => {
  const delayed = (val?: any, _max = max, firstCall = true) => {
    if (firstCall || !pred()) {
      if (_max <= 0) return
      setTimeout(() => {
        delayed(val, _max - 1, false)
      }, ms)
      return
    }
    return willCalledOnTruthy(val)
  }
  delayed()
}

export const retry = (
  fn: () => boolean | undefined,
  tryCount: number,
  intervalMs = 100,
  isSuccess = false
): Promise<boolean> => {
  if (tryCount <= 0) return Promise.resolve(false)
  if (isSuccess) return Promise.resolve(true)
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(fn() || false)
    }, intervalMs)
  })
    .then((isSuccess) => retry(fn, tryCount - 1, intervalMs, isSuccess))
    .catch(() => false)
}
