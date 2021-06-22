import * as _ from './array'

test('hasDupulicate', (): void => {
  expect(_.hasDupulicate([])).toBe(false)
  expect(_.hasDupulicate([1])).toBe(false)
  expect(_.hasDupulicate([1, 2])).toBe(false)
  expect(_.hasDupulicate([1, 1])).toBe(true)
  expect(_.hasDupulicate([2, 1, 1])).toBe(true)
})

describe('getNewIndexes reorderArray', () => {
  const ids = ['1', '2', '3']
  const newIds = ['2', '3', '1']
  const newIndexes = [2, 0, 1]
  const src = ['a', 'b', 'c']
  const dst = ['b', 'c', 'a']

  test('getNewIndexes', (): void => {
    expect(_.getNewIndexes(ids)(newIds)).toEqual(newIndexes)
  })

  test('reorderArray', (): void => {
    expect(_.reorderArray(src)(newIndexes)).toEqual(dst)
  })
})
