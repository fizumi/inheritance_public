/*
    ある程度アプリケーションの規模が大きくなってくると依存関係が複雑になり, module (file と同義) 同士の循環参照が生じてしてしまいかねない.
    そこで, 依存関係を整理するためのルールが必要となる.

    <-: 依存

    common <- shared <- model <- logic <- validation/components
                         ^- util

    common:
      web server 両方で使用できる.
      抽象度・再利用性が最も高い ( ライブラリレベルの抽象度 ).

    shared:
      同一階層以下にある module で共通して利用する.
      common と model の橋渡し役. ( common に記載する程の抽象度はないが, feature folder 配下で再利用できるもの)

    model:
      ある機能 (feature) を実現するために用意するデータ構造とそのデータ構造に依存する（付随する）関数 (CRUDなど).
      model に付随するビジネスロジックを含んでも良い.

      util:
        一般に, util は 同一階層以下にある model (データ型) を操作する関数を意味するものとする.
        feature/XXX 直下においては, model/index レベル (各種 model 群を保存する store ) のデータ構造を操作する関数.

    logic:
      ある機能 (feature) を実現する関数
*/
// なぜか exoprt が上手く行かない場合があるので，廃止
export { calcInheritance } from './logic/calc_inheritance'
export type { ID } from './shared/types'
export * from './model/date'
// export * from './getRelativeId'
// export * from './model' // なぜか上手くいかない
