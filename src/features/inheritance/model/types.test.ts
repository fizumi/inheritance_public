import * as _ from './index'

test('key', (): void => {
  expect(_.key).toEqual({
    id: 'id',
    name: 'name',
    deathDate: 'deathDate',
    portionOfInheritance: 'portionOfInheritance',
    isAlive: 'isAlive',
    isParent: 'isParent',
    jointAdoption: 'jointAdoption',
    marriage: 'marriage',
    pseudoParents: 'pseudoParents',
    pseudoSpouses: 'pseudoSpouses',
  })
})
