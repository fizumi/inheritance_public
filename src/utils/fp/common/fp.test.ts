import * as _ from './fp'

test('inclimentUntilNotReserved', (): void => {
  expect(_.inclimentUntilNotReserved([1, 2])(-1)).toBe(0)
  expect(_.inclimentUntilNotReserved([1, 2])(0)).toBe(3)
  expect(_.inclimentUntilNotReserved([1, 2])(1)).toBe(3)
  expect(_.inclimentUntilNotReserved([1, 2])(2)).toBe(3)
  expect(_.inclimentUntilNotReserved([1, 2])(3)).toBe(4)
})
