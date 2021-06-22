import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

// 「このフィールドを入力してください」を消す効果はなかった
export default function usePreventDefaultErrorMessage() {
  useIsomorphicLayoutEffect(() => {
    document.addEventListener('invalid', (e) => e.preventDefault())
  }, [])
}
// <form  noValidate > を利用することにした
