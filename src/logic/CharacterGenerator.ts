/* eslint-disable @typescript-eslint/no-var-requires */
import _, { first } from 'lodash'
import { pullRandom } from './dataloader'

const exTitles = [
  {
    group: 'Laborer',
    content: [
      'Shipyard Custodian',
      'Printer Technician',
      'Asteroid Miner',
      'Starship Galley Cook',
      'Personal Trainer',
      'Firefighter',
      'Mech Mechanic',
    ],
    names: [
      ['Diasporan', 20],
      ['Cosmopolitan', 5],
      ['NHP', 0],
    ],
    aliases: [
      ['Nicknames', 5],
      ['Handles', 2],
      ['None', 20],
    ],
  },
  {
    group: 'Corporate Executive',
    content: [
      'Chief Executive Officer',
      'Chief Financial Officer',
      'Chairman',
      'Senior Executive Vice President',
      'Lead Administrator',
      'Torishimariyaku',
      'Buhoejang',
    ],
    names: [
      ['Diasporan', 20],
      ['NHP', 2],
    ],
    aliases: [
      ['Nicknames', 1],
      ['None', 20],
    ],
  },
]

const exNames = [
  {
    group: 'Diasporan',
    content: ['Bob', 'Alice'],
  },
  {
    group: 'Cosmopolitan',
    content: ['Jimmy Space', 'Annie Starfarer'],
  },
  {
    group: 'NHP',
    content: ['NHP GUY', 'NHP GIRL'],
  },
]

const exAlias = [
  {
    group: 'Nicknames',
    content: ['Buddy', 'Pal', 'Dumb Baby Bitch'],
  },
  {
    group: 'Handles',
    content: ['Beef', 'Sweetwater'],
  },
  {
    group: 'None',
    content: [],
  },
]

const exTemplate = {
  Name: 'Cosmopolitan',
  Titles: [
    { group: 'Laborer', weight: 9 },
    { group: 'Corporate Executive', weight: 1 },
  ],
}

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
      ref: 'themself',
    },
  },
]

type GeneratorContentCollection = {
  group: string
  content: string[]
}

type WeightedPool = {
  group: string
  weight: number
}

type GeneratorTemplate = {
  Name: string
  Titles: WeightedPool[]
}

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
  public preset = null
  public gender = null
  public background = null
  public society = null
  public physicality = null
  public namePrefix = ''
  public nameSuffix = ''
  public firstname = ''
  public middlename = ' '
  public lastname = ''
  public housename = ''
  public physicalAppearance = ''
  public societyAppearance = ''

  public async Generate(preset: GeneratorTemplate): string {
    this.preset = preset
    // first get a title. templates have pools of titles (applicable jobs)
    // title determines alias and name pool
    // title can overrwite name/alias (no alias/unknown name, etc)
    this.gender = genders[this.weightedSelection(genders)]
    await this.getName()

    this.background = this.getRandom(preset.background_selections)

    this.society = require(`@/assets/data/character/societies/${this.background}.json`)

    this.housename = pullRandom('character/names/housenames', 1) // only used for barony

    const p = this.getRandom(preset.physicality_selections)

    this.physicality = require(`@/assets/data/character/physicalities/${p}_${this.gender.name}.json`)

    this.physicalAppearance = this.generatePhysicalAppearance()

    this.societyAppearance = `${_.sample(this.society.appearance)}.`

    const extras = [...this.society.appearance_extra]

    for (let index = this.intBetween(0, 3); index > 0; index--) {
      const e = extras.splice(this.intBetween(0, extras.length))[0]
      if (e) this.societyAppearance += `\n${this.capitalize(e)}.`
    }

    for (const k in this.preset.overrides) {
      if (this[k]) this[k] = this.preset.overrides[k]
    }

    const out = `${this.fullName} (${this.gender.pronouns.sub}/${this.gender.pronouns.obj})\n${this.background}\n\nAppearance:\n${this.appearance}`

    return this.processText(out)
  }

  private processText(input: string, extraInserts?: Map<string, string[]>): string {
    let out = input
    // get multiple selections
    const choiceRegex = /(?<=\[)(.*?)(?=\])/g
    const matchedChoices = out.match(choiceRegex) || []
    matchedChoices.forEach(str => {
      const cArr = str.split('|')
      const choice = _.sample(cArr)
      out = out.replace(`[${str}]`, choice)
    })

    //split by | and make selections
    //get inserts
    const insertRegex = /(?<=\{)(.*?)(?=\})/g
    const matchedInserts = out.match(insertRegex) || []
    matchedInserts.forEach(str => {
      const replace = this.replaceStr(str, extraInserts)
      out = out.replace(`{${str}}`, replace)
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
      case 'housename':
        return this.housename
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
    return this.capitalize(`${this.physicalAppearance}\n${this.societyAppearance}`)
  }

  private generatePhysicalAppearance(): string {
    const template = _.sample(this.physicality.base)
    console.log('ptemplate:', template)

    return this.processText(template, new Map(Object.entries(this.physicality)))
  }

  private async getName(): Promise<void> {
    const g =
      this.gender.name === 'person' ? (Math.random > 0.5 ? 'man' : 'woman') : this.gender.name

    const firstnames = pullRandom(`character/names/basic/${g}`, 8)
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

  // private pull(preset: GeneratorTemplate, group: string) {
  //   return ''
  //   // return this.weightedSelection(preset.Pools.filter(x => x.group === group))
  // }
}

export { CharacterGenerator, GeneratorTemplate }
