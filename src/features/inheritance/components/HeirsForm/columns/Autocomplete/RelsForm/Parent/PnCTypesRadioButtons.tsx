/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { css } from '@emotion/react'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Theme,
  useTheme,
} from '@material-ui/core'
import Tippy from '@tippyjs/react'
import { readonlyRecord as RR, function as F } from 'fp-ts'
import * as R from 'ramda'
import * as React from 'react'
import { dateKeyDict, IsParent, IPs, IP, key, JAs, JA } from 'src/features/inheritance/model'
import { useConstRefFunctions } from 'src/features/inheritance/hooks/formik'
import { usePreventExecutionOnUnmountedComponent, useRefArray } from 'src/utils/react/hooks'
import { makeUseField } from 'src/libraries/formik'
import { context, PnCRelContext, pseudoPartner } from './share'

// https://next--material-ui.netlify.app/components/radio-buttons/#radiogroup
const fieldName = 'type'
type FName = typeof fieldName
type PnCType = IsParent[FName]

/**
 * Formik を最大限利用しようと考えたが, Mui のアニメーションが動作しなくなってしまうため, 断念した．
 * そのため, 一度 local な state を変更してから, それを useEffect で formik に伝えるようにしている.
 * なお, unmount 発生すべきでない場合に unmount されてしまうバグを修正したので, 現時点では, 上記断念の理由は当たらない可能性がある.
 * @param props
 * @returns
 */
export const PnCTypesRadioButtons = (_props: { parentName: string }) => {
  console.log('PnCTypesRadioButtons render')
  const [useField, useOther] = makeUseField<PnCRelContext['formik']['values'], PnCRelContext>(
    context
  )
  const [
    { value, ref: _, onChange: _o, ...onBlur_onFocus },
    { focus },
    { setValue: setValueToLocalFormik },
    localFormik,
  ] = useField<PnCType>(fieldName)
  const { preventExecutionOnUnmountedComponent: mySetTimeout, isMounted } =
    usePreventExecutionOnUnmountedComponent()
  const {
    relID,
    formProps: { curRels, id },
    // focusErrorFieldRef,
    jaProps,
  } = useOther()
  const { setRelations } = useConstRefFunctions()

  const [localValue, setLocalValue] = React.useState<PnCType>(value)
  const { createSetRefByIndex: ref, elementsRef: elementsRef } = useRefArray()
  const getEl = React.useCallback(
    (value: PnCType) => elementsRef.current[IP.types.findIndex(R.equals(value))],
    [elementsRef]
  )
  // const focusBy = (value: PnCType) => { getEl(value)?.focus() }

  const prevType = React.useRef<PnCType | ''>('')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as PnCType
    prevType.current = localValue
    setLocalValue(value)
  }

  React.useEffect(() => {
    localFormik.fieldsRef.current[fieldName] = getEl(localValue)

    if (!prevType.current) return
    mySetTimeout(() => {
      console.condlog('Parent.tsx', '[PnCTypesRadioButtons] useEffect setValueToLocalFormik()')
      setValueToLocalFormik(localValue)
    })
  }, [getEl, isMounted, localFormik.fieldsRef, localValue, mySetTimeout, setValueToLocalFormik])

  React.useEffect(
    function onTypeChange() {
      if (!prevType.current) return
      mySetTimeout(() => {
        console.condlog('Parent.tsx', '[PnCTypesRadioButtons] useEffect setRelations()')
        const 実親から養親へ変更 =
          jaProps && prevType.current === '実親子' && localFormik.values.type !== '実親子'
        setRelations(
          R.evolve({
            [key.isParent]: F.flow(
              RR.upsertAt(relID, localFormik.values), // 自身の type を変更。
              jaProps && (jaProps.rel.type === '共同縁組' || 実親から養親へ変更) // 共同縁組の場合，
                ? IPs.updateAtAt(jaProps.id, id, 'type', localFormik.values.type) // 相手の type も変更。
                : R.identity
            ),
            [key.jointAdoption]: F.flow(
              jaProps && localFormik.values.type === '実親子'
                ? RR.deleteAt(jaProps.rID)
                : R.identity,
              jaProps && 実親から養親へ変更
                ? JAs.updateAtAt({ rID: jaProps.rID }, 'type', JA.typeDict.共同縁組)
                : R.identity
            ),
          })
        )

        prevType.current = ''
        setTimeout(() => {
          if (
            localFormik.values.type === '養親子' &&
            (!localFormik.values.startDate || localFormik.errors.startDate) &&
            jaProps === undefined
          ) {
            console.condlog('Parent.tsx', '[PnCTypesRadioButtons] useEffect startDate focus()')
            localFormik.fieldsRef.current?.[dateKeyDict.startDate]?.focus()
          } else if (localFormik.values.type === '特別養親子') {
            console.condlog('Parent.tsx', '[PnCTypesRadioButtons] useEffect pField focus()')
            localFormik.fieldsRef.current?.[pseudoPartner]?.focus()
          }
        })
      }) // setTimeout で フォーカス をずらすと, onBlur validation タイミングが適切になり, エラーが残ってしまう問題を解決できる
    },
    [localFormik.values.type] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const isFocused = focus === fieldName
  const label = '親子関係'
  // const additionalRel = '特別養親子、又は実親子'
  const actualParentCountIsGreaterThanEqualTwo = IPs.actualParentCountIsGreaterThanEqualTwo(curRels)
  const hasJa = jaProps !== undefined
  const disableActual = actualParentCountIsGreaterThanEqualTwo || hasJa
  return (
    <div css={wrapper}>
      <div css={overwrite}>
        <FormControl>
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup
            aria-label={label}
            name={fieldName}
            value={localValue}
            onChange={handleChange}
          >
            {/* {[...IP.rels, additionalRel].map((value, index) => { */}
            {IP.types.map((value, index) => {
              const disabled = value === '実親子' && disableActual
              return (
                <FormControlLabel
                  disabled={disabled}
                  ref={ref(index)}
                  control={<Radio />}
                  key={value}
                  value={value}
                  label={value}
                  {...onBlur_onFocus}
                />
              )
            })}
            <Tippy
              reference={elementsRef.current[IP.typeIndex.実親子]}
              placement={'left'}
              content={
                hasJa
                  ? '「共同縁組者」が登録されている場合、「実親子」への変更はできません。'
                  : '実親子関係は２名まで登録可能です。'
              }
              disabled={!disableActual}
            />
          </RadioGroup>
        </FormControl>
        <NotchedOutline isFocused={isFocused} label={label} />
      </div>
    </div>
  )
}

