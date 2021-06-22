import * as _ from './memoize'

describe('memoizeCurriedFn', () => {
  test('literal', (): void => {
    const add = (a: number) => (b: number) => a + b
    expect(_.memoizeCurriedFn(add)(1)(2)).toEqual(3)
    console.log('---')
    expect(_.memoizeCurriedFn(add)(1)(2)).toEqual(3)
  })

  test('object', (): void => {
    const add = (a: { num: number }) => (b: { num: number }) => a.num + b.num
    const [a, b] = [{ num: 1 }, { num: 2 }]
    expect(_.memoizeCurriedFn(add)(a)(b)).toEqual(3)
    console.log('---')
    expect(_.memoizeCurriedFn(add)(a)(b)).toEqual(3)
  })
})
