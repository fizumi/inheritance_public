import React from 'react'
import { useNameCount } from 'src/features/inheritance/hooks/formik/useNameCount'
import NextHead from 'next/head' // https://nextjs.org/docs/api-reference/next/head

const Head: React.FC = () => {
  const nameCount = useNameCount()
  return (
    <NextHead>
      <title>{(nameCount ? `(${nameCount}) ` : '') + '相続自動計算'}</title>
    </NextHead>
  )
}
export default Head
