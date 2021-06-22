import { pipe } from 'fp-ts/function'
import * as R from 'ramda'
import * as yup from 'yup'
import { either as E } from 'fp-ts'
import { toSyncValidator } from 'src/utils/fp/common'
import * as _ from './beforeLoad'
import data from './json-data.json'

test('cols.id', (): void => {
  pipe(toSyncValidator()(yup.reach(_.formikValuesSchema, 'cols.id'))(['1', '1']), (x) => {
    if (E.isLeft(x)) {
      expect(Array.isArray(x.left)).toBe(true)
      expect(x.left[0].includes('has dupulicate ID.')).toBe(true)
    }
  })
  pipe(toSyncValidator()(yup.reach(_.formikValuesSchema, 'cols.id'))(['1', '2']), (x) =>
    expect(E.isRight(x)).toBe(true)
  )
})

test('safeValidateSyncBeforeLoad', (): void => {
  pipe(
    data,
    // R.tap(console.log),
    _.safeValidateSyncBeforeLoad,
    E.map((x) => expect(x).toEqual(data)),
    E.mapLeft(R.tap(console.warn))
  )
})
