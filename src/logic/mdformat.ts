function table(headers: string[], data: any[]) {
  let rows = ''

  data.forEach(e => {
    const arr = []
    headers.forEach(header => {
      arr.push(e[header] ? e[header] : '')
    })
    rows += `|${arr.join('|')}|\n`
  })

  return `|**${headers.join('**|**')}**|\n|${'---|'.repeat(headers.length)}\n${rows}`
}

function h(str: string, val: number) {
  return `${'#'.repeat(val)} str`
}

export { table, h }
