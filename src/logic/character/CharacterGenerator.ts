/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash'
import { pullRandom, inject } from '../dataloader'
import { weightedSelection, intBetween, floatBetween, capitalize } from '../util'

// defined again here to satisfy require
function getRandom(arr: any[]): any {
  return arr[Math.floor(Math.random() * arr.length)]
}

const genders = [
  {
    name: 'man',
    weight: 48,
    pronouns: {
      sub: 'he',
      obj: 'him',
      pos: 'his',
      ref: 'himself',
    },
    replace: 'man',
  },
  {
    name: 'woman',
    weight: 46,
    pronouns: {
      sub: 'she',
      obj: 'her',
      pos: 'her',
      ref: 'herself',
    },
    replace: 'woman',
  },
  {
    name: 'person',
    weight: 6,
    pronouns: {
      sub: 'they',
      obj: 'them',
      pos: 'their',
      ref: 'themselves',
    },
  },
]

const baseNameMods = {
  extraName: [0.02],
  extraSurname: [0.1],
  middleNameChance: 0.05,
  suffixChance: 0.1,
  suffixes: ['II', 'III', 'IV', 'V', 'VI', 'VII'],
}

class CharacterGenerator {
  // search syntax:
  // {xxxx} sample from array xxx
  // [aaa|bbb|ccc] sample from a,b,c
  // {fff%10} sample fff 10% of the time
  // #{pppp}# sample from textfile at path pppp
  // @{pppp}@ substitute textfile at path pppp
  // $xxxx{zzzz}$ set map xxxx from selection zzzz

  // TODO: search syntax:
  // [aaa:1|bbb:3|ccc:2] sample from a,b,c with weights 1,3,2
  // <zzzz.qqqq> sample from json object at path zzzz, array qqqq

  // TODO: capitalize hint: +{}+

  // generate alignment, choose items based on alignment

  public preset = null
  public gender = null
  public society = null
  public background = null
  public occupation = null
  public physicality = null
  public affiliation = null

  public valueMap = new Map<string, string>()

  public grammaticalGender = 'man'
  // public namePrefix = ''
  // public nameSuffix = ''
  // public firstname = ''
  // public middlename = ' '
  // public lastname = ''
  // public nickname = ''
  public jobtitle = ''

  public async Generate(preset: any): Promise<string> {
    this.preset = preset

    this.gender = genders[weightedSelection(genders)]
    this.grammaticalGender = this.gender.replace
    if (!this.grammaticalGender)
      this.grammaticalGender = _.sample(genders.filter(x => !!x.replace).map(x => x.replace))

    this.background = require(`@/assets/data/character/backgrounds/${getRandom(
      preset.background_selections
    )}.json`)

    this.occupation = require(`@/assets/data/character/occupations/${_.sample(
      this.background.occupations
    )}.json`)

    this.jobtitle = _.sample(this.occupation.title)

    this.society = require(`@/assets/data/character/societies/${getRandom(
      preset.society_selections
    )}.json`)

    if (preset.physicality_selections)
      this.physicality = require(`@/assets/data/character/physicalities/${getRandom(
        preset.physicality_selections
      )}.json`)

    const affiliationName = this.background.affiliations
      ? _.sample(
          this.society.affiliations.filter(x =>
            this.background.affiliations.some(y => y === x.name)
          )
        )
      : _.sample(this.society.affiliations)

    this.affiliation = require(`@/assets/data/character/affiliations.json`).find(
      x => x.name === affiliationName
    )

    // this.initializeValueMap(['name'])

    // console.log(this.valueMap)

    // await this.getName()

    // let out = `# ${this.fullName} (${this.gender.pronouns.sub}/${this.gender.pronouns.obj})
    let out = `#{name} (${this.gender.pronouns.sub}/${this.gender.pronouns.obj})
## ${this.jobtitle} 
{firstname} {lastname} {jobtitle}
---

## Appearance
${this.generateField('physicality', 3)}

${this.generateField('clothing', 3)}

## Occupation
${this.generateField('occupation', 3)}

## Personality
${this.generateField('personality', 3)}
${this.generateField('opinions', 0)}
${this.generateField('ideals', 0)}
${this.generateField('flaws', 0)}


## History
${this.generateField('history_early', 2)}
${this.generateField('history_middle', 2)}
${this.generateField('history_recent', 3)}

## Relationships
${this.generateField('relationships', 3, true)}
`

    out = this.removeEscapes(out)

    out = this.keywordReplace(out)

    if (Math.random() > 0.2) {
      const s = _.sample(this.replaceMap.get('secrets'))
      if (s) out += `\n## Secrets\n${s}.`
    }

    out = this.setValueMap(out)

    // let limit = 100
    // while (limit > 0 && out.includes('}$')) {
    //   console.log('left: ', limit)
    //   out = this.setValueMap(out)
    //   limit--
    // }

    let limit = 100
    while (limit > 0 && (out.includes('|') || out.includes('[') || out.includes('{'))) {
      out = this.setValueMap(out)
      out = this.poolSelectText(out)
      limit--
    }

    console.log(this.valueMap)

    return this.finalizeText(out)
  }

