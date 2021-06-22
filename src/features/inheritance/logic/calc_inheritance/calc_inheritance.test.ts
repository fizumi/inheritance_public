import { pipe } from 'fp-ts/lib/function'
import * as R from 'ramda'
import * as lens from '../../model/lens'
import { setDeathDate as sDD, setSameDeathDate as sSDD } from '../../model/utils'
import s from '../calc_inheritance.data.json'
import * as _ from './calc_inheritance'

test('getBloodRelativeHeir getRelariveHeirFrom', (): void => {
  pipe(_.getBloodRelativeHeir(s, ['2', 'D10']), (x) =>
    expect(x).toEqual({
      _tag: 'descendants',
      descendants: ['10h', '11h', '4', '5', '6'],
    })
  )
  const noDescendants = sSDD('D09', ['10h', '11h', '4', '5', '6', '8'])(s)
  pipe(_.getBloodRelativeHeir(noDescendants, ['2', 'D10']), (x) =>
    expect(x).toEqual({
      _tag: 'ancestors',
      ancestors: ['0', '1'],
    })
  )
  const noAncestors = sSDD('D09', ['0', '1'])(noDescendants)
  pipe(_.getBloodRelativeHeir(noAncestors, ['2', 'D10']), (x) =>
    expect(x).toEqual({
      _tag: 'siblings',
      siblings: ['7'],
    })
  )
  const noHeirs = sSDD('D09', ['7'])(noAncestors)
  pipe(_.getBloodRelativeHeir(noHeirs, ['2', 'D10']), (x) => expect(x).toEqual({}))
})
test('getSpouseHeir getRelariveHeirFrom', (): void => {
  pipe(_.getSpouseHeir(s, ['2', 'D10']), (x) =>
    expect(x).toEqual({
      _tag: 'spouses',
      spouses: ['3'],
    })
  )
  expect(_.getSpouseHeir(sDD('3', 'D09')(s), ['2', 'D10'])).toEqual({})
})
test('getHeirs', (): void => {
  expect(_.getHeirs(['2', 'D10'])(s)).toEqual({
    _tag: 'descendants',
    spouses: ['3'],
    descendants: ['10h', '11h', '4', '5', '6'],
  })
  // expect(getHeirs(psBigger)('2')).toEqual({
  //   _tag: 'descendants',
  //   spouses: ['3'],
  //   descendants: ['11h', '10h', '4', '5', '6'],
  // })
  const noHeirs = sSDD('D09', ['11h', '10h', '0', '1', '3', '4', '5', '6', '7', '8'])(s)
  expect(_.getHeirs(['2', 'D10'])(noHeirs)).toEqual({})
  // expect(
  //   getHeirs(dieSIn(psBigger)(['11h', '10h', '1', '3', '4', '5', '6', '7', '8']))('2')
  // ).toEqual({})
  expect(_.getHeirs(['7', 'D10'])(sSDD('D09', ['0', '1', '2', '6'])(s))).toEqual({
    _tag: 'siblings',
    siblings: [['10h', '11h', '4', '5']], // '2' の子 が代襲
    // siblings: ['11h', '10h', '4', '5'], [warning] this is mistake
  })
  // expect(getHeirs(dieSIn(psBigger)(['1', '2', '6']))('7')).toEqual({
  //   _tag: 'siblings',
  //   siblings: [['11h', '10h', '4', '5']],
  //   // siblings: ['11h', '10h', '4', '5'], [warning] this is mistake
  // })
})
test('evolveIntoHeirsWithStatutoryShare', (): void => {
  expect(
    _.evolveIntoHeirsWithStatutoryShare(
      ['spouses', '1/2'],
      ['descendants', '1/2']
    )({ _tag: 'descendants', spouses: ['s'], descendants: ['d'] })
  ).toEqual({
    _tag: 'descendants',
    spouses: [['s'], '1/2'],
    descendants: [['d'], '1/2'],
  })
  expect(
    _.evolveIntoHeirsWithStatutoryShare(
      ['spouses', '2/3'],
      ['siblings', '1/3']
    )({
      _tag: 'descendants',
      spouses: ['s'],
      descendants: ['d'],
    })
  ).toEqual({
    _tag: 'descendants',
    spouses: [['s'], '2/3'],
    descendants: ['d'],
  })
  // if no args passed then ...
  expect(
    _.evolveIntoHeirsWithStatutoryShare()({
      _tag: 'descendants',
      spouses: ['s'],
      descendants: ['d'],
    })
  ).toEqual({
    _tag: 'descendants',
    spouses: ['s'],
    descendants: ['d'],
  })
})

