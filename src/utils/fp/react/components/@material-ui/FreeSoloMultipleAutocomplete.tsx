import React from 'react'
import clsx from 'clsx'
import {
  Paper,
  Popper,
  PopperProps,
  alpha,
  InternalStandardProps as StandardProps,
  Chip,
  IconButton,
} from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import useAutocomplete, {
  UseFreeSoloMultipleAutocompleteProps,
} from 'src/utils/fp/react/hooks/useFreeSoloMultipleAutocomplete'

// typescript
import { createStyles, makeStyles } from '@material-ui/styles'

export * from 'src/utils/fp/react/hooks/useFreeSoloMultipleAutocomplete'

export const useStyles = makeStyles((theme) =>
  createStyles({
    /* Styles applied to the root element. */
    root: {
      '&$focused $clearIndicator': {
        visibility: 'visible',
      },
      /* Avoid double tap issue on iOS */
      '@media (pointer: fine)': {
        '&:hover $clearIndicator': {
          visibility: 'visible',
        },
      },
    },
    /* Styles applied to the root element if `fullWidth={true}`. */
    fullWidth: {
      width: '100%',
    },
    /* Pseudo-class applied to the root element if focused. */
    focused: {},
    /* Styles applied to the tag elements, e.g. the chips. */
    tag: {
      margin: 3,
      maxWidth: 'calc(100% - 6px)',
    },
    /* Styles applied to the tag elements, e.g. the chips if `size="small"`. */
    tagSizeSmall: {
      margin: 2,
      maxWidth: 'calc(100% - 4px)',
    },
    /* Styles applied when the popup icon is rendered. */
    hasPopupIcon: {},
    /* Styles applied when the clear icon is rendered. */
    hasClearIcon: {},
    /* Styles applied to the Input element. */
    inputRoot: {
      flexWrap: 'wrap',
      '$hasPopupIcon &, $hasClearIcon &': {
        paddingRight: 26 + 4,
      },
      '$hasPopupIcon$hasClearIcon &': {
        paddingRight: 52 + 4,
      },
      '& $input': {
        width: 0,
        minWidth: 30,
      },
      '&[class*="MuiInput-root"]': {
        paddingBottom: 1,
        '& $input': {
          padding: 4,
        },
        '& $input:first-child': {
          padding: '6px 0',
        },
      },
      '&[class*="MuiInput-root"][class*="MuiInput-marginDense"]': {
        '& $input': {
          padding: '2px 4px 3px',
        },
        '& $input:first-child': {
          padding: '1px 0 4px',
        },
      },
      '&[class*="MuiOutlinedInput-root"]': {
        padding: 9,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '7.5px 4px',
        },
        '& $input:first-child': {
          paddingLeft: 6,
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]': {
        padding: 6,
        '& $input': {
          padding: '2.5px 4px',
        },
      },
      '&[class*="MuiFilledInput-root"]': {
        paddingTop: 19,
        paddingLeft: 8,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '7px 4px',
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiFilledInput-root"][class*="MuiFilledInput-marginDense"]': {
        paddingBottom: 1,
        '& $input': {
          padding: '2.5px 4px',
        },
      },
    },
    /* Styles applied to the input element. */
    input: {
      flexGrow: 1,
      textOverflow: 'ellipsis',
      // opacity: 0,
    },
    /* Styles applied to the input element if tag focused. */
    inputFocused: {
      opacity: 1,
    },
    /* Styles applied to the endAdornment element. */
    endAdornment: {
      // We use a position absolute to support wrapping tags.
      position: 'absolute',
      right: 0,
      top: 'calc(50% - 14px)', // Center vertically
    },
    /* Styles applied to the clear indicator. */
    clearIndicator: {
      marginRight: -2,
      padding: 4,
      visibility: 'hidden',
    },
    /* Styles applied to the popup indicator. */
    popupIndicator: {
      padding: 2,
      marginRight: -2,
    },
    /* Styles applied to the popup indicator if the popup is open. */
    popupIndicatorOpen: {
      transform: 'rotate(180deg)',
    },
    /* Styles applied to the popper element. */
    popper: {
      zIndex: theme.zIndex.modal,
    },
    /* Styles applied to the popper element if `disablePortal={true}`. */
    popperDisablePortal: {
      position: 'absolute',
    },
    /* Styles applied to the `Paper` component. */
    paper: {
      ...theme.typography.body1,
      overflow: 'auto',
      margin: '4px 0',
    },
    /* Styles applied to the `listbox` component. */
    listbox: {
      listStyle: 'none',
      margin: 0,
      padding: '8px 0',
      maxHeight: '40vh',
      overflow: 'auto',
    },
    /* Styles applied to the loading wrapper. */
    loading: {
      color: theme.palette.text.secondary,
      padding: '14px 16px',
    },
    /* Styles applied to the no option wrapper. */
    noOptions: {
      color: theme.palette.text.secondary,
      padding: '14px 16px',
    },
    /* Styles applied to the option elements. */
    option: {
      minHeight: 48,
      display: 'flex',
      overflow: 'hidden',
      justifyContent: 'flex-start',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: 6,
      boxSizing: 'border-box',
      outline: '0',
      WebkitTapHighlightColor: 'transparent',
      paddingBottom: 6,
      paddingLeft: 16,
      paddingRight: 16,
      [theme.breakpoints.up('sm')]: {
        minHeight: 'auto',
      },
      '&[data-focus="true"]': {
        backgroundColor: theme.palette.action.hover,
        // Reset on touch devices, it doesn't add specificity
        // '@media (hover: none)': {
        //   backgroundColor: 'transparent',
        // },
      },
      '&[aria-disabled="true"]': {
        opacity: theme.palette.action.disabledOpacity,
        pointerEvents: 'none',
      },
      '&.Mui-focusVisible': {
        backgroundColor: theme.palette.action.focus,
      },
      '&[aria-selected="true"]': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        '&[data-focus="true"]': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity
          ),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: theme.palette.action.selected,
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity + theme.palette.action.focusOpacity
          ),
        },
      },
    },
    /* Styles applied to the group's label elements. */
    groupLabel: {
      backgroundColor: theme.palette.background.paper,
      top: -8,
    },
    /* Styles applied to the group's ul elements. */
    groupUl: {
      padding: 0,
      '& $option': {
        paddingLeft: 24,
      },
    },
  })
)

