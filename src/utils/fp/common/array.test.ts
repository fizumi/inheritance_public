import * as _ from './array'

test('isNoNil', (): void => {
  expect(_.isNoNil([true, null])).toBe(false)
  expect(_.isNoNil(true, null)).toBe(false)
  expect(_.isNoNil(true, undefined)).toBe(false)
  expect(_.isNoNil(true, undefined)).toBe(false)
  expect(_.isNoNil([true, true])).toBe(true)
  expect(_.isNoNil(true, true)).toBe(true)
})

test('get', (): void => {
  const array = ['1', '2', '3']
  expect(_.getNext(array)('2')).toBe('3')
  expect(_.getNext(array)('3')).toBe('3')
  expect(_.getPrev(array)('2')).toBe('1')
  expect(_.getPrev(array)('1')).toBe('1')
})

test('deleteEmptyRecursive', (): void => {
  expect(_.deleteEmptyRecursively(['1'])).toEqual(['1'])
  expect(_.deleteEmptyRecursively([['1']])).toEqual([['1']])
  expect(_.deleteEmptyRecursively([[['1']]])).toEqual([[['1']]])
  expect(_.deleteEmptyRecursively(['1', '2'])).toEqual(['1', '2'])
  expect(_.deleteEmptyRecursively(['1', []])).toEqual(['1'])
  expect(_.deleteEmptyRecursively(['1', ['2']])).toEqual(['1', ['2']])
  expect(_.deleteEmptyRecursively(['1', ['2', []]])).toEqual(['1', ['2']])
  expect(_.deleteEmptyRecursively(['1', ['2', ['3']]])).toEqual(['1', ['2', ['3']]])
  expect(_.deleteEmptyRecursively([[], ['1']])).toEqual([['1']])
  expect(_.deleteEmptyRecursively(['1', [], ['2', []]])).toEqual(['1', ['2']])
  expect(_.deleteEmptyRecursively([[], [[]]])).toEqual([])
})

test('hasIntersection', (): void => {
  const array = ['1', '2', '3']
  expect(_.hasIntersection(array)(['2'])).toBe(true)
  expect(_.hasIntersection(array)(['1', '3'])).toBe(true)
  expect(_.hasIntersection(array)(['1', '4'])).toBe(true)
  expect(_.hasIntersection(array)(['4'])).toBe(false)
  expect(_.hasIntersection(array)([])).toBe(false)
})

test.only('includsAll', (): void => {
  const array = ['1', '2', '3']
  expect(_.includsAll(['2'])(array)).toBe(true)
  expect(_.includsAll(['2', '1'])(array)).toBe(true)
  expect(_.includsAll(['2', '3', '1'])(array)).toBe(true)
  expect(_.includsAll(['0', '3', '1'])(array)).toBe(false)
  expect(_.includsAll(['2', '0'])(array)).toBe(false)
  expect(_.includsAll(['0'])(array)).toBe(false)
  expect(_.includsAll([] as string[])(array)).toBe(true)
})
