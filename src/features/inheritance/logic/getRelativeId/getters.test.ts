import { pipe } from 'fp-ts/lib/function'
// import { Store } from './types'
import { setDeathDate } from '../../model/utils'
import { equalsIDs } from '../../shared'
import s from '../calc_inheritance.data.json'
import * as _ from './getters'

test('getChildrenIn getRelativeIDsFrom getChildIDs', (): void => {
  // person1
  expect(equalsIDs(_.getChildIDs(s)('1'))(['2', '7'])).toBe(true)
  expect(equalsIDs(_.getChildIDs(s)('2'))(['10h', '11h', '4', '5', '6'])).toBe(true)
  expect(equalsIDs(_.getChildIDs(s)('3'))(['4', '5', '6'])).toBe(true)
  expect(equalsIDs(_.getChildIDs(s)('4'))([])).toBe(true)
})
test('getChildIDsAtTheDate getFirstPriorityHeirsIDs', (): void => {
  // 注 getChildIDsAtTheDate は 死亡順序 を考慮しない
  const s1 = setDeathDate('1', 'D10')(s) // 1 は 'D10' に亡くなった
  expect(pipe(_.getChildIDsAtTheDate(s1, ['1', 'D10']), equalsIDs(['2', '7']))).toEqual(true)

  const s2 = setDeathDate('2', 'D11')(s1) // 2 は 1 の 後に亡くなった
  expect(pipe(_.getChildIDsAtTheDate(s2, ['1', 'D10']), equalsIDs(['2', '7']))).toEqual(true)

  const s3 = setDeathDate('2', 'D09')(s1) // 2 は 1 が亡くなる前に亡くなった
  expect(pipe(_.getChildIDsAtTheDate(s3, ['1', 'D10']), equalsIDs(['2', '7']))).toEqual(true)
  // expect(pipe(_.getFirstPriorityHeirsIDs(s3, ['1', 'D10']))).toEqual(['7'])

  const s4 = setDeathDate('7', 'D10')(s1) // 7 は 1 と同時に亡くなった
  expect(pipe(_.getChildIDsAtTheDate(s4, ['1', 'D10']), equalsIDs(['2', '7']))).toEqual(true)
  // expect(pipe(_.getFirstPriorityHeirsIDs(s4, ['1', 'D10']))).toEqual(['2'])

  const s5 = setDeathDate('7', 'D08')(s3) // 7 と 2 は 1 より前に亡くなった
  expect(pipe(_.getChildIDsAtTheDate(s5, ['1', 'D10']), equalsIDs(['2', '7']))).toEqual(true)
  // expect(pipe(_.getFirstPriorityHeirsIDs(s5, ['1', 'D10']))).toEqual([])
})
test('scanChildIDsAtTheDate', (): void => {
  expect(pipe(_.scanChildIDsAtTheDate(s, 'D10')(['1']), equalsIDs(['2', '7']))).toEqual(true)
  expect(
    pipe(_.scanChildIDsAtTheDate(s, 'D10')(['2', '3']), equalsIDs(['10h', '11h', '4', '5', '6']))
  ).toEqual(true)
  expect(pipe(_.scanChildIDsAtTheDate(s, 'D10')([]), equalsIDs([]))).toEqual(true)
})
test('getSiblingIDs', (): void => {
  expect(
    pipe(_.getSiblingIDsAtTheDate(s, ['4', 'D10']), equalsIDs(['10h', '11h', '5', '6']))
  ).toEqual(true)
  expect(pipe(_.getSiblingIDsAtTheDate(s, ['1', 'D10']), equalsIDs([]))).toEqual(true)
})
test('getFullSiblingIDsAtTheDate', (): void => {
  expect(pipe(_.getFullSiblingIDsAtTheDate(s, ['4', 'D10']), equalsIDs(['5', '6']))).toEqual(true)
  expect(pipe(_.getFullSiblingIDsAtTheDate(s, ['7', 'D10']), equalsIDs(['2']))).toEqual(true)
  expect(pipe(_.getFullSiblingIDsAtTheDate(s, ['1', 'D10']), equalsIDs([]))).toEqual(true)
})
test('getHalfSiblingIDs', (): void => {
  expect(pipe(_.getHalfSiblingIDsAtTheDate(s, ['4', 'D10']), equalsIDs(['10h', '11h']))).toEqual(
    true
  )
  expect(pipe(_.getHalfSiblingIDsAtTheDate(s, ['7', 'D10']), equalsIDs([]))).toEqual(true)
  expect(pipe(_.getHalfSiblingIDsAtTheDate(s, ['1', 'D10']), equalsIDs([]))).toEqual(true)
})
test('scanParentIDsAtTheDate', (): void => {
  expect(pipe(_.scanParentIDsAtTheDate(s, 'D10')(['4']), equalsIDs(['2', '3']))).toEqual(true)
  expect(pipe(_.scanParentIDsAtTheDate(s, 'D10')(['4', '5']), equalsIDs(['2', '3']))).toEqual(true)
  expect(pipe(_.scanParentIDsAtTheDate(s, 'D10')(['3']), equalsIDs([]))).toEqual(true)
})
test('getAliveSpouseIDsAtDeathDate', (): void => {
  expect(pipe(_.getAliveSpouseIDsAtDeathDate(s, ['2', 'D10']), equalsIDs(['3']))).toEqual(true)
  const s1 = setDeathDate('3', 'D10')(s) // 3 は 'D10' に亡くなった
  expect(pipe(_.getAliveSpouseIDsAtDeathDate(s1, ['2', 'D11']), equalsIDs([]))).toEqual(true)
  expect(pipe(_.getAliveSpouseIDsAtDeathDate(s1, ['2', 'D09']), equalsIDs(['3']))).toEqual(true)
})
test('getFirstPriorityHeirsIDs', (): void => {
  const s1 = setDeathDate('1', 'D10')(s) // 1 は 'D10' に亡くなった
  pipe(_.getFirstPriorityHeirsIDs(s1, ['1', 'D10']), (x) => expect(x).toEqual(['2', '7']))

  // 代襲
  const s2 = pipe(s1, setDeathDate('2', 'D09')) // 2 は相続前に亡くなっていた
  pipe(_.getFirstPriorityHeirsIDs(s2, ['1', 'D10']), (x) =>
    expect(x).toEqual([['10h', '11h', '4', '5', '6'], '7'])
  )

  // 子なしにつき代襲なし
  const s3 = pipe(s1, setDeathDate('2', 'D09'), setDeathDate('7', 'D09')) // 2, 7 は相続前に亡くなっていた
  pipe(_.getFirstPriorityHeirsIDs(s3, ['1', 'D10']), (x) =>
    expect(x).toEqual([['10h', '11h', '4', '5', '6'], []])
  )

  // 再代襲 + 子なしにつき代襲なし
  const s4 = pipe(
    s1,
    setDeathDate('2', 'D09'),
    setDeathDate('7', 'D09'),
    setDeathDate('11h', 'D09'),
    setDeathDate('6', 'D09')
  ) // 2, 7, 11h, 6 は相続前に亡くなっていた
  pipe(_.getFirstPriorityHeirsIDs(s4, ['1', 'D10']), (x) =>
    expect(x).toEqual([['10h', [], '4', '5', ['8']], []])
  )
})
test('getSecondPriorityHeirsIDs', (): void => {
  // 両親
  pipe(_.getSecondPriorityHeirsIDs(s, ['4', 'D10']), (x) => expect(x).toEqual(['2', '3']))
  // 片親
  const s1 = setDeathDate('2', 'D09')(s)
  pipe(_.getSecondPriorityHeirsIDs(s1, ['4', 'D10']), (x) => expect(x).toEqual(['3']))
  // 祖母
  const s2 = setDeathDate('3', 'D09')(s1)
  pipe(_.getSecondPriorityHeirsIDs(s2, ['4', 'D10']), (x) => expect(x).toEqual(['0', '1']))
  const s3 = setDeathDate('1', 'D09')(s2)
  pipe(_.getSecondPriorityHeirsIDs(s3, ['4', 'D10']), (x) => expect(x).toEqual(['0']))
  const s4 = setDeathDate('0', 'D09')(s3)
  pipe(_.getSecondPriorityHeirsIDs(s4, ['4', 'D10']), (x) => expect(x).toEqual([]))
  pipe(_.getSecondPriorityHeirsIDs(s, ['1', 'D10']), (x) => expect(x).toEqual([]))
})
test('getThirdPriorityAllHeirsIDs', (): void => {
  pipe(_.getThirdPriorityAllHeirsIDs(s, ['4', 'D10']), (x) =>
    expect(x).toEqual(['10h', '11h', '5', '6'])
  )
})
test('getThirdPriorityFullHeirsIDs getThirdPriorityHeirsIDsFrom', (): void => {
  // 兄弟
  pipe(_.getThirdPriorityFullHeirsIDs(s, ['4', 'D10']), (x) => expect(x).toEqual(['5', '6']))
  // expect(_.getThirdPriorityFullHeirsIDs(psBigger)('4')).toEqual(['5', '6'])
  // 代襲
  const s1 = pipe(s, setDeathDate('5', 'D09'), setDeathDate('6', 'D09'))
  pipe(_.getThirdPriorityFullHeirsIDs(s1, ['4', 'D10']), (x) => expect(x).toEqual([[], ['8']]))
  // expect(_.getThirdPriorityFullHeirsIDs(dieSIn(psBigger)(['5', '6']))('4')).toEqual([[], ['8']])
  // 兄弟
  pipe(_.getThirdPriorityFullHeirsIDs(s, ['7', 'D10']), (x) => expect(x).toEqual(['2']))
  // expect(_.getThirdPriorityFullHeirsIDs(psBigger)('7')).toEqual(['2'])
  // 代襲
  const s2 = pipe(s, setDeathDate('2', 'D09'))
  pipe(_.getThirdPriorityFullHeirsIDs(s2, ['7', 'D10']), (x) =>
    expect(x).toEqual([['10h', '11h', '4', '5', '6']])
  )
  // expect(_.getThirdPriorityFullHeirsIDs(dieSIn(psBigger)(['2']))('7')).toEqual([
  //   ['4', '5', '6', '10h', '11h'],
  // ])
  // 再代襲なし
  const s3 = pipe(s2, setDeathDate('6', 'D09'))
  pipe(_.getThirdPriorityFullHeirsIDs(s3, ['7', 'D10']), (x) =>
    expect(x).toEqual([['10h', '11h', '4', '5']])
  )
  // expect(_.getThirdPriorityFullHeirsIDs(dieSIn(psBigger)(['2', '6']))('7')).toEqual([
  //   ['4', '5', '10h', '11h'],
  // ])
})
test('getAnotherThirdPriorityHeirsIDs', (): void => {
  pipe(_.getThirdPriorityHalfHeirsIDs(s, ['4', 'D10']), (x) => expect(x).toEqual(['10h', '11h']))
  // expect(_.getThirdPriorityHalfHeirsIDs(psBigger)('4')).toEqual(['10h', '11h'])
  /* ↑↓ この段階では相続順位が上の者がいようがいまいが関係ない（getBloodRelativeHeirでは関係する） */
  const s1 = pipe(s, setDeathDate('1', 'D09'), setDeathDate('2', 'D09'), setDeathDate('3', 'D09'))
  pipe(_.getThirdPriorityHalfHeirsIDs(s1, ['4', 'D10']), (x) => expect(x).toEqual(['10h', '11h']))
  // expect(_.getThirdPriorityHalfHeirsIDs(dieSIn(psBigger)(['1', '2', '3']))('4')).toEqual([
  //   '10h',
  //   '11h',
  // ])
})
