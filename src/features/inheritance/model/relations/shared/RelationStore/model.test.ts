import * as _ from './model'
import { option as O } from 'fp-ts'
import { RID } from '../../../relation'

const a2b = RID.createDirected('a')('b')
const b2a = RID.createDirected('b')('a')
const ab = RID.createUndirected('a')('b')

test('getDirectedEdge', (): void => {
  // expect(_.getDirectedEdge('a')('b')({ [a2b]: 1 })).toEqual(O.some(1))
  // expect(_.getDirectedEdge('b')('a')({ [a2b]: 1 })).toEqual(O.none)
  // expect(_.getDirectedEdge('a')('c')({ [a2b]: 1 })).toEqual(O.none)
})

test('getUndirectedEdge', (): void => {
  // expect(_.getUndirectedEdge('a')('b')({ [ab]: 1 })).toEqual(O.some(1))
  // expect(_.getUndirectedEdge('b')('a')({ [ab]: 1 })).toEqual(O.some(1))
  // expect(_.getUndirectedEdge('a')('c')({ [ab]: 1 })).toEqual(O.none)
})

test('filterByID', (): void => {
  expect(_.filterByID('a')({ [a2b]: 1 })).toEqual({ [a2b]: 1 })
  expect(_.filterByID('b')({ [a2b]: 1 })).toEqual({ [a2b]: 1 })
  expect(_.filterByID('c')({ [a2b]: 1 })).toEqual({})
  expect(_.filterByID('a')({ [ab]: 1 })).toEqual({ [ab]: 1 })
  expect(_.filterByID('b')({ [ab]: 1 })).toEqual({ [ab]: 1 })
  expect(_.filterByID('c')({ [ab]: 1 })).toEqual({})
})

test('remove', (): void => {
  // expect(_.remove()('a')('b')({ [a2b]: 1 })).toEqual({})
  // expect(_.remove()('a')('b')({ [b2a]: 1 })).toEqual({})
  // expect(_.remove()('a')('b')({ [ab]: 1 })).toEqual({})
  // expect(_.remove('directed')('a')('b')({ [a2b]: 1 })).toEqual({})
  // expect(_.remove('directed')('a')('b')({ [b2a]: 1 })).toEqual({ [b2a]: 1 })
  // expect(_.remove('directed')('a')('b')({ [ab]: 1 })).toEqual({ [ab]: 1 })
})
