import * as R from 'ramda'
import * as _ from './setIn'

/*
    わかったこと

    - setIn や assocPath は path 部分の ref を変更するが, path 以外の部分はメモリを共有し得る
    - setIn は path が指し示す値と set しようとした値と が同一である場合, 第一引数をを返却する（ ref を全く変更しない）
*/

const src = {
  cols: {
    id: ['a', 'b'],
    count: {
      a: 1,
      b: 2,
    },
  },
}
test('setIn', (): void => {
  const src_ = R.clone(src)
  const dst = _.setIn(src_, 'cols.count.a', 3)
  expect(dst.cols.count.a).toBe(3)
  expect(dst === src_).toBe(false)
  expect(dst.cols === src_.cols).toBe(false)
  expect(dst.cols.count === src_.cols.count).toBe(false)
  expect(dst.cols.count.a === src_.cols.count.a).toBe(false)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
test('assocPath', (): void => {
  const src_ = R.clone(src)
  const dst = R.assocPath(['cols', 'count', 'a'], 3, src_)
  expect(dst.cols.count.a).toBe(3)
  expect(dst === src_).toBe(false)
  expect(dst.cols === src_.cols).toBe(false)
  expect(dst.cols.count === src_.cols.count).toBe(false)
  expect(dst.cols.count.a === src_.cols.count.a).toBe(false)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
test('setIn / set the same value', (): void => {
  const src_ = R.clone(src)
  const dst = _.setIn(src_, 'cols.count.a', 1)
  expect(dst === src_).toBe(true) // ❗
  expect(dst.cols === src_.cols).toBe(true) // ❗
  expect(dst.cols.count === src_.cols.count).toBe(true) // ❗
  expect(dst.cols.count.a === src_.cols.count.a).toBe(true)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
test('assocPath / set the same value', (): void => {
  const src_ = R.clone(src)
  const dst = R.assocPath(['cols', 'count', 'a'], 1, src_)
  expect(dst === src_).toBe(false) // ❗
  expect(dst.cols === src_.cols).toBe(false) // ❗
  expect(dst.cols.count === src_.cols.count).toBe(false) // ❗
  expect(dst.cols.count.a === src_.cols.count.a).toBe(true)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
test('setIn with ramda', (): void => {
  const src_ = R.clone(src)
  const dst = _.setIn(src_, 'cols.count.a', 3)
  expect(dst.cols.count.a).toBe(3)
  expect(dst === src_).toBe(false)
  expect(dst.cols === src_.cols).toBe(false)
  expect(dst.cols.count === src_.cols.count).toBe(false)
  expect(dst.cols.count.a === src_.cols.count.a).toBe(false)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
test('setIn with ramda / set the same value', (): void => {
  const src_ = R.clone(src)
  const dst = _.setIn(src_, 'cols.count.a', 1)
  expect(dst === src_).toBe(true)
  expect(dst.cols === src_.cols).toBe(true)
  expect(dst.cols.count === src_.cols.count).toBe(true)
  expect(dst.cols.count.a === src_.cols.count.a).toBe(true)
  expect(dst.cols.id === src_.cols.id).toBe(true)
})
