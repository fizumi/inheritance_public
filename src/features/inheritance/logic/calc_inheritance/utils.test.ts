import * as _ from './utils'

test('has allHas', (): void => {
  // expect(has('spouses')({ spouses: ['s'] })).toBe(true)
  expect(_.allHas(['spouses'])({ _tag: 'spouses', spouses: ['s'] })).toBe(true)
  expect(_.allHas(['spouses'])({ _tag: 'descendants', descendants: ['s'] })).toBe(false)
  expect(
    _.allHas(['spouses', 'descendants'])({
      _tag: 'descendants',
      spouses: ['s'],
      descendants: ['d'],
    })
  ).toBe(true)
  expect(_.allHas(['spouses', 'descendants'])({ _tag: 'spouses', spouses: ['s'] })).toBe(false)
  expect(_.allHas([])({ _tag: 'spouses', spouses: ['s'] })).toBe(true) // [warning]
  // expect(anyHas([])({})).toBe(false) // ts(2304)
})
