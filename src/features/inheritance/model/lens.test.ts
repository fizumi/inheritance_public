import * as lens from './lens'
import * as R from 'ramda'
import * as selector from './selector'

test('marriageL', (): void => {
  expect(R.view(lens.marriage, { rels: { marriage: 1 } } as any)).toBe(1)
})
test('selector', (): void => {
  expect(selector.marriage({ rels: { marriage: 1 } } as any)).toBe(1)
})
