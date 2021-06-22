import * as R from 'ramda'

const a = { name: '1' }
const b = { name: '2' }

const array = [a, b]

test('update の 参照変更', (): void => {
  const newArray = R.update(0, { name: '3' }, array)
  expect(array === newArray).toBe(false)
  expect(array[0] === newArray[0]).toBe(false)
  expect(array[1] === newArray[1]).toBe(true) // update で不要なレンダリングは起きない
})
