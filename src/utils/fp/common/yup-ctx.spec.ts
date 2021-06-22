import * as yup from 'yup'
import { contextPath, createContextForReference } from 'src/utils/fp/common/yup'

const objSchema = yup.object({
  startDate: yup.mixed().when([contextPath, 'endDate'], ((
    context: any,
    endDate: any,
    schema: any
  ) => {
    if (context == null) throw new Error('you must provide context.')

    console.log('context:', context) // context: { a: 'start', b: 'end' }
    console.log('endDate:', endDate) // endDate: 11
    return schema
  }) as any),
  endDate: yup.string(),
})

const context = { a: 'start', b: 'end' }
const data = { startDate: '10', endDate: '11' }

test('context', (): void => {
  expect(objSchema.validateSync(data, { context: createContextForReference(context) })).toEqual(
    data
  )
})
