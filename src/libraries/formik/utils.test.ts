import * as _ from './utils'
import data from 'src/features/inheritance/data/case6-3_217.json'
import { COLS, RELS, Store } from 'src/features/inheritance/model'
import * as R from 'ramda'

test('getFirstErrorFieldPath', (): void => {
  expect(_.getFirstErrorFieldPath({ a: 'e' })).toBe('a')
  expect(_.getFirstErrorFieldPath({ a: '', b: 'e' })).toBe('b')
  expect(_.getFirstErrorFieldPath({ A: { a: 'e' }, B: '' })).toBe('A.a')
  expect(_.getFirstErrorFieldPath({ A: { a: '' }, B: { b: undefined, c: { d: 'e' } } })).toBe(
    'B.c.d'
  )
  expect(_.getFirstErrorFieldPath(['e'])).toBe('0')
  expect(_.getFirstErrorFieldPath(['', 'e'])).toBe('1')
  expect(_.getFirstErrorFieldPath(['', undefined, 'e'])).toBe('2')
  expect(_.getFirstErrorFieldPath({ a: ['', undefined], b: 'b' })).toBe('b')
})

test('setIn', (): void => {
  const newD = _.setIn(data, 'cols.name.F', 'FF') as Store
  expect(newD[COLS].name['F']).toBe('FF')
  expect(newD[COLS].name === data[COLS].name).toBe(false)
  expect(newD[COLS] === data[COLS]).toBe(false)
  // expect(newD[COLS].deathDate === data[COLS].deathDate).toBe(false) // ❗ formik setIn の弱点
  // expect(newD[RELS] === data[RELS]).toBe(false) // ❗ formik setIn の弱点
  expect(newD[COLS].deathDate === data[COLS].deathDate).toBe(true)
  expect(newD[RELS] === data[RELS]).toBe(true)
})
test('assocPath', (): void => {
  const newD = R.assocPath(['cols', 'name', 'F'], 'FF', data) as Store
  expect(newD[COLS].name['F']).toBe('FF')
  expect(newD[COLS].name === data[COLS].name).toBe(false)
  expect(newD[COLS] === data[COLS]).toBe(false)
  expect(newD[COLS].deathDate === data[COLS].deathDate).toBe(true)
  expect(newD[RELS] === data[RELS]).toBe(true)
})
