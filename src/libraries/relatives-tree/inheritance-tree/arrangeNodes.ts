import * as R from 'ramda'
import { readonlyArray as RA, function as F } from 'fp-ts'
import Store from '../store'
import { ArrangedNode } from '../types'
import { addIntoDebugObj } from '../calcTree'

const PARENT_GENE = -1
const ROOT_GENE = 0
const CHILD_GENE = 1

const HEAD = 0

const setAncestor = (store: Store, self: ArrangedNode) => {
  store.sortIDs(self.parentIDs).forEach((parentID) => {
    const nextGene = self.generation - 1
    const nextIndex = R.max(store.getMaxIndex('<', self.generation) + 1, self.index)
    const parent = store.getNode(parentID)
    console.log(`insert from ${self.name} as parent`)
    const arranged = store.insertArrangedNode(nextGene, nextIndex, parent, { parentOf: self })
    self.hasPanent = true
    if (arranged) {
      setAncestor(store, arranged)
    }
  })
}

const setDescendant = (store: Store, self: ArrangedNode) => {
  store.sortIDs(self.childIDs).forEach((childID) => {
    const nextGene = self.generation + 1
    const nextIndex = R.max(store.getMaxIndex('>', self.generation) + 1, self.index)
    const child = store.getNode(childID)
    console.log(`insert from ${self.name} as child`)
    const arranged = store.insertArrangedNode(nextGene, nextIndex, child, { childOf: self })
    // self.hasPanent = true
    if (arranged) {
      setDescendant(store, arranged)
    }
  })
}

const setSpouse = (store: Store, self: ArrangedNode) => {
  // TODO root の死亡日に spouse だった者が最も左 -> 婚姻日が遅ければ遅いほど左側に配置する
  self.spouseIDs.forEach((spouseID) => {
    const nextIndex = store.getMaxIndex('==', self.generation) + 1
    const spouse = store.getNode(spouseID)
    console.log(`insert from ${self.name} as spouse`)
    store.insertArrangedNode(self.generation, nextIndex, spouse, { spouseOf: self })
  })
}

export default function arrangedNodes(store: Store): Store {
  console.log(`insert root , first of all`)
  const root = store.insertArrangedNode(ROOT_GENE, HEAD, store.rootNode, 'root')
  setAncestor(store, root)
  setSpouse(store, root)
  setDescendant(store, root)

  return store
}
