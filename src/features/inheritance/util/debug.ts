import 'src/utils/common/debug'
declare module 'src/utils/common/debug' {
  interface Key2any {
    'date picker': never
    cancelable: never
    history: never
    'rifm flow': never
    'rifm debug': never
    'family tree': never
    'useMyFormik.tsx': never
    'Marriage.tsx': never
    'Parent.tsx': never
    Autocomplete: never
    component: never
    useEnterKeyForChangingFocus: never
  }
}

// 今後は
// 各種ファイルで
// declare module 'src/utils/common/debug' { interface Key2any { useMeasureGridRow: never } } // prettier-ignore
// のようにして宣言のマージをしていく方針
