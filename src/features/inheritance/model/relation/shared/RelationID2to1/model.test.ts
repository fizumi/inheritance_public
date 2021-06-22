import * as _ from './model'

const ab2c = _.createDirected('a', 'b')('c')
test('createDirected', (): void => {
  const ba2c = _.createDirected('b', 'a')('c')
  expect(ab2c).toBe(ba2c)
  expect(ab2c).toEqual('a-b->c')
})

test('DirectedRelID2to1.is', (): void => {
  expect(_.DirectedRelID2to1.is('a->b')).toBe(false)
  expect(_.DirectedRelID2to1.is('a-b--c')).toBe(false)
  expect(_.DirectedRelID2to1.is('a-b->c')).toBe(true)
})

test('split.is', (): void => {
  expect(_.split(ab2c)).toEqual([['a', 'b'], 'c'])
})

test('hasAllIDs', (): void => {
  expect(_.hasAllIDs(['a', 'b'])(ab2c)).toBe(true)
  expect(_.hasAllIDs(['a', 'c'])(ab2c)).toBe(true)
  expect(_.hasAllIDs(['b', 'c'])(ab2c)).toBe(true)
  expect(_.hasAllIDs(['a', 'd'])(ab2c)).toBe(false)
})

test('hasSomeIDs', (): void => {
  expect(_.hasSomeIDs(['a', 'b'])(ab2c)).toBe(true)
  expect(_.hasSomeIDs(['a', 'c'])(ab2c)).toBe(true)
  expect(_.hasSomeIDs(['b', 'c'])(ab2c)).toBe(true)
  expect(_.hasSomeIDs(['a', 'd'])(ab2c)).toBe(true)
  expect(_.hasSomeIDs(['e', 'd'])(ab2c)).toBe(false)
})