// conditionalSetStatutoryShare
test('conditionalSetStatutoryShare', (): void => {
  expect(
    _.convertIntoIDsAndStatutorySharePair({
      _tag: 'descendants',
      spouses: ['s'],
      descendants: ['d'],
    })
  ).toEqual({
    _tag: 'descendants',
    spouses: [['s'], '1/2'],
    descendants: [['d'], '1/2'],
  })
  expect(
    _.convertIntoIDsAndStatutorySharePair({
      _tag: 'spouses',
      spouses: ['s'],
    })
  ).toEqual({
    _tag: 'spouses',
    spouses: [['s'], '1/1'],
  })
  // expect(
  //   _.convertIntoIDsAndStatutorySharePair({
  //     test: ['test'],
  //   })
  // ) // ts(2345)
})
test('hasSiblings', (): void => {
  expect(_.hasSiblings({ _tag: 'descendants', spouses: ['s'], descendants: ['d'] })).toBe(false)
  expect(_.hasSiblings({ _tag: 'siblings', spouses: ['s'], siblings: ['sibl'] })).toBe(true)
  expect(_.hasSiblings({ _tag: 'siblings', siblings: { any: 'accept any value' } })).toBe(true)
  expect(_.hasSiblings({})).toBe(false)
})
test('deleteSiblings', (): void => {
  // expect(deleteSiblings({ spouses: ['s'], descendants: ['d'] })) // ts(2345)
  expect(_.deleteSiblings({ spouses: ['s'], siblings: ['sibl'] })).toEqual({
    spouses: ['s'],
  })
  expect(_.deleteSiblings({ siblings: { any: 'accept any value' } })).toEqual({})
  // expect(deleteSiblings({})) // ts(2345)
})
test('subdivideSiblings', (): void => {
  expect(
    _.subdivideSiblings(s, ['3', 'D10'])({
      _tag: 'descendants',
      spouses: [['s'], '1/1'],
      descendants: [['sibl'], '1/1'],
    })
  ).toEqual({
    _tag: 'descendants',
    spouses: [['s'], '1/1'],
    descendants: [['sibl'], '1/1'],
  })
  expect(
    _.subdivideSiblings(s, ['4', 'D10'])({
      _tag: 'siblings',
      spouses: [['s'], '1/4'],
      siblings: [['subdivideSiblingsが改めてデータを取得するので、ここは何でも良い'], '1/4'],
    })
  ).toEqual({
    _tag: 'siblings',
    spouses: [['s'], '1/4'],
    fullSiblings: [['5', '6'], '1/6'] /* '4/24' */,
    halfSiblings: [['10h', '11h'], '1/12'] /* '2/24' */,
  })
  expect(
    _.subdivideSiblings(sSDD('D09', ['1', '2', '6'])(s), ['7', 'D10'])({
      _tag: 'siblings',
      siblings: [[['11h', '10h', '4', '5']], '1/1'],
    })
  ).toEqual({
    _tag: 'siblings',
    siblings: [[['11h', '10h', '4', '5']], '1/1'],
  })
})

