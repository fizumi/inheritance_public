import { function as F, readonlyArray as A, number, either as E, option as O } from 'fp-ts'
import * as R from 'ramda'
import * as BR from './TEEO'

const isEven = (n: number) => {
  return n % 2 === 0
}
const double = (n: number) => {
  return n * 2
}
const msg = 'include non number'
const safeDouble = (a: any) => {
  if (typeof a === 'number') {
    return E.right(double(a))
  }
  return E.left(new Error(msg))
}

describe('breakable', (): void => {
  const sumNumberArray = BR.reduce(A.Foldable, number.MonoidSum)
  test('break using A', (): void => {
    const filter = jest.fn()
    const map = jest.fn()
    F.pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        F.flow(
          BR.breakReduce((x) => x >= 5),
          BR.filter(F.flow(R.tap(filter), isEven)),
          BR.map(F.flow(R.tap(map), double))
        )
      ),
      E.map((x) => expect(x).toBe(12))
    )
    expect(filter).toHaveBeenCalledTimes(4)
    expect(map).toHaveBeenCalledTimes(2)
  })
  test('break using acc(B)', (): void => {
    F.pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        F.flow(
          BR.breakReduce((x, acc) => acc >= 3),
          BR.filter(isEven),
          BR.map(double)
        )
      ),
      E.map((x) => expect(x).toBe(4))
    )
  })
  test('reduced', (): void => {
    const reduced = jest.fn()
    F.pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        F.flow(
          BR.filter(isEven),
          BR.reduced((a, b) => ((reduced(), a > 3) ? O.some(b + 109) : O.none))
        )
      ),
      E.map((x) => expect(x).toBe(111))
    )
    expect(reduced).toHaveBeenCalledTimes(2)
  })
  test('error', (): void => {
    const breakReduce = jest.fn()
    const chain = jest.fn()
    F.pipe(
      [1, '2', 3, 4, 5, 6, 7],
      sumNumberArray(
        F.flow(
          BR.breakReduce((x, acc) => (breakReduce(), acc >= 10)),
          BR.chain(F.flow(R.tap(chain), safeDouble))
        )
      ),
      E.mapLeft((x) => expect(x.message).toBe(msg))
    )
    expect(breakReduce).toHaveBeenCalledTimes(2)
    expect(chain).toHaveBeenCalledTimes(2)
  })
  test('no error', (): void => {
    const breakReduce = jest.fn()
    const chain = jest.fn()
    F.pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        F.flow(
          BR.breakReduce((x, acc) => (breakReduce(), x > 4)),
          BR.chain(F.flow(R.tap(chain), safeDouble))
        )
      ),
      E.map((x) => expect(x).toBe(20))
    )
    expect(breakReduce).toHaveBeenCalledTimes(5)
    expect(chain).toHaveBeenCalledTimes(4)
  })

  test('identity', (): void => {
    const identity = jest.fn()
    F.pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray((x) => (identity(), x)),
      E.map((x) => expect(x).toBe(28))
    )
    expect(identity).toHaveBeenCalledTimes(7)
  })
})