// TODO picker コンポーネント内の useEffect 内でも usePreventExecutionOnUnmountedComponent を使わないと完全にエラー文を消去することはできない

/*
下記は, Mui の OutlinedInput のデザインの模倣
*/

// https://github.com/mui-org/material-ui/blob/next/packages/material-ui/src/OutlinedInput/NotchedOutline.js
const NotchedOutline: React.FC<{ isFocused?: boolean; label?: string }> = ({
  isFocused,
  label,
}) => {
  const theme = useTheme()
  return (
    <fieldset css={fieldset(theme, isFocused)}>
      <legend css={legend}>{label ? <span>{label}</span> : null}</legend>
    </fieldset>
  )
}

// TextField
const wrapper = css`
  padding-top: 0.6em;
  padding-bottom: 0.2em;
`
const subwrapper = css`
  padding: 0 10px 10px 2.5em;
  margin-top: -8px;
`

const overwrite = css`
  position: relative; // fieldset 格納用

  .MuiFormGroup-root {
    padding-left: 14px; // .MuiOutlinedInput-input
    padding-top: 7px;
    padding-bottom: 5px;
  }

  legend.MuiFormLabel-root {
    // .MuiInputLabel-outlined.MuiInputLabel-shrink
    transform: translate(14px, -6px) scale(0.75);

    // .MuiInputLabel-outlined
    z-index: 1;
    pointer-events: none;

    // .MuiInputLabel-formControl
    top: 0;
    left: 0;
    position: absolute;

    // .MuiInputLabel-root
    display: block;
    transform-origin: top left;

    // .MuiFormLabel-root
    padding: 0;
    font-size: 1rem;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.00938em;
  }
`
const suboverwrite = css`
  span.MuiIconButton-root {
    padding: 5px 9px;
  }
  span.MuiTypography-root {
    font-size: 0.95rem;
  }
`

const fieldset = (theme: Theme, focused?: boolean) => [
  // .PrivateNotchedOutline-root
  css`
    top: -5px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 0 8px;
    overflow: hidden;
    position: absolute;
    text-align: left;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    pointer-events: none;
  `,
  focused &&
    css`
      border-width: 2px;
      border-color: ${theme.palette.primary.main};
    `,
]
const legend = css`
  max-width: 1000px;
  width: auto;
  height: 11px;
  display: block;
  padding: 0;
  font-size: 0.75em;
  visibility: hidden;
  span {
    display: inline-block;
    padding-left: 5px;
    padding-right: 5px;
  }
`