export interface AutocompleteRenderOptionState {
  inputValue: string
  selected: boolean
}

// export type AutocompleteGetTagProps = ({ index }: { index: number }) => {}
// eslint-disable-next-line @typescript-eslint/ban-types
export type AutocompleteGetTagProps = (index: number) => {}

export interface AutocompleteRenderGroupParams {
  key: string
  group: string
  children?: React.ReactNode
}

export interface AutocompleteRenderInputParams {
  id?: string
  disabled: boolean
  fullWidth: boolean
  size: 'small' | undefined
  InputLabelProps: ReturnType<ReturnType<typeof useAutocomplete>['getInputLabelProps']>
  InputProps: {
    ref: React.Ref<any>
    className: string
    startAdornment: React.ReactNode
    endAdornment: React.ReactNode
  }
  inputProps: ReturnType<ReturnType<typeof useAutocomplete>['getInputProps']> & {
    className: string //これがないと型エラー
    disabled: boolean //これがないと型エラー
  }
}

/**
 * 主に下記の props を固定する想定で Autocomplete の original src を書き換えている
 * freeSolo=true（固定）
 * multiple=true（固定）
 *
 */
export interface AutocompleteProps<Option>
  extends UseFreeSoloMultipleAutocompleteProps<Option>,
    StandardProps<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  classes?: {
    /** Styles applied to the root element. */
    root?: string
    /** Styles applied to the root element if `fullWidth={true}`. */
    fullWidth?: string
    /** Pseudo-class applied to the root element if focused. */
    focused?: string
    /** Styles applied to the tag elements, e.g. the chips. */
    tag?: string
    /** Styles applied to the tag elements, e.g. the chips if `size="small"`. */
    tagSizeSmall?: string
    /** Styles applied when the popup icon is rendered. */
    hasPopupIcon?: string
    /** Styles applied when the clear icon is rendered. */
    hasClearIcon?: string
    /** Styles applied to the Input element. */
    inputRoot?: string
    /** Styles applied to the input element. */
    input?: string
    /** Styles applied to the input element if tag focused. */
    inputFocused?: string
    /** Styles applied to the endAdornment element. */
    endAdornment?: string
    /** Styles applied to the clear indicator. */
    clearIndicator?: string
    /** Styles applied to the popup indicator. */
    popupIndicator?: string
    /** Styles applied to the popup indicator if the popup is open. */
    popupIndicatorOpen?: string
    /** Styles applied to the popper element. */
    popper?: string
    /** Styles applied to the popper element if `disablePortal={true}`. */
    popperDisablePortal?: string
    /** Styles applied to the `Paper` component. */
    paper?: string
    /** Styles applied to the `listbox` component. */
    listbox?: string
    /** Styles applied to the loading wrapper. */
    loading?: string
    /** Styles applied to the no option wrapper. */
    noOptions?: string
    /** Styles applied to the option elements. */
    option?: string
    /** Styles applied to the group's label elements. */
    groupLabel?: string
    /** Styles applied to the group's ul elements. */
    groupUl?: string
  }
  /**
   * The icon to display in place of the default close icon.
   * @default <CloseIcon fontSize="small" />
   */
  // closeIcon?: React.ReactNode
  /**
   * Override the default text for the *clear* icon button.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   * @default 'Clear'
   */
  clearText?: string
  /**
   * Override the default text for the *close popup* icon button.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   * @default 'Close'
   */
  closeText?: string
  /**
   * If `true`, the input is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * The `Popper` content will be inside the DOM hierarchy of the parent component.
   * @default false
   */
  // disablePortal?: boolean
  /**
   * Force the visibility display of the popup icon.
   * @default 'auto'
   */
  forcePopupIcon?: true | false | 'auto'
  /**
   * If `true`, the input will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean
  /**
   * The label to display when the tags are truncated (`limitTags`).
   *
   * @param {number} more The number of truncated tags.
   * @returns {ReactNode}
   * @default (more) => `+${more}`
   */
  getLimitTagsText?: (more: number) => React.ReactNode
  /**
   * The component used to render the listbox.
   * @default 'ul'
   */
  ListboxComponent?: React.ComponentType<React.HTMLAttributes<HTMLElement>>
  /**
   * Props applied to the Listbox element.
   */
  ListboxProps?: Partial<ReturnType<ReturnType<typeof useAutocomplete>['getListboxProps']>> &
    Pick<React.HTMLAttributes<any>, 'style'>
  /**
   * If `true`, the component is in a loading state.
   * @default false
   */
  loading?: boolean
  /**
   * Text to display when in a loading state.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   * @default 'Loading…'
   */
  loadingText?: React.ReactNode
  /**
   * The maximum number of tags that will be visible when not focused.
   * Set `-1` to disable the limit.
   * @default -1
   */
  limitTags?: number
  /**
   * Text to display when there are no options.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   * @default 'No options'
   */
  // noOptionsText?: React.ReactNode
  /**
   * Override the default text for the *open popup* icon button.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   * @default 'Open'
   */
  // openText?: string
  /**
   * The component used to render the body of the popup.
   * @default Paper
   */
  PaperComponent?: React.ComponentType<React.HTMLAttributes<HTMLElement>>
  /**
   * The component used to position the popup.
   * @default Popper
   */
  PopperComponent?: React.ComponentType<PopperProps>
  /**
   * The icon to display in place of the default popup icon.
   * @default <ArrowDropDownIcon />
   */
  popupIcon?: React.ReactNode
  /**
   * Render the group.
   *
   * @param {any} option The group to render.
   * @returns {ReactNode}
   */
  // renderGroup?: (params: AutocompleteRenderGroupParams) => React.ReactNode
  /**
   * Render the input.
   *
   * ★必須
   * @param {object} params
   * @returns {ReactNode}
   */
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode
  /**
   * Render the option, use `getOptionLabel` by default.
   *
   * @param {object} props The props to apply on the li element.
   * @param {T} option The option to render.
   * @param {object} state The state of the component.
   * @returns {ReactNode}
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: Option,
    state: AutocompleteRenderOptionState
  ) => React.ReactNode
  // renderOption?: (option: Option, state: AutocompleteRenderOptionState) => React.ReactNode
  /**
   * Render the selected value.
   *
   * @param {T[]} value The `value` provided to the component.
   * @param {function} getTagProps A tag props getter.
   * @returns {ReactNode}
   */
  renderTags?: (
    value: Option[],
    getTagProps: AutocompleteGetTagProps
  ) => React.ReactNodeArray | React.ReactNode
  /**
   * The size of the autocomplete.
   * @default 'medium'
   */
  size?: 'small' | 'medium'

  // getRootProps を使用しないと, getClearProps 由来の onClick が 反応しない
  [other: string]: any

  clearIcon?: any
}

