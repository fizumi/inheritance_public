import * as _ from './model'
import { option as O } from 'fp-ts'
import { RID2 } from '../../../relation'

const ab2c = RID2.createDirected('a', 'b')('c')
const ba2a = RID2.createDirected('b', 'a')('c')
test('filterByIDs', (): void => {
  expect(_.filterByIDs(['a'])({ [ab2c]: 1 })).toEqual({ [ab2c]: 1 })
  expect(_.filterByIDs(['b'])({ [ab2c]: 1 })).toEqual({ [ab2c]: 1 })
  expect(_.filterByIDs(['c'])({ [ab2c]: 1 })).toEqual({ [ab2c]: 1 })
  expect(_.filterByIDs(['d'])({ [ab2c]: 1 })).toEqual({})
})
