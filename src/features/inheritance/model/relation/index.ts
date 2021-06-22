import * as JA from './JointAdoption' // JointAdoption に index.ts を配置することで, type.ts と model.ts を JA にまとめる
import * as Mrrg from './Marriage'
import * as IP from './IsParent'
// exoprt * as JA from './JointAdoption' ❌
export { JA, Mrrg, IP } // https://github.com/benmosher/eslint-plugin-import/issues/1834#issuecomment-648403928
export type { JointAdoption } from './JointAdoption'
export type { Marriage } from './Marriage'
export type { IsParent } from './IsParent'
export * from './shared'
