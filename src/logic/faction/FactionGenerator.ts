/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash'
import { pullRandom, inject } from '../dataloader'
import { intBetween, floatBetween, capitalize } from '../util'

// defined again here to satisfy require
function getRandom(arr: any[]): any {
  return arr[Math.floor(Math.random() * arr.length)]
}

class FactionGenerator {
  public preset = null

  public async Generate(preset: any): Promise<string> {
    this.preset = preset

    let out = `# faction name
## faction type

---
## History

## Ideology

## Leadership

## Influence
`

    let limit = 100
    while (limit > 0 && (out.includes('|') || out.includes('[') || out.includes('{'))) {
      out = this.poolSelectText(out)
      limit--
    }

    return this.finalizeText(out)
  }

  private get replaceMap(): Map<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    function prepMap(o: object): Map<string, any[]> {
      const n = { ...o }
      return new Map(Object.entries(n))
    }

    const map = this.mapUnion(prepMap(this.preset))

    return map
  }

  private mapUnion(...maps: Map<string, any[]>[]): Map<string, any> {
    const out = new Map<string, any>()
    maps.forEach(m => {
      for (const key of m.keys()) {
        if (out.has(key)) out.set(key, [...m.get(key), ...out.get(key)])
        else out.set(key, m.get(key))
      }
    })
    return out
  }

  private finalizeText(input: string): string {
    return input.replace(/(^|\. *)([a-z])/g, function(match, separator, char) {
      return separator + char.toUpperCase()
    })
  }

  private poolSelectText(input: string): string {
    let out = input
    // basic multi-select: []
    const choiceRegex = /(?<=\[)(.*?)(?=\])/g
    const matchedChoices = out.match(choiceRegex) || []
    matchedChoices.forEach(str => {
      const cArr = str.split('|')
      const choice = _.sample(cArr)
      out = out.replace(`[${str}]`, choice)
    })

    // prop lookup: {}
    const insertRegex = /(?<=\{)(.*?)(?=\})/g
    const matchedInserts = out.match(insertRegex) || []
    matchedInserts.forEach(str => {
      const pct = str.split('%')
      if (pct.length > 1) {
        if (floatBetween(0, 100) > Number(pct[1])) {
          out = out.replace(`{${str}}`, '')
        } else {
          const replace = this.replaceStr(pct[0])
          out = out.replace(`{${str}}`, replace)
        }
      } else {
        const replace = this.replaceStr(str)
        out = out.replace(`{${str}}`, replace)
      }
    })

    //list lookup : #{}#
    const lookupRegex = /(?<=#{)(.*?)(?=}#)/g
    const lookupInserts = out.match(lookupRegex) || []
    lookupInserts.forEach(str => {
      out = out.replace(`#{${str}}#`, pullRandom(str, 1)[0])
    })

    //substitute lookup : @{}@
    const subRegex = /(?<=@{)(.*?)(?=}@)/g
    const subInserts = out.match(subRegex) || []
    subInserts.forEach(str => {
      out = out.replace(`@{${str}}@`, inject(str))
    })

    return out
  }

  private replaceStr(input: string): string {
    if (Array.from(this.replaceMap.keys()).some(x => x === input))
      return _.sample(this.replaceMap.get(input))

    return `{${input}}`
  }

  private generateField(key: string, maxExtras: number, list?: boolean): string {
    let out = ''

    const l = list ? '- ' : ''

    if (this.replaceMap.has(key) && this.replaceMap.get(key).length)
      out = `${l}${_.sample(this.replaceMap.get(key))}${list ? '\n' : '.'}`

    if (!this.replaceMap.has(`${key}_extra`)) return out

    const extras = [...this.replaceMap.get(`${key}_extra`)]

    if (!extras) return out

    for (let i = intBetween(0, maxExtras); i < extras.length; i++) {
      const e = extras.splice(intBetween(0, extras.length - 1), 1)[0]
      if (e) out += `${l} ${capitalize(e)}${list ? '\n' : '.'}`
    }

    return out
  }
}

export { FactionGenerator }
