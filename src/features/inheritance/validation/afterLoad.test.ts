import { pipe } from 'fp-ts/function'
import * as R from 'ramda'
import { toSyncValidator } from 'src/utils/fp/common'
import { key, IP } from 'src/features/inheritance/model'
import * as _ from './afterLoad'

test('formikFieldValidators', (): void => {
  pipe(
    {
      [key.id]: 1,
      [key.name]: 2,
      [key.deathDate]: 3,
      [key.portionOfInheritance]: null,
      [key.isAlive]: '',
    },
    R.evolve(_.messageEmitterRecord),
    console.log
  )
})

test('ParentSchema', (): void => {
  pipe(
    {
      type: IP.typeDict.養親子,
      startDate: null,
      endDate: null,
    },
    toSyncValidator()(_.isParentSchema),
    console.log
  )
  pipe(
    {
      type: IP.typeDict.実親子,
      startDate: null,
      endDate: null,
    },
    toSyncValidator()(_.isParentSchema),
    console.log
  )
})
