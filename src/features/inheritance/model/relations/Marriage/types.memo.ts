import { ID } from '../../../shared/types'
import { Marriage } from '../../relation'

/*
  Marriages2 を採用
*/

/*
  問題
  export type Marriages = readonly Marriage[]
  だと, Performance が悪いのでは？
  現状 Autocomplete(n) は render 毎に O(n) のコストがかかっている
  (Marriage n 個 の走査 を n 個の Autocomplete で行っている)
*/

// type RelID = ID
// type ID2RelIDs = Record<ID, RelID[]>
// type Marriages1 = Record<RelID, Marriage>

/*
    create

  1. { [RelID]: Marriage } を作成, Marriages に assoc で追加
  2. Marriage.ids を走査
  2.1 id2RelIds[id].push(RelID)


    read

  - メリット: 速い O(1) * O(1)
  1. id2RelIds[id].map(relID => relID2M[relID])


    update

  1.


    reject (特定の id を含む type を全て削除)

  1. id2RelIds[id].map(relID => delete relID2M[relID])
  2. delete id2RelIds[id]

    delete

  1.
*/

// ---

// type RelID = [ID,ID].sort().join()
// type Marriages2 = Record<RelID, Marriage>

/*
  - メリット: 速い
*/
