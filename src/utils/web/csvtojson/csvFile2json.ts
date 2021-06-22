// csvtojson alternative : https://github.com/ramda/ramda/wiki/Cookbook#convert-a-list-of-property-lists-with-header-into-a-list-of-objects
import csvtojson from 'csvtojson'

export const csvFile2json = <Row extends { [key: string]: unknown }>(file: File) => {
  return new Promise<Row[]>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        return csvtojson({
          output: 'json',
        })
          .fromString(text)
          .on('error', (err) => {
            console.log(err)
          })
          .then(resolve)
      }
      return
    }
    reader.readAsText(file)
  })
}
