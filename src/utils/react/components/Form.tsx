import React from 'react'

const Form: React.FC = ({ children }) => {
  return <form noValidate>{children}</form>
}
export default Form

/*
noValidate は ブラウザ の デフォルトのバリデーションを OFF にする.
noValidate がないと, input に required 属性を指定したときに,
「このフィールドを入力してください」が表示される．

noValidate を使用している例 ↓
https://next--material-ui.netlify.app/components/text-fields/#form-props
*/
