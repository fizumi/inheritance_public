import React from 'react'
import { Button, ButtonProps } from '@material-ui/core'

const MyButton: React.FC<ButtonProps> = ({ children, ...other }) => {
  return (
    <Button
      type="button" // https://stackoverflow.com/a/44254127
      variant="contained"
      {...other}
    >
      {children}
    </Button>
  )
}
export default MyButton