  private removeEscapes(input: string): string {
    return input.replaceAll('\\\\', '\\')
  }

  private keywordReplace(input: string): string {
    let out = input
    out = out.replaceAll('%gender', this.grammaticalGender)

    return out
  }

  private get replaceMap(): Map<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    function prepMap(o: object): Map<string, any[]> {
      const n = { ...o }
      for (const key in n) {
        if (n[`${key}_${self.grammaticalGender}`]) {
          n[key] = [...n[key], ...n[`${key}_${self.grammaticalGender}`]]
          delete n[`${key}_${self.grammaticalGender}`]
        }
      }
      return new Map(Object.entries(n))
    }

    const map = this.mapUnion(
      prepMap(this.preset),
      prepMap(this.society),
      prepMap(this.background),
      prepMap(this.occupation),
      prepMap(this.physicality),
      prepMap(this.affiliation)
    )

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
    let out = input.replace(/(^|\. *)([a-z])/g, function(match, separator, char) {
      return separator + char.toUpperCase()
    })
    out = out.replaceAll('  ', ' ')
    return out
  }

  private setValueMap(input: string): string {
    let out = input
    // set map : $key{values}$
    // collect key
    const keynameRegex = /(?<=(?<!\\)\$)(.*?)(?={)/g
    const key = out.match(keynameRegex)?.at(0) || ''

    if (!key) return out

    // collect replacement set
    const keyvalRegex = new RegExp('(?<=\\$' + key + '{)(.*?)(?=}\\$)', 'g')
    const replaceVal = out.match(keyvalRegex)?.at(0) || ''

    // clear key setter
    out = out.replace(`$${key}{`, '{')
    out = out.replace(`}$`, '}')

    // replace value selection set with valuemap key
    out = out.replace(replaceVal, key)

    // const val = this.poolSelectText(`{${replaceVal}}`).replace(/[{}]/g, '')

    let val = replaceVal

    let limit = 25
    while (limit > 0 && (out.includes('|') || out.includes('[') || out.includes('{'))) {
      val = this.poolSelectText(`${replaceVal}`)
      limit--
    }
    // const val = this.poolSelectText(`{${replaceVal}}`)

    console.log(val)

    this.valueMap.set(key, val)

    if (this.valueMap.has(key)) {
      console.info('valuemap includes ', key, 'skipping...')
      return out
    }

    return out
  }

  // private initializeValueMap(keys: string[]) {
  //   const str = keys.map(k => `{${k}}`).join(' ')
  //   this.setValueMap(this.poolSelectText(str))
  // }

  private poolSelectText(input: string): string {
    let out = input
    // basic multi-select: []
    const choiceRegex = /(?<=(?<!\\)\[)(.*?)(?=\])/g
    const matchedChoices = out.match(choiceRegex) || []
    matchedChoices.forEach(s => {
      const str = this.keywordReplace(s)
      const cArr = str.split('|')
      const choice = _.sample(cArr)
      out = out.replace(`[${s}]`, choice)
    })

    // prop lookup: {}
    const insertRegex = /(?<=(?<!\\)\{)(.*?)(?=\})/g
    const matchedInserts = out.match(insertRegex) || []
    matchedInserts.forEach(s => {
      const str = this.keywordReplace(s)
      const pct = str.split('%')
      if (pct.length > 1) {
        if (floatBetween(0, 100) > Number(pct[1])) {
          out = out.replace(`{${s}}`, '')
        } else {
          const replace = this.replaceStr(pct[0])
          out = out.replace(`{${s}}`, replace)
        }
      } else {
        const replace = this.replaceStr(str)
        out = out.replace(`{${s}}`, replace)
      }
    })

    //list lookup : #{}#
    const lookupRegex = /(?<=(?<!\\)#{)(.*?)(?=}#)/g
    const lookupInserts = out.match(lookupRegex) || []
    lookupInserts.forEach(s => {
      const str = this.keywordReplace(s)
      out = out.replace(`#{${s}}#`, pullRandom(str, 1)[0])
    })

    //substitute lookup : @{}@
    const subRegex = /(?<=(?<!\\)@{)(.*?)(?=}@)/g
    const subInserts = out.match(subRegex) || []
    subInserts.forEach(s => {
      const str = this.keywordReplace(s)
      out = out.replace(`@{${s}}@`, inject(str))
    })

    return out
  }

  private replaceStr(input: string): string {
    if (Array.from(this.replaceMap.keys()).some(x => x === input))
      return _.sample(this.replaceMap.get(input))

    if (Array.from(this.valueMap.keys()).some(x => x === input)) {
      return this.valueMap.get(input)
    }

    // TODO: replace this with a map, like above. build map from multiple sources
    switch (input) {
      // case 'fullname':
      //   return `${this.firstname}${this.middlename} ${this.lastname}`
      case 'hon':
        return this.gender.name === 'man' ? 'Lord' : this.gender.name === 'woman' ? 'Lady' : 'Peer'
      // case 'firstname':
      //   return this.nickname ? this.nickname : this.firstname
      case 'pro_ref':
        return this.gender.pronouns.ref
      case 'pro_sub':
        return this.gender.pronouns.sub
      case 'pro_pos':
        return this.gender.pronouns.pos
      case 'pro_obj':
        return this.gender.pronouns.obj
      case 'gender':
        return this.gender.name
      case 'gen_name_family':
        return `${this.genName(true)} {lastname}`
      case 'gen_name':
        return this.genName()
      // case 'jobtitle':
      //   return this.jobtitle
      default:
        return `{${input}}`
    }
  }

  // private get fullName(): string {
  //   return capitalize(
  //     `${this.namePrefix}${this.firstname}${this.middlename} ${this.lastname}${this.nameSuffix}`
  //   )
  // }

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

  private genName(firstOnly?: boolean, gender?: string): string {
    // TODO: nicknames
    let name = ''

    const g = gender || _.sample(['man', 'woman'])
    const firstnames = pullRandom(`character/names/basic/${g}`, 8)
    const lastnames = pullRandom('character/names/basic/surname', 8)

    let nameMods = this.replaceMap.get('name_mods') as any
    if (!nameMods) nameMods = baseNameMods

    name = firstnames[0]

    if (nameMods.extraName)
      nameMods.extraName.forEach((c, i) => {
        if (Math.random() < c) name += ` ${firstnames[i + 1]}`
      })

    if (firstOnly) return name

    name += ` ${lastnames[0]}`

    if (nameMods.extraSurname)
      nameMods.extraSurname.forEach((c, i) => {
        if (Math.random() < c) name += `-${lastnames[i + 1]}`
      })

    if (nameMods.suffixChance)
      if (Math.random() < nameMods.suffixChance) {
        name += ` ${_.sample(nameMods.suffixes)}`
      }

    if (nameMods.prefixChance)
      if (Math.random() < nameMods.prefixChance) {
        name = `${_.sample(nameMods.prefixes)} ${name}`
      }

    return name
  }

  // private async getName(): Promise<void> {
  //   // TODO: nicknames

  //   const firstnames = pullRandom(`character/names/basic/${this.grammaticalGender}`, 8)
  //   const lastnames = pullRandom('character/names/basic/surname', 8)

  //   let nameMods = this.replaceMap.get('name_mods') as any
  //   if (!nameMods) nameMods = baseNameMods

  //   this.firstname = firstnames[0]

  //   if (nameMods.extraName)
  //     nameMods.extraName.forEach((c, i) => {
  //       if (Math.random() < c) this.middlename += ` ${firstnames[i + 1]}`
  //     })

  //   this.lastname = `${lastnames[0]}`

  //   if (nameMods.extraSurname)
  //     nameMods.extraSurname.forEach((c, i) => {
  //       if (Math.random() < c) this.lastname += `-${lastnames[i + 1]}`
  //     })

  //   if (nameMods.suffixChance)
  //     if (Math.random() < nameMods.suffixChance) {
  //       this.nameSuffix += `${_.sample(nameMods.suffixes)}`
  //     }

  //   if (nameMods.prefixChance)
  //     if (Math.random() < nameMods.prefixChance) {
  //       this.namePrefix = `${_.sample(nameMods.prefixes)} ${this.namePrefix}`
  //     }
  // }
}

export { CharacterGenerator }
