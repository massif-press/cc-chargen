/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash'
import { pullRandom } from './dataloader'

const genders: WeightedItem[] = [
  {
    name: 'man',
    weight: 48,
    pronouns: {
      sub: 'he',
      obj: 'him',
      pos: 'his',
      ref: 'himself',
    },
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

interface WeightedItem {
  weight: number
}

const nameMods = {
  middleNameChance: 0.05,
  secondSurnameChance: 0.08,
  suffixChance: 0.1,
  suffixes: ['II', 'III', 'IV', 'V', 'VI', 'VII'],
}

class CharacterGenerator {
  // TODO: collect all pools in one object, and make all selections from those pools (probably one-at-a-time)

  // TODO: search syntax:
  // {xxxx} sample from array xxx
  // [aaa|bbb|ccc] sample from a,b,c
  // [aaa:1|bbb:3|ccc:2] sample from a,b,c with weights 1,3,2
  // %pppp% sample from textfile at path pppp
  // <zzzz.qqqq> sample from json object at path zzzz, array qqqq

  // check for circular references

  // generate alignment, choose items based on alignment

  public preset = null
  public gender = null
  public society = null
  public background = null
  public physicality = null
  public affiliation = null
  public genderSetname = 'man'
  public namePrefix = ''
  public nameSuffix = ''
  public firstname = ''
  public middlename = ' '
  public lastname = ''
  public minorHousename = ''
  public majorHousename = ''
  public physicalAppearance = ''
  public backgroundAppearance = ''
  public occupation = ''

  public async Generate(preset: GeneratorTemplate): string {
    this.preset = preset
    // first get a title. templates have pools of titles (applicable jobs)
    // title determines alias and name pool
    // title can overrwite name/alias (no alias/unknown name, etc)
    this.gender = genders[this.weightedSelection(genders)]
    this.genderSetname =
      this.gender.name === 'person' ? (Math.random() > 0.5 ? 'man' : 'woman') : this.gender.name

    await this.getName()

    this.background = require(`@/assets/data/character/backgrounds/${this.getRandom(
      preset.background_selections
    )}.json`)

    this.society = require(`@/assets/data/character/societies/${this.getRandom(
      preset.society_selections
    )}.json`)

    this.physicality = require(`@/assets/data/character/physicalities/${this.getRandom(
      preset.physicality_selections
    )}.json`)

    this.affiliation = _.sample(
      this.society.affiliations.filter(x => this.background.affiliations.some(y => y === x.name))
    )

    console.log(this.affiliation)

    if (this.preset.name === 'Baronic Noble') {
      const houses = require('@/assets/data/character/names/housenames')
      this.minorHousename = _.sample(houses.minor)
      this.majorHousename = _.sample(houses.major)
    }

    console.log(this.background, this.society, this.physicality)

    for (const k in this.preset.overrides) {
      if (Object.hasOwn(this, k)) this[k] = _.sample(this.preset.overrides[k])
    }

    let out = `${this.fullName} (${this.gender.pronouns.sub}/${this.gender.pronouns.obj})\n${this.occupation}`

    this.physicalAppearance = this.generatePhysicalAppearance()

    this.backgroundAppearance = `${_.sample(this.background.appearance)}.`

    const extras = [...this.background.appearance_extra]

    for (let index = this.intBetween(0, 3); index > 0; index--) {
      const e = extras.splice(this.intBetween(0, extras.length - 1), 1)[0]
      if (e) this.backgroundAppearance += ` ${this.capitalize(e)}.`
    }

    out += `\n\nAppearance:\n${this.appearance}`

    if (Math.random() > 0) {
      out += `\n\nSecrets:\n${_.sample(this.background.secrets)}`
    }

    return this.processText(out)
  }

  private processText(input: string, extraInserts?: Map<string, string[]>): string {
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
      const replace = this.replaceStr(str, extraInserts)
      out = out.replace(`{${str}}`, replace)
    })

    //list lookup : <>
    const lookupRegex = /(?<=<)(.*?)(?=>)/g
    const lookupInserts = out.match(lookupRegex) || []
    lookupInserts.forEach(str => {
      const sel = pullRandom(str, 1)
      out = out.replace(`<${str}>`, sel)
    })

    return out
  }

  private replaceStr(input: string, extraInserts?: Map<string, string[]>): string {
    if (extraInserts) {
      if (Array.from(extraInserts.keys()).includes(input)) return _.sample(extraInserts.get(input))
    }

    // todo: replace this with a map, like above. build map from multiple sources
    switch (input) {
      case 'fullname':
        return `${this.firstname}${this.middlename}${this.lastname}`
      case 'hon':
        return this.gender.name === 'man' ? 'Lord' : this.gender.name === 'woman' ? 'Lady' : 'Peer'
      case 'name':
        return this.firstname
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
      case 'minor_housename':
        return this.minorHousename
      case 'major_housename':
        return this.majorHousename
      default:
        return `{${input}}`
    }
  }

  private get fullName(): string {
    return this.capitalize(
      `${this.namePrefix}${this.firstname}${this.middlename}${this.lastname}${this.nameSuffix}`
    )
  }

  private get appearance(): string {
    return this.capitalize(`${this.physicalAppearance}\n\n${this.backgroundAppearance}`)
  }

  private generatePhysicalAppearance(): string {
    // expand template selections with choices from background:
    const tSelections = [
      ...(this.physicality.base || []),
      ...(this.physicality[`base_${this.genderSetname}`] || []),
      ...(this.background.physicality || []),
      ...(this.background[`physicality_${this.genderSetname}`] || []),
    ]

    const template = _.sample(tSelections)

    let out = `${template}`

    const keys = Object.keys(this.physicality)

    //expand physicality w/ gendered traits
    for (const k of keys) {
      if (Object.hasOwn(this.physicality, `${k}_${this.genderSetname}`)) {
        this.physicality[k] = [
          ...this.physicality[k],
          ...this.physicality[`${k}_${this.genderSetname}`],
        ]
      }
    }

    const pExtras = [...this.physicality.extra, ...this.background.physicality_extra]

    for (let i = this.intBetween(0, 3); i < pExtras.length; i++) {
      const e = pExtras.splice(this.intBetween(0, pExtras.length - 1), 1)[0]
      if (e) out += ` ${this.capitalize(e)}.`
    }

    return this.processText(out, new Map(Object.entries(this.physicality)))
  }

  private async getName(): Promise<void> {
    const firstnames = pullRandom(`character/names/basic/${this.genderSetname}`, 8)
    const lastnames = pullRandom('character/names/basic/surname', 8)
    if (this.preset.name_mods) {
      this.firstname = firstnames[0]
      this.preset.name_mods.extraName.forEach((c, i) => {
        if (Math.random() < c) this.middlename += `${i === 0 ? '' : ' '}${firstnames[i + 1]}`
      })

      this.lastname = ` ${lastnames[0]}`

      this.preset.name_mods.extraSurname.forEach((c, i) => {
        if (Math.random() < c) this.lastname += `-${lastnames[i + 1]}`
      })

      if (Math.random() < this.preset.name_mods.suffixChance) {
        this.nameSuffix += `${_.sample(this.preset.name_mods.suffixes)}`
      }

      if (Math.random() < this.preset.name_mods.prefixChance) {
        this.namePrefix = `${_.sample(this.preset.name_mods.prefixes)} ${name}`
      }
    } else {
      this.firstname = firstnames[0]
      if (Math.random() <= nameMods.middleNameChance) this.middlename = firstnames[1]
      this.lastname = lastnames[0]
      if (Math.random() <= nameMods.secondSurnameChance) this.lastname += `-${lastnames[1]}`

      if (Math.random() <= nameMods.suffixChance)
        this.nameSuffix += ` ${_.sample(nameMods.suffixes)}`
    }
  }

  private weightedSelection(collection: WeightedItem[]) {
    const arr = []
    const totalWeight = collection.reduce((n, { weight }) => n + weight, 0)
    for (const i in collection) {
      for (let j = 0; j < collection[i].weight * totalWeight; j++) {
        arr.push(i)
      }
    }
    return this.getRandom(arr)
  }

  private getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  private intBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  private capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export { CharacterGenerator }
