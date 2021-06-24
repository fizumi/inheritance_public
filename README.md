# 相続自動計算

[Web サイトはこちら](https://inheritance.vercel.app/)

※ PCでの操作を前提とした業務用アプリケーションとして作成しているため、**スマートフォン等は未対応です**。  
※ 認証機能やドキュメント作成、テストの拡充、レスポンシブ対応等、まだやり残している部分は多いです。

## アプリケーション概要

相続が発生した場合に、誰が何％の財産を相続するのかを計算する必要があります。
一つひとつの相続計算は簡単でも、百人以上が相続人候補となるケースでは、大変な計算になります。
この計算業務をサポートする Web サービスは調査した限りでは存在しないため、作成を試みています。

## 主要機能一覧

### 家系図自動生成機能

![家系図描画機能](public/images/4-家系図描画機能.gif)

[react-family-tree](https://sanichkotikov.github.io/react-family-tree-example/) をヒントに自作（[src\libraries\relatives-tree](https://github.com/fizumi/inheritance_public/tree/main/src/libraries/relatives-tree)）。

### 相続持ち分計算機能

![相続持ち分計算機能](public/images/10-相続持ち分計算機能.gif)

家族法の教科書を元にゼロから自作。

### Redo/Undo 機能

![RedoUndo機能](public/images/6-RedoUndo機能.gif)

[formik](https://formik.org/docs/overview) と組み合わせて使用できる custom hook（[useHistory.ts](src/utils/react/hooks/useHistory.ts)）を自作。

### バリデーション機能

![バリデーション機能](public/images/8-バリデーション.gif)

[yup](https://github.com/jquense/yup) を利用。

### その他の主要機能

- [主要機能１](README/主要機能１.md)
- [主要機能２](README/主要機能２.md)

### その他機能

#### 入力制限

「持ち分」列には、分数を表す文字列以外入力することができないように制御。（[rifm](https://github.com/realadvisor/rifm) を修正したものを利用）

#### 入力済みデータの存在場所を分かりやすくする工夫

入力データの表示（[Chip](https://next--material-ui.netlify.app/components/chips/#main-content)）をホバーすると、他の場所に存在する同一内容の Chip を強調表示する機能。
（[react-hook-form と同一のオブザーバ・パターン](https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/Subject.ts)を利用して不要な再レンダリングを最小限に抑えています。）

## 使用技術一覧

| 項目                           | 利用 Library                        | 採用理由等                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI                             | react                               | [ユーザー数の多さ](https://www.npmtrends.com/angular-vs-react-vs-vue)と、開発元（facebook）の信頼性から。JavaScript で直接 HTML を操作する JSX は、HTML と JavaScript の間に class name 等を介在させるよりも合理的かつ直感的だと感じたため。                                                           |
| フレームワーク                 | next.js                             | next.js の様々なメリットを享受するため。emotion との併用が容易。                                                                                                                                                                                                                                       |
| デザイン                       | material-ui                         | 自分のデザイン能力不足を補うため。マテリアルデザインは Google により世間に浸透されているため、万人に親しまれ易いデザインと考えた。                                                                                                                                                                     |
| スタイル（css）                | emotion                             | 利用者の多い material-ui の次のバージョン(v5) の dependency であり、今後普及すると考えたため。css を変数や関数で扱うことを可能にし、css の再利用可能性を高めるため。                                                                                                                                 |
| 状態管理 1                     | redux・react-redux・reduxjs/toolkit | redux 周辺知識を学習・経験したことをアピールするため。                                                                                                                                                                                                                                                 |
| 状態管理 2                     | constate                            | props drilling を回避するため。[コンテキストの分割による最適化を簡易化](https://qiita.com/fizumi6/items/224eea88f087e2bb3dd3)するため。                                                                                                                                                                |
| フォームデータ管理             | formik を修正したもの               | 修正理由： 1. formik をそのまま利用すると不要な再レンダリングを抑えることが困難。2. state を["正規化"](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#designing-a-normalized-state)しているため [FieldArray](https://formik.org/docs/api/fieldarray)（フォームの配列を制御するコンポーネント） を使うことができない。 |
| フォームデータ入力制御         | rifm を修正したもの                 | rifm の動作で不満な点があった。実装方法に興味があったので実装を変更して理解を深めた。                                                                                                                                                                                                                  |
| Local Storage 管理 1           | redux-persist                       | redux で管理するデータを対象とする場合、便利であるため。                                                                                                                                                                                                                                               |
| Local Storage 管理 2           | fp-ts-local-storage                 | redux で管理していないデータを扱う。                                                                                                                                                                                                                                                                   |
| 関数型プログラミング           | fp-ts / ramda / ramda-adjunct       | 関数型プログラミングの学習（ react の理解を深めるため）を兼ねて利用。react において、コンポーネントを組み合わせるて UI を作るように、関数を組み合わせてロジックを作ることを意識することができた。                                                                                                      |
| 日付管理                       | date-fns                            | 関数型プログラミングとの親和性から。                                                                                                                                                                                                                                                                   |
| 型システムの厳格な利用         | io-ts                               | ID をただの string でない特別な要件を満たした string として、静的に判定することを可能にするため。                                                                                                                                                                                                      |
| UX 向上                        | react-dnd                           | ドラッグ＆ドロップによるデータ入力機能の実装に利用。                                                                                                                                                                                                                                                   |
| パフォーマンス向上 1           | react-window                        | material-ui を用いたコンポーネントのレンダリングコストが大きすぎる欠点を回避するために導入。                                                                                                                                                                                                           |
| パフォーマンス向上 2           | reselect                            | 取得対象データをメモ化し、不要な再レンダリングを抑える。                                                                                                                                                                                                                                               |
| フォームデータのバリデーション | yup                                 | formik で採用されているため、採用。                                                                                                                                                                                                                                                                    |
