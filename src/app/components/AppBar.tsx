// https://next--material-ui.netlify.app/components/app-bar/#app-bar-with-a-primary-search-field
import { css } from '@emotion/react'
import AppBar from '@material-ui/core/AppBar'
import Badge from '@material-ui/core/Badge'
import IconButton from '@material-ui/core/IconButton'
import { alpha, Theme } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import AccountCircle from '@material-ui/icons/AccountCircle'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import SettingsIcon from '@material-ui/icons/Settings'
import { createStyles, makeStyles } from '@material-ui/styles'
import { useRouter } from 'next/router'
import * as React from 'react'
import { fontFamily } from 'src/app/styles/static'
import { useSettingsDrawerOpen } from 'src/app/hooks'
import { useSearchMordal } from '../hooks/useSearchMordal'
import Link from 'next/link' // https://nextjs.org/learn/basics/navigate-between-pages/link-component

const MyAppBar: React.FC = ({ children }) => {
  const classes = useStyles()
  const router = useRouter()

  const { toggleSerchMordal } = useSearchMordal()
  const menuId = 'primary-search-account-menu'

  const { settingsDrawerOpen } = useSettingsDrawerOpen()

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={function TODO() {
              alert('未実装')
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            className={classes.title}
            variant="h6"
            noWrap
            component="div"
            css={css`
              font-family: ${fontFamily};
            `}
          >
            <Link href="/">
              <a>相続自動計算</a>
            </Link>
          </Typography>
          <div
            css={css`
              display: flex;
              flex-grow: 1;
              justify-content: flex-end;
            `}
          >
            {router.pathname.includes('/inheritance') ? (
              <>
                <IconButton aria-label="search" color="inherit" onClick={toggleSerchMordal}>
                  <SearchIcon />
                </IconButton>
                <IconButton aria-label="mails" color="inherit" onClick={settingsDrawerOpen}>
                  <Badge badgeContent={0} color="secondary">
                    <SettingsIcon />
                  </Badge>
                </IconButton>
              </>
            ) : null}
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              // onClick={handleProfileMenuOpen}
              color="inherit"
              onClick={function TODO() {
                alert('未実装')
              }}
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}

export default MyAppBar

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
  })
)
