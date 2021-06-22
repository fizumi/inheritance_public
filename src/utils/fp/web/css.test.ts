import * as _ from './css'

test('getGridTemplateColumns gridTemplateColumns2array', (): void => {
  const css =
    'grid-template-columns:auto auto minmax(100px, 1fr) 2fr 2fr 180px 100px 90px auto 0px;label:HeirsForm;'

  const gridTemplateColumns = _.getGridTemplateColumns(css)

  expect(gridTemplateColumns).toBe('auto auto minmax(100px, 1fr) 2fr 2fr 180px 100px 90px auto 0px')

  if (gridTemplateColumns) {
    expect(_.gridTemplateColumns2array(gridTemplateColumns).length).toBe(10)
  }

  expect(_.unsafeGetGridTemplateColumnsCount(css)).toBe(10)
})
