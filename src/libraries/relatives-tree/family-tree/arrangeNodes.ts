import * as R from 'ramda'
import { readonlyArray as RA, function as F } from 'fp-ts'
import Store from '../store'
import { ArrangedNode } from '../types'

const PARENT_GENE = -1
const ROOT_GENE = 0
const CHILD_GENE = 1

const HEAD = 0

const setAncestor = (store: Store, self: ArrangedNode) => {
  self.parentIDs.forEach((parentID) => {
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

export default function arrangedNodes(store: Store): Store {
  // recursive helper function
  const arrangedNode = (store: Store, self: ArrangedNode, otherParentIDs?: string[]) => {
    console.log(`[arrangedNode] ${self.name}`)

    if (self.generation === PARENT_GENE) {
      setAncestor(store, self)
    }

    // root の甥姪まで表示
    if (self.generation === CHILD_GENE) {
      // 自分の親を兄弟に持つ => root は おじ・おば
      if (R.intersection(self.parentIDs, store.rootNode.siblingIDs).length >= 1) return
    }

    // TODO partner の位置は本当に今のままでいいのか？

    const arrangedNodeIDs = store.getArrangedNodes(self.generation).map(R.prop('id'))

    // 「共通の子を有する者(partner)と, その者との共通の子供達(children)」の配列
    let partnerAndChildrens = F.pipe(
      store.nodesThatHave(self.childIDs, 'childIDs'), // 指定した子供を持つ者達
      RA.filter((n) => !arrangedNodeIDs.includes(n.id)), // 既に配置済みの node 以外（self も除かれる）
      RA.map((n) => [n.id, R.intersection(n.childIDs, self.childIDs)] as const)
    )

    // TODO 既に next gene に子がいた場合, 特別なコネクターを作成する（既存の水平コネクターと重複しないコネクター）
    // TODO そもそも 同じ子を持つ者同士が水平コネクターで繋げられるのが間違いでは？ コネクターで結ばれるべきは 親子関係 と 配偶者関係のみ
    //    重婚の場合だけ, 水平コネクターを複数用意する
    if (partnerAndChildrens.length === 0) return

    // root は 先頭に配置する //TODO 婚姻日 の入力を許容したら, 婚姻日が遅い順に index を小さくする
    if (self.arrangedReason === 'first root parent') {
      const indexIncludingRootAsChild = partnerAndChildrens.findIndex(([_p, cs]) =>
        cs.includes(store.rootNode.id)
      )
      partnerAndChildrens = F.pipe(
        partnerAndChildrens,
        R.move(indexIncludingRootAsChild, HEAD),
        R.over(R.lensPath([HEAD, 1]), store.moveRootIDToHead)
      )
    }

    // addIntoDebugObj(`${self.name}'s`)(partnerAndChildrens)
    partnerAndChildrens.forEach((partnerAndChildren, i) => {
      const number = i + 1
      const [partnerID, childIDs] = partnerAndChildren
      const arrangedChildren = [] as ArrangedNode[]
      const partner = store.getNode(partnerID)

      // 子
      childIDs.forEach((childID) => {
        // 子の挿入
        const nextGene = self.generation + 1
        const nextIndex = R.max(
          store.getMaxIndex(self.arangePartner ? '>=' : '>', self.generation) + 1,
          self.index
        )
        const child = store.getNode(childID)
        if (store.notArrangedIn(nextGene)(childID)) {
          console.log(`insert ${child.name} from ${self.name} as child`)
          const arrangedChild = store.insertArrangedNode(nextGene, nextIndex, child, {
            childOf: self,
          })
          // 子について, recursive call
          arrangedNode(store, arrangedChild)
          // 配置した子について補足情報を追加
          if (arrangedChild) {
            arrangedChildren.push(arrangedChild)
            arrangedChild.hasPanent = true
          }
        }
      })
      console.log('partner1', partner.name, partner)

      // self と共通の子を有する者
      const nextIndex = R.max(
        store.getMaxIndex(self.generation === PARENT_GENE ? 'all' : '>=', self.generation),
        store.getMaxIndex('==', self.generation) + 1
      )
      console.log(`insert ${partner.name} from ${self.name} as partner`)
      const arrangedPartner = store.insertArrangedNode(self.generation, nextIndex, partner, {
        partnerOf: self,
      })

      // 補足情報追加
      if (arrangedPartner) {
        arrangedPartner.partner = self
        arrangedPartner.commonChildren = arrangedChildren
        arrangedPartner.numberOfPartner = number
        if (number >= 2) {
          const aNodes = store.getArrangedNodes(self.generation)
          arrangedPartner.beforePartner = aNodes[aNodes.length - 2] // 最後から２番目のArrangedNode = 自分より前のパートナー
        }
      }
      self.arangePartner = true

      if (self.generation === PARENT_GENE) {
        const otherParentID = otherParentIDs?.pop()
        if (otherParentID) {
          const arrangedParent = store.getArangedNodeByID(self.generation, otherParentID)
          if (arrangedParent) {
            arrangedNode(store, arrangedParent, otherParentIDs)
          } else {
            console.error('未検討のロジック')
            const maxPlusOne = store.getMaxIndex('all', self.generation) + 1
            const arranged = store.insertArrangedNode(
              PARENT_GENE,
              maxPlusOne,
              store.getNode(otherParentID)
            )
            arrangedNode(store, arranged, otherParentIDs)
          }
        }
      }
    })
  }

  console.log(`insert from root`, { store })
  if (store.rootNode.parentIDs.length > 0) {
    const [zeroIndexParentID, ...otherParentIDs] = store.rootNode.parentIDs
    const arrangedFstParent = store.insertArrangedNode(
      PARENT_GENE,
      HEAD,
      store.getNode(zeroIndexParentID),
      'first root parent'
    )
    arrangedNode(store, arrangedFstParent, otherParentIDs)
  } else {
    arrangedNode(store, store.insertArrangedNode(ROOT_GENE, HEAD, store.rootNode, 'root'))
  }

  return store
}
