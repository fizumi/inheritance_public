import * as _ from './utils'
// import * as R from 'ramda'

test('createIdArray2Names', (): void => {
  const p = _.newPerson('sample')
  expect(typeof p.id === 'string').toEqual(true)
  expect(p.name).toEqual('sample')
  // expect(p.birthDate).toEqual(null)
  expect(p.deathDate).toEqual(null)
  expect(p.portionOfInheritance).toEqual('')
  expect(p.isAlive).toEqual(true)
})
