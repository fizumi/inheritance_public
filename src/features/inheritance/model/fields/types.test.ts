import * as _ from './types'

test('defaultWebRow', () => {
  expect(_.defaultWebRow()).toEqual({
    isAlive: true,
    portionOfInheritance: '',
    deathDate: null,
    name: '',
    id: '',
  })
})
