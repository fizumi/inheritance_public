/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { css } from '@emotion/react'
import { InputAdornment, Modal, Paper, TextField } from '@material-ui/core'
import Popper from '@material-ui/core/Popper'
import SearchIcon from '@material-ui/icons/Search'
import React from 'react'
import { useSearchMordal } from 'src/app/hooks/useSearchMordal'
import Autocomplete from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import {
  useCommonAutocompleteProps,
  useOptions,
} from '../hooks/autocomplete/useAutocompleteSettings'
import { useFocus } from '../hooks/formik'

export const SearchMordal: React.FC = () => {
  const { openSerchMordal, closeSerchMordal } = useSearchMordal()
  const { autocompleteOptionProps, optionsFilter } = useOptions()
  const commonProps = useCommonAutocompleteProps()
  const focus = useFocus('name')

  return (
    <Modal open={openSerchMordal} onClose={closeSerchMordal}>
      <Paper
        css={[
          css`
            position: 'absolute';
            width: 60vw;
            transform: translate(20vw, 5vw);
          `,
        ]}
      >
        <Autocomplete
          css={css`
            padding: 1em;
          `}
          PopperComponent={({ children, ...other }) => (
            <Popper {...other} disablePortal>
              {children}
            </Popper>
          )}
          ListboxProps={{ style: { maxHeight: '70vh' } }}
          renderInput={(params) => {
            const newParams = {
              ...params,
              InputProps: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color={'primary'} />
                  </InputAdornment>
                ),
              },
              placeholder: '名前を入力して人物を検索してください。',
              autoFocus: true,
            }
            return <TextField {...newParams} />
          }} // ★必須
          {...autocompleteOptionProps}
          {...commonProps}
          filterOptions={(options, params) => {
            const filtered = optionsFilter.filter(options, params)
            return filtered
          }}
          selectedIDs={[]} // ★必須
          openOnFocus={true}
          closeOnSelect={true}
          onChange={(param) => {
            if (param.reason === 'select-option') {
              closeSerchMordal()
              focus(param.option.id)
            }
          }}
          disableClearOnBlur
          openOnMount // TextField autoFocus={true} × openOnFocus={true} では駄目だったので自作
        />
      </Paper>
    </Modal>
  )
}
