/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import { css } from '@emotion/react'
import * as R from 'ramda'
import { function as F } from 'fp-ts'
import { makeUseField } from 'src/libraries/formik'
import { IsParent, IP } from 'src/features/inheritance/model'

/*
下記の通り,
Formik を最大限利用しようと考えたが, Mui のアニメーションが動作しなくなってしまうため, 断念した．
*/

// https://next--material-ui.netlify.app/components/radio-buttons/#radiogroup
const fieldName = 'type'
export const PnCTypesRadioButtons = (props: { context: React.Context<{}>; parentName: string }) => {
  const ref = React.useRef<any>(null)
  const MyRadio = makeMyRadio(props.context, fieldName)
  const [useField, useOther] = makeUseField<IsParent>(props.context)
  return (
    <div css={style}>
      <FormControl component="fieldset">
        <FormLabel component="legend">親子関係</FormLabel>
        <RadioGroup aria-label="親子関係">
          {IP.types.map((value) => (
            <MyRadio key={value} value={value} label={value} />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  )
}
const makeMyRadio: (
  context: React.Context<{}>,
  name: string
) => React.FC<{
  label: string
  value: string
}> = (context, name) => {
  const [useField, useOther] = makeUseField<IsParent>(context)
  return ({ label, ...props }) => {
    const buttonRef = React.useRef<HTMLInputElement>(null)
    const [{ ref: _, ...field }, , { setValue }] = useField({
      ...props,
      name,
      type: 'radio',
    })
    const onClick: React.MouseEventHandler<HTMLLabelElement> = (e) => {
      setValue(field.value)
      buttonRef.current?.focus()
    }
    return (
      <FormControlLabel
        ref={buttonRef}
        {...field}
        control={<Radio />}
        label={label}
        onClick={onClick}
      />
    )
  }
}

const style = css`
  fieldset.MuiFormControl-root {
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    border-color: rgba(0, 0, 0, 0.23);
    width: 100%;
    padding-left: 14px;
  }
  fieldset.MuiFormControl-root:focus {
    border-width: 2px;
    border-color: #3f51b5;
  }
  legend.MuiFormLabel-root {
    transform: scale(0.75);
  }
`
