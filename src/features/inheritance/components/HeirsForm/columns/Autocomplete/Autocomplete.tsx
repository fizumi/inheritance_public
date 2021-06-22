import { css } from '@emotion/react'
import { Checkbox, Theme } from '@material-ui/core'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import * as R from 'ramda'
import React from 'react'
import { label, RelationKey, ID } from 'src/features/inheritance/model'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import { RightArrow } from 'src/utils/react/components'
import Autocomplete, {
  AutocompleteProps,
  DATA_OPTION_ID,
  DATA_OPTION_INDEX,
} from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import { useBoolean } from 'src/utils/react/hooks'
// import useDependenciesDebugger, { log } from 'src/utils/web/react/hooks/useDependenciesDebugger'
import { scrollableX } from 'src/app/styles/emotion'
import { createCoreField } from 'src/features/inheritance/util'
import { MyTextField } from 'src/features/inheritance/components/shared/TextField'
import { useDebugInfo, useFieldsRef } from 'src/features/inheritance/hooks/formik'
import { ColumnProp } from '../types'
import { MarriageForm, ParentForm, RelsForm } from './RelsForm'
import {
  Opt,
  useCommonAutocompleteProps,
  useOptions,
} from 'src/features/inheritance/hooks/autocomplete/useAutocompleteSettings'
import { useFieldPartially } from './useFieldPartially'
import { useNameIsFocusedID } from 'src/features/inheritance/hooks/formik/useNameIsFocusedID'
import { RightArrowMenu } from './useRightArrowMenu'
import { useDropChip } from 'src/features/inheritance/components/HeirsForm/columns/Autocomplete/useDropChip'
import { DraggableChip } from 'src/features/inheritance/components/shared/DraggableChip'
import { useDetectTargetChange } from 'src/features/inheritance/hooks/useDetectFieldChange'
import { useSolidBorder } from 'src/features/inheritance/hooks/useSolidBorder'

// TODO 和暦の時,  Year の キーボード入力で境界日の時に一つ飛び越えてしまう問題 or TOOD キーボード入力機能の廃止

/*
Popper の連鎖の基本戦略（下記文章はややこしいし, 完璧に検討出来ていないが大要が掴めれば良い）

- 子Popper の open or close は自前で管理（`open` state で管理）
  - open を true に変更した時, focus を子Popperに移動する
  - 子Popper の onBlur で open を false に変更し, 子Popper を閉じる（※1）
    - ただし, 子Popperが子Popperを持ち（孫Popper）, かつ, 子Popperが管理する open state が true の場合
      - onBlur で閉じないようにする
    - 親Popper が存在する場合
      - onBlur で, 親ｺﾝﾎﾟｰﾈﾝﾄに focus を移す
        - これにより, 親ｺﾝﾎﾟｰﾈﾝﾄは onBlur event（※1）を利用できる

- Autocomplete <- 子Popper(option list) の open state を管理
  - 子Popper: option list <- 子Popper(marriage form) の open state を管理（以下同様）
    - 子Popper: marriage form
      - 子Popper: date picker
 */

setMyDebugMethodToConsole()
console.setKey('Autocomplete')

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const scrollbar = (theme: Theme) => css`
  scrollbar-width: none; // 一旦、Firefox では非表示
  &::-webkit-scrollbar-track {
    background-color: ${theme.palette.grey[100]};
    border-radius: 1px;
  }

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${theme.palette.grey[300]};
    border-radius: 1px;
    &:hover {
      background: ${theme.palette.secondary.main};
      cursor: pointer;
    }
  }
`

const nowWrap = css`
  display: flex;
  flex-flow: row nowrap;
`

