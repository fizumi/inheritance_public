/*
    model群 を validate するための関数群

    ある model 専用の validaiton は その model 配下に配置してもよいが,
    validatin は model 間相互の状態に依存する場合も多いため, その場合に当フォルダを使用する.
*/

export * from './afterLoad'
export * from './beforeLoad'
