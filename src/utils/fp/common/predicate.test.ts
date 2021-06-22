import * as _ from './predicate'

test('isEmptyRecursive', (): void => {
  expect(_.isEmptyRecursive([[], [], ['1']])).toBe(false)
  expect(_.isEmptyRecursive([[], [], [[]]])).toBe(true)
})