type Props = {
  rKey: RelationKey
  handleOnChange: NonNullable<AutocompleteProps<Opt>['onChange']>
  handleContextMenu?: (event: React.MouseEvent<Element, MouseEvent>) => void
  value: readonly string[]
  curRels: any
  rightArrowMenu?: RightArrowMenu
  getOptionDisabled?: (o: Opt) => boolean
  switchColor: (theOtherID: string) => React.CSSProperties
  setRels: (ids: ID[] | ID) => void
} & ColumnProp
const MyAutocomplete: React.FC<Props> = ({
  id,
  rKey: relKey,
  value: selectedIDs,
  curRels,
  rootRef,
  handleOnChange,
  handleContextMenu,
  rightArrowMenu: RAM,
  getOptionDisabled,
  switchColor,
  setRels,
}) => {
  if (!Array.isArray(selectedIDs)) {
    console.error('value は 配列である必要があります')
  }
  const { index } = useDebugInfo(id)
  const { textFieldProps, path, error } = useFieldPartially(id, relKey, curRels)
  const { theme, solidBorder } = useSolidBorder()
  const focusedID = useNameIsFocusedID(selectedIDs)
  const fieldsRef = useFieldsRef()
  const {
    state: open,
    dispatcher: { setTrue: onOpen, setFalse: closeOptionsList },
  } = useBoolean(false)
  const { autocompleteOptionProps, optionsFilter } = useOptions(React.useMemo(() => [id], [id]))
  const commonProps = useCommonAutocompleteProps()
  const Form = (relKey === 'marriage' ? MarriageForm : ParentForm) as React.FC<RelsForm<any>>
  const {
    drop,
    dropProps: { canDrop, isOver },
  } = useDropChip(setRels)

  const { useSubscribe, subject } = useDetectTargetChange()
  const updateCount = useSubscribe(
    (forceUpdate) => ({
      next(fieldChange) {
        if (R.includes(fieldChange.name, selectedIDs))
          forceUpdate() /*console.log('force update', index)*/
      },
    }),
    [selectedIDs]
  )
  // useDependenciesDebugger( {index, open, RAM, onOpen, relKey, id, commonProps, handleOnChange, getOptionDisabled, autocompleteOptionProps, selectedIDs, updateCount, closeOptionsList, optionsFilter, Form, textFieldProps, handleContextMenu, drop, error, canDrop, isOver, theme, focusedID, solidBorder, switchColor, subject, fieldsRef, path}, log('Autocomplete', index), true) // prettier-ignore
  return React.useMemo(
    () => {
      console.condlog('component', `Autocomplete[${index}] in memo`)
      return (
        <Autocomplete
          open={open}
          ListboxProps={{
            onMouseDown: (event: React.MouseEvent) => {
              RAM?.getIsOpen() || event.preventDefault()
            },
            style: RAM?.isOpen ? { overflow: 'hidden' } : {}, // scroll の lock
          }}
          onOpen={onOpen}
          onClose={(_e, _r) => {
            if (!RAM?.getIsOpen()) {
              if (!RAM?.disableClose.current) {
                console.condlog('Autocomplete', 'onClose', _r)
                closeOptionsList()
              }
            }
          }}
          id={`${relKey}-${id}`}
          css={css`
            .MuiInputBase-root {
              ${nowWrap}
            }
          `}
          {...commonProps}
          // selectedOptions={persons.filter((p) =></> R.includes(p.id, value)) as Opt[]}
          // createNewOption={newPerson as (name: string) => Opt} // 独自Prop
          disableClearOnBlur
          onInputChange={(_, reason) => reason === 'input' && RAM?.forceClose()} // arrow menu が開いている状態で表示されている option が変更されると popper は ancher を失ってしまうた、閉じる
          onChange={handleOnChange}
          filterOptions={(options, params) => {
            const filtered = optionsFilter.filter(options, params)
            // Suggest the creation of a new value
            if (params.inputValue !== '') {
              filtered.push({
                display: `相続人追加： ${params.inputValue}`,
                ...createCoreField(params.inputValue),
              })
            }
            return filtered
          }}
          getOptionDisabled={getOptionDisabled}
          renderOption={(props, option, { selected }) => {
            const isSelected = RAM?.isSelected(option.id) || false
            return option.display ? (
              <li key={option.id} {...props}>
                {option.display}
              </li>
            ) : (
              <RightArrow
                display={!!RAM && selected}
                key={option.id}
                onClick={RAM?.openOnClick}
                iconButtonAttr={R.pick([DATA_OPTION_INDEX, DATA_OPTION_ID], props)}
                isSelected={isSelected}
                style={isSelected ? { transform: 'scaleX(1.6) scaleY(1.3)' } : undefined}
              >
                <li key={option.id} {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                    color="secondary"
                  />
                  {option.name}
                  {RAM && isSelected ? <Form {...RAM.getFormProps(selectedIDs)} /> : null}
                </li>
              </RightArrow>
            )
          }}
          renderInput={(params) => {
            const newParams = {
              ...textFieldProps,
              ...params,
              InputProps: {
                ...params.InputProps,
                ...textFieldProps.InputProps,
              },
              onContextMenu: handleContextMenu,
            }
            return (
              <MyTextField
                ref={drop}
                {...newParams}
                label={label[relKey]}
                errorMsg={error}
                suppressError={open}
                css={
                  canDrop &&
                  isOver &&
                  css`
                    .MuiOutlinedInput-notchedOutline {
                      border-color: ${theme.palette.secondary.main};
                      border-width: 2px;
                    }
                  `
                }
              />
            )
          }}
          {...autocompleteOptionProps}
          selectedIDs={selectedIDs}
          // selectedOptions = getValueIfThunk(options).filter(optionSelector(selectedIDs))
          renderTags={(selectedOptions, getCustomizedTagProps) => (
            <div css={[scrollableX, scrollbar(theme), nowWrap]}>
              {selectedOptions.map((option, index) => {
                const { onDelete, ...otherTagProps } = getCustomizedTagProps(index) as any
                return (
                  <DraggableChip
                    key={option.id}
                    id={option.id}
                    label={option.name}
                    {...otherTagProps}
                    onDelete={(e) => {
                      onDelete(e)
                      subject.next({ hoveredChip: '' })
                    }}
                    style={{
                      ...(option.id === focusedID ? solidBorder : {}),
                      ...switchColor(option.id),
                    }}
                    // onClick={() => push(option.id)}
                  />
                )
              })}
            </div>
          )}
          nextElement={() => fieldsRef.current[path.next()]}
          prefElement={() => fieldsRef.current[path.prev()]}
        />
      )
      const _dummy = updateCount // to update below dependency array automatically
    },
    [index, open, RAM, onOpen, relKey, id, commonProps, handleOnChange, getOptionDisabled, autocompleteOptionProps, selectedIDs, updateCount, closeOptionsList, optionsFilter, Form, textFieldProps, handleContextMenu, drop, error, canDrop, isOver, theme, focusedID, solidBorder, switchColor, subject, fieldsRef, path] // prettier-ignore
  )
}
export default MyAutocomplete
