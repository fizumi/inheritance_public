import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import { alpha } from '@material-ui/core/styles'
import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import { createStyles, makeStyles } from '@material-ui/styles'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSettingsDrawerOpen } from 'src/app/hooks'
import { useDateUtils } from '../redux/hooks'
import {
  selector as pseudoSpousesSelector,
  setArrowBigamous,
} from '../redux/slices/inheritance/cols/pseudoSpouses'
import { css } from '@emotion/react'

const useStyles = makeStyles((theme) =>
  createStyles({
    heading: {
      margin: '16px 0 8px',
    },
    toggleButtonGroup: {
      width: '100%',
    },
    toggleButton: {
      width: '100%',
      color: theme.palette.text.secondary,
      '&$toggleButtonSelected': {
        color: `${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        },
      },
    },
    toggleButtonSelected: {},
    icon: {
      marginRight: 8,
    },
  })
)

const AppSettingsDrawer: React.FC = () => {
  const classes = useStyles()
  const { settingsOpen, settingsDrawerClose } = useSettingsDrawerOpen()

  const { setDateDisplayType, dateDisplayTypeDict, dateDisplayType } = useDateUtils()

  const handleChangeDateDisplay = (_event: any, value: '和暦' | '西暦') => {
    setDateDisplayType(value)
  }

  const dispatch = useDispatch()

  return (
    <Drawer
      anchor="right"
      onClose={settingsDrawerClose}
      open={settingsOpen}
      css={css`
        .MuiDrawer-paper {
          min-width: 200px;
        }
      `}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h5">{'設定'}</Typography>
        <IconButton color="inherit" onClick={settingsDrawerClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ pl: 2, pr: 2 }}>
        <Typography gutterBottom id="settings-direction" className={classes.heading}>
          {'日付表示'}
        </Typography>
        <ToggleButtonGroup
          key={'日付表示'}
          exclusive
          value={dateDisplayType}
          onChange={handleChangeDateDisplay}
          className={classes.toggleButtonGroup}
        >
          <ToggleButton
            value={dateDisplayTypeDict.和暦}
            classes={{ root: classes.toggleButton, selected: classes.toggleButtonSelected }}
          >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{'和暦'}</Box>
          </ToggleButton>
          <ToggleButton
            value={dateDisplayTypeDict.西暦}
            aria-label={'settings.light'}
            classes={{ root: classes.toggleButton, selected: classes.toggleButtonSelected }}
          >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{'西暦'}</Box>
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography gutterBottom id="settings-direction" className={classes.heading}>
          {'重婚'}
        </Typography>
        <ToggleButtonGroup
          key={'重婚'}
          exclusive
          value={useSelector(pseudoSpousesSelector).arrowBigamous}
          onChange={(_, value) => dispatch(setArrowBigamous(value))}
          className={classes.toggleButtonGroup}
        >
          <ToggleButton
            value={false}
            classes={{ root: classes.toggleButton, selected: classes.toggleButtonSelected }}
          >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{'禁止'}</Box>
          </ToggleButton>
          <ToggleButton
            value={true}
            classes={{ root: classes.toggleButton, selected: classes.toggleButtonSelected }}
          >
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{'許容'}</Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Drawer>
  )
}

export default AppSettingsDrawer
