import { css } from '@emotion/react'
import * as React from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import useDelayedSet from 'src/utils/react/hooks/useDelayedSet'
import Tippy from '@tippyjs/react' // nest できるので, Mui の Tooltip から乗り換え

export type MyTextFieldProps = TextFieldProps & {
  errorMsg?: string
  touched?: boolean
  suppressError?: boolean
  description?: string
}
/**
 * @param touched エラー表示を制御する場合, boolean で渡す (!!touched で渡す / undefined で渡さない)
 */
export const MyTextField = React.forwardRef<HTMLDivElement, MyTextFieldProps>(
  ({ errorMsg, touched, suppressError, onChange, description, ...other }, ref) => {
    const hideError_ = touched === false || suppressError || !errorMsg // touched === undefined の場合, error を隠さない
    const hideError = useDelayedSet(hideError_)

    const error = hideError ? false : !!errorMsg

    const handleChange: typeof onChange = (e) => {
      e.target.setCustomValidity('')
      onChange?.(e)
    }
    return (
      <div
        ref={ref}
        css={css`
          padding-top: 0.6em;
          padding-bottom: 0.2em;
        `}
      >
        <Tippy content={description} disabled={!description} placement={'left'}>
          <Tippy content={errorMsg} disabled={hideError} arrow placement={'top'}>
            <TextField
              {...other}
              onChange={handleChange}
              error={error}
              css={css`
                width: 100%;
              `}
              autoComplete="off"
            />
          </Tippy>
        </Tippy>
      </div>
    )
  }
)