export type AutocompleteClassKey = keyof NonNullable<AutocompleteProps<any>['classes']>

// eslint-disable-next-line @typescript-eslint/ban-types
type ForwardedRef<T, P = {}> = Parameters<React.ForwardRefRenderFunction<T, P>>[1]

// ↓ 関数内部で Type Parameter（Option） を使いたいので、
// React.forwardRef<HTMLDivElement, ArrowSwitcherProps>((props, ref) => ...
// などを使わずに、ちゃんと型を書く必要がある。
const _Autocomplete = <Option,>(
  props: AutocompleteProps<Option>,
  ref: ForwardedRef<HTMLDivElement>
): JSX.Element => {
  const classes = useStyles(props)

  const {
    // autoComplete = false,
    // autoHighlight = false,
    // autoSelect = false,
    // blurOnSelect = false,
    // ChipProps,
    // classes, // typescript を使う場合、makeStyles, createStyles の組み合わせを使う。
    className,
    clearIcon = <ClearIcon fontSize="small" />,
    // clearOnBlur = !props.freeSolo,
    // clearOnEscape = false,
    clearText = 'Clear',
    closeText = 'Close',
    // defaultValue = props.multiple ? [] : null,
    disableClearable = false,
    // disableCloseOnSelect = false,
    disabled = false,
    // disabledItemsFocusable = false,
    // disableListWrap = false,
    // disablePortal = false,
    // filterOptions,
    // filterSelectedOptions = false,
    forcePopupIcon = 'auto',
    // freeSolo = false, // ★ ture で固定
    fullWidth = false,
    getLimitTagsText = (more: number) => `+${more}`,
    // getOptionDisabled,
    getOptionLabel: getOptionLabelProp,
    // getOptionSelected,
    // groupBy,
    // handleHomeEndKeys = !props.freeSolo,
    // id: idProp,
    // includeInputInList = false,
    // inputValue: inputValueProp,
    limitTags = -1,
    ListboxComponent = 'ul',
    ListboxProps,
    loading = false,
    loadingText = 'Loading…',
    // multiple = false, // ★ ture で固定
    noOptionsText = '候補なし',
    // onChange,
    // onClose,
    // onHighlightChange,
    // onOpen,
    // open,
    openText = 'Open',
    // options,
    PaperComponent = Paper,
    PopperComponent = Popper,
    popupIcon = <ArrowDropDownIcon />,
    // renderGroup: renderGroupProp,
    renderInput,
    renderOption: renderOptionProp,
    renderTags,
    // selectOnFocus = !props.freeSolo,
    size = 'medium',
    // value: valueProp,

    // other に含めると, "Warning: React does not recognize the `...` prop on a DOM element." と出力されてしまうものを取り除く
    selectedIDs,
    filterOptions,
    equalOption,
    optionSelector,
    idSelector,
    nextElement,
    prefElement,
    onOpen,
    options,
    getOptionDisabled,
    closeOnSelect,
    openOnMount,
    disableResetOnSelect,
    disableClearOnBlur,
    openOnFocus,
    onInputChange,
    ...other
  } = props

  const {
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getPopupIndicatorProps,
    getClearProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    selectedOptions, // multiple=true を前提としているので Array
    dirty,
    id,
    popupOpen,
    focused,
    focusedTag,
    anchorEl,
    setAnchorEl,
    inputValue,
    groupedOptions,
  } = useAutocomplete({
    ...props,
    componentName: 'Autocomplete',
  })

  const getOptionLabel = (getOptionLabelProp ? getOptionLabelProp : (x: string) => x) as (
    option: Option
  ) => string

  let startAdornment: React.ReactNodeArray | React.ReactNode | null = null

  if (selectedOptions.length > 0) {
    const getCustomizedTagProps = (index: number) => ({
      className: clsx(classes.tag, {
        [classes.tagSizeSmall]: size === 'small',
      }),
      disabled,
      ...getTagProps(index),
    })

    if (renderTags) {
      startAdornment = renderTags(selectedOptions, getCustomizedTagProps)
    } else {
      startAdornment = selectedOptions.map((option: Option, index: number) => (
        <Chip
          key={index}
          label={getOptionLabel(option)}
          size={size}
          {...getCustomizedTagProps(index)}
          // {...ChipProps}
        />
      ))
    }
  }

  if (limitTags > -1 && Array.isArray(startAdornment)) {
    let startAdornmen_ = startAdornment as React.ReactNodeArray
    const more = startAdornment.length - limitTags
    if (!focused && more > 0) {
      startAdornmen_ = startAdornmen_.splice(0, limitTags)
      startAdornmen_.push(
        <span className={classes.tag} key={startAdornment.length}>
          {getLimitTagsText(more)}
        </span>
      )
      startAdornment = startAdornmen_
    }
  }

  //   const defaultRenderGroup = (params) => (
  //   <li key={params.key}>
  //     <ListSubheader className={classes.groupLabel} component="div">
  //       {params.group}
  //     </ListSubheader>
  //     <ul className={classes.groupUl}>{params.children}</ul>
  //   </li>
  // )

  // const renderGroup = renderGroupProp || defaultRenderGroup
  const defaultRenderOption = (props2: React.HTMLAttributes<HTMLLIElement>, option: Option) => (
    <li {...props2}>{getOptionLabel(option)}</li>
  )
  const renderOption = renderOptionProp || defaultRenderOption

  const renderListOption = (option: Option, index: number) => {
    const optionProps = getOptionProps({ option, index })

    return renderOption({ ...optionProps, className: classes.option }, option, {
      selected: optionProps['aria-selected'],
      inputValue,
    })
  }

  const hasClearIcon = !disableClearable && !disabled && dirty
  // const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false
  const hasPopupIcon = forcePopupIcon !== false

  return (
    <React.Fragment>
      <div
        ref={ref}
        className={clsx(
          classes.root,
          {
            [classes.focused]: focused,
            [classes.fullWidth]: fullWidth,
            [classes.hasClearIcon]: hasClearIcon,
            [classes.hasPopupIcon]: hasPopupIcon,
          },
          className
        )}
        {...getRootProps(other as any)}
      >
        {renderInput({
          // https://material-ui.com/api/text-field/#props
          id,
          disabled,
          fullWidth: true,
          size: size === 'small' ? 'small' : undefined,
          InputLabelProps: getInputLabelProps(),
          InputProps: {
            ref: setAnchorEl,
            className: classes.inputRoot,
            startAdornment,
            endAdornment: (
              <div className={classes.endAdornment}>
                {hasClearIcon ? (
                  <IconButton
                    {...getClearProps()}
                    aria-label={clearText}
                    title={clearText}
                    className={classes.clearIndicator}
                  >
                    {clearIcon}
                  </IconButton>
                ) : null}

                {hasPopupIcon ? (
                  <IconButton
                    {...getPopupIndicatorProps()}
                    disabled={disabled}
                    aria-label={popupOpen ? closeText : openText}
                    title={popupOpen ? closeText : openText}
                    className={clsx(classes.popupIndicator, {
                      [classes.popupIndicatorOpen]: popupOpen,
                    })}
                  >
                    {popupIcon}
                  </IconButton>
                ) : null}
              </div>
            ),
          },
          inputProps: {
            className: clsx(classes.input, {
              [classes.inputFocused]: focusedTag === -1,
            }),
            disabled,
            ...getInputProps(),
          },
        })}
      </div>
      {popupOpen && anchorEl ? (
        <PopperComponent
          className={clsx(classes.popper, {
            [classes.popperDisablePortal]: false,
          })}
          // prettier-ignore
          style={ anchorEl ? { width: anchorEl.clientWidth} : {} }
          role="presentation"
          anchorEl={anchorEl}
          open
        >
          <PaperComponent
            className={classes.paper}
            elevation={8} // add
          >
            {loading && groupedOptions.length === 0 ? (
              <div className={classes.loading}>{loadingText}</div>
            ) : null}
            {groupedOptions.length === 0 && !loading ? (
              <div className={classes.noOptions}>{noOptionsText}</div>
            ) : null}
            {groupedOptions.length > 0 ? (
              <ListboxComponent
                className={classes.listbox}
                {...getListboxProps()}
                {...ListboxProps}
              >
                {groupedOptions.map((option, index) => {
                  // if (groupBy) {
                  //   return renderGroup({
                  //     key: option.key,
                  //     group: option.group,
                  //     children: option.options.map((option2, index2) =>
                  //       renderListOption(option2, option.index + index2)
                  //     ),
                  //   })
                  // }
                  return renderListOption(option, index)
                })}
              </ListboxComponent>
            ) : null}
          </PaperComponent>
        </PopperComponent>
      ) : null}
    </React.Fragment>
  )
}
const Autocomplete = React.forwardRef(_Autocomplete) as <Option>(
  props: AutocompleteProps<Option> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement

// export default withStyles(styles, { name: 'MuiAutocomplete' })(Autocomplete)
export default Autocomplete

// https://next--material-ui.netlify.app/guides/typescript/#usage-of-withstyles
// Using withStyles in TypeScript can be a little tricky
// using the createStyles helper function to construct your style rules object is recommended:
