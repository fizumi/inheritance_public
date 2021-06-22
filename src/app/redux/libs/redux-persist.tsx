import React from 'react'
import storage from 'redux-persist/lib/storage'
import { PersistGate, PersistGateProps } from 'redux-persist/integration/react'
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { isBrowser } from 'src/utils/web'

// c.f. https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist

export const config = {
  key: 'root',
  storage,
}

export const actions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

export const persist = {
  config,
  actions,
}

// export const PersistGateForNextJs: React.FC<
//   { store: Parameters<typeof persistStore>[0] } & Omit<PersistGateProps, 'persistor'>
// > = ({ children, store, loading }) => {
//   return (
//     <PersistGate persistor={persistStore(store)}>
//       {
//         /* c.f. https://github.com/vercel/next.js/issues/8240#issuecomment-647699316 */
//         // () => {
//         //   return children
//         // } // これだと this.props.loading が一切使われなくなり、PersistGate を使う意味がなくなるのでは？
//       }
//       {
//         // Did not expect server HTML to contain a <div> in <div>. のエラー が出る
//         // ↓ これをするなら isBrowser で PersistGate を呼び分ければ良いのでは？
//         (bootstrapped: boolean) => {
//           return !isBrowser ? children : bootstrapped ? children : loading
//         }
//       }
//     </PersistGate>
//   )
// }

// isBrowser で PersistGate を呼び分ける
// Did not expect server HTML to contain a <div> in <div>. のエラーは Next.js を使う以上は仕方ない？
export const PersistGateForNextJs: React.FC<
  { store: Parameters<typeof persistStore>[0] } & Omit<PersistGateProps, 'persistor'>
> = ({ children, store, ...other }) => {
  return !isBrowser ? (
    <>{children}</>
  ) : (
    <PersistGate persistor={persistStore(store)} {...other}>
      {children}
    </PersistGate>
  )
}

// c.f. https://github.com/vercel/next.js/blob/0af3b526408bae26d6b3f8cab75c4229998bf7cb/examples/with-redux-persist/pages/_app.js
// ↑ これは良くわからなかった

// PersistGate も persistStore も不要説 自分のコメント → https://github.com/vercel/next.js/issues/8240#issuecomment-854471689
// ↓ persistStore から意味のある部分を抽出(PersistGate を使わない場合)
export const rehydrate = (store: Parameters<typeof persistStore>[0]): void => {
  console.log(`dispatch ${PERSIST}`)
  store.dispatch({
    type: PERSIST,
    rehydrate: (key: string, payload: any, err: any) => {
      store.dispatch({
        type: REHYDRATE,
        payload,
        err,
        key,
      })
    },
    register: () => undefined,
  })
}
