// https://github.com/react-csv/react-csv
import React from 'react'
import { toCSV, CSVMaterials } from 'src/utils/fp/common/csv'
import { buildURIforCSV } from 'src/utils/web'
import * as RA from 'ramda-adjunct'

// prettier-ignore
export type ClickHandler = {
  // SyncClickHandler
  ( event: React.MouseEvent<HTMLAnchorElement>) : boolean | void
  // AsyncClickHandler
  ( event: React.MouseEvent<HTMLAnchorElement>, done: (proceed: boolean) => void) : void
  // ( event: React.MouseEvent<HTMLAnchorElement>, done?: (proceed?: boolean) => void) : void
}

export type Props = CSVMaterials & {
  filename?: string
  uFEFF?: boolean
  onClick?: ClickHandler
  asyncOnClick?: boolean
}

export default function useCSVLink({
  filename = 'csv-data.csv',
  uFEFF = true,
  onClick,
  asyncOnClick = false,
  ...csvMaterias
}: Props) {
  const [href, setHref] = React.useState('')

  const csv = React.useRef<string>()

  React.useEffect(() => {
    csv.current = toCSV(csvMaterias)
    setHref(buildURIforCSV(csv.current, uFEFF))
  }, [csvMaterias, uFEFF])

  /**
   * In IE11 this method will trigger the file download
   */
  const handleLegacy = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // If this browser is IE 11, it does not support the `download` attribute
    if (RA.isFunction(window.navigator.msSaveOrOpenBlob)) {
      // Stop the click propagation
      event.preventDefault()

      if (!csv.current) return

      const blob = new Blob([uFEFF ? '\uFEFF' : '', csv.current])
      window.navigator.msSaveBlob(blob, filename)

      return false
    }
  }

  const handleAsyncClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const done = (proceed: boolean) => {
      if (proceed === false) {
        event.preventDefault()
        return
      }
      handleLegacy(event)
    }

    onClick && onClick(event, done)
  }

  const handleSyncClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const stopEvent = !!onClick && onClick(event)
    if (stopEvent) {
      event.preventDefault()
      return
    }
    handleLegacy(event)
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof onClick === 'function') {
      return asyncOnClick ? handleAsyncClick(event) : handleSyncClick(event)
    }
    handleLegacy(event)
  }

  return {
    download: filename,
    target: '_self',
    href: href,
    onClick: handleClick,
  }
}