test('divideByPersonCount', (): void => {
  expect(_.divideByPersonCount([['2', '7'], '1/2'])).toEqual([
    ['2', '1/4'],
    ['7', '1/4'],
  ])
  expect(_.divideByPersonCount([[['4', '5', '6'], '7'], '1/2'])).toEqual([
    ['4', '1/12'],
    ['5', '1/12'],
    ['6', '1/12'],
    ['7', '1/4'],
  ])
  expect(_.divideByPersonCount([['4', ['5', ['8']]], '1/2'])).toEqual([
    ['4', '1/4'],
    ['5', '1/8'],
    ['8', '1/8'],
  ])
  expect(_.divideByPersonCount([['4', ['5', '6', ['7', '8']]], '1/2'])).toEqual([
    ['4', '1/4'],
    ['5', '1/12'],
    ['6', '1/12'],
    ['7', '1/24'],
    ['8', '1/24'],
  ])
})
test('getIDsAndShare', (): void => {
  expect(
    _.getIDsAndShare({
      _tag: 'siblings',
      spouses: [['s'], '1/4'],
      fullSiblings: [['5', '6'], '1/6'] /* '4/24' */,
      halfSiblings: [['11h', '10h'], '1/12'] /* '2/24' */,
    })
  ).toEqual([
    [['s'], '1/4'],
    [['5', '6'], '1/6'],
    [['11h', '10h'], '1/12'],
  ])
})
test('flattenShare', (): void => {
  expect(
    _.flattenShare([
      [['s'], '1/4'],
      [['5', '6'], '1/6'],
      [['11h', '10h'], '1/12'],
    ])
  ).toEqual([
    ['s', '1/4'],
    ['5', '1/12'],
    ['6', '1/12'],
    ['11h', '1/24'],
    ['10h', '1/24'],
  ])
})
test('ensureHeirsDesign ensureEachIDsMustNotHaveEmptyArray ensureEachHeirHasSomeIDs', (): void => {
  expect(() =>
    _.ensureHeirsDesign(
      _.ensureEachHeirHasSomeIDs,
      _.ensureEachIDsMustNotHaveEmptyArray
    )([[[], '1/1']])
  ).toThrowError('each "Heir" must have some IDs')
  expect(() =>
    _.ensureHeirsDesign(
      _.ensureEachHeirHasSomeIDs,
      _.ensureEachIDsMustNotHaveEmptyArray
    )([[[[[], '10h', '4', '5', [[['8']]]], []], '1/1']])
  ).toThrowError('each IDs must be applyed "deleteEmptyRecursively" before adding "Heirs"')
})
test('ensureSharesSumIsOne', (): void => {
  expect(() =>
    _.ensureSharesSumIsOne([
      ['', '1/3'],
      ['', '1/2'],
    ])
  ).toThrowError('sum of the shares derived from "Heirs" is 1')
})
test('getHeirsAndShareArray', (): void => {
  expect(
    _.getHeirIdAndSharePairArray(['1', 'D10'])(sSDD('D09', ['0', '2', '7', '11h', '6'])(s))
  ).toEqual([
    ['10h', '1/4'],
    ['4', '1/4'],
    ['5', '1/4'],
    ['8', '1/4'],
  ])
  expect(_.getHeirIdAndSharePairArray(['4', 'D10'])(sSDD('D09', ['0', '2', '3'])(s))).toEqual([
    ['1', '1/1'],
  ])
  expect(_.getHeirIdAndSharePairArray(['7', 'D10'])(sSDD('D09', ['0', '1', '2', '6'])(s))).toEqual([
    ['10h', '1/4'],
    ['11h', '1/4'],
    ['4', '1/4'],
    ['5', '1/4'],
  ])
})
test('setSharesInto', (): void => {
  const s1 = _.setSharesInto(s)([
    ['4', '1/4'],
    ['5', '1/4'],
  ])
  expect(R.view(lens.portionOfInheritance('4'), s1)).toEqual('1/4')
  expect(R.view(lens.portionOfInheritance('5'), s1)).toEqual('1/4')
  expect(R.view(lens.portionOfInheritance('6'), s1)).toEqual('')
  const s2 = _.setSharesInto(s)([])
  expect(R.view(lens.portionOfInheritance('4'), s2)).toEqual('')
})
test('distributeShare', (): void => {
  expect(_.distributeShare('1/2')([])).toEqual([])
  expect(
    _.distributeShare('1/2')([
      ['4', '1/3'],
      ['5', '1/4'],
    ])
  ).toEqual([
    ['4', '1/6'],
    ['5', '1/8'],
  ])
})
test('popHeritage', (): void => {
  const [heritage, s1] = _.popHeritage(s, '2')
  expect(R.view(lens.portionOfInheritance('2'), s1)).toEqual('0')
  expect(heritage).toEqual('1')
})
test('distributeHeritage', (): void => {
  const s1 = _.distributeHeritage('2', 'D10')(s)
  expect(R.view(lens.portionOfInheritance('2'), s1)).toEqual('0')
  expect(R.view(lens.portionOfInheritance('3'), s1)).toEqual('1/2')
  expect(R.view(lens.portionOfInheritance('4'), s1)).toEqual('1/10')
})
test('inharitance', (): void => {
  const s1 = _.inheritance(s, ['2', 'D10'])
  expect(R.view(lens.isAlive('2'), s1)).toEqual(false)
  expect(R.view(lens.portionOfInheritance('2'), s1)).toEqual('0')
  expect(R.view(lens.isAlive('3'), s1)).toEqual(true)
  expect(R.view(lens.portionOfInheritance('3'), s1)).toEqual('1/2')
  expect(R.view(lens.isAlive('4'), s1)).toEqual(true)
  expect(R.view(lens.portionOfInheritance('4'), s1)).toEqual('1/10')
})

// xtest('inharitance', (): void => {
//   console.log(getNthSheetDataAsJsonInNode(path.join(__dirname, '/inheritance-test.xlsm'), ''))
// })
