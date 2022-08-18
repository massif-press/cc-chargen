import _ from 'lodash'
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
    name: 'male',
    weight: 48,
    pronouns: {
      sub: 'He',
      obj: 'Him',
      pos: 'His',
      ref: 'Himself',
    },
  },
  {
    name: 'female',
    weight: 46,
    pronouns: {
      sub: 'She',
      obj: 'Her',
      pos: 'Hers',
      ref: 'Herself',
    },
  },
  {
    name: 'nb',
    weight: 6,
    pronouns: {
      sub: 'They',
      obj: 'Them',
      pos: 'Theirs',
      ref: 'Themself',
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
  public async Generate(preset: GeneratorTemplate): string {
    // first get a title. templates have pools of titles (applicable jobs)
    // title determines alias and name pool
    // title can overrwite name/alias (no alias/unknown name, etc)
    console.log(preset)
    const gender = genders[this.weightedSelection(genders)]
    const name = await this.getName(gender.name)

    const background = this.getRandom(preset.background_selections)

    return `${name} (${gender.pronouns.sub}/${gender.pronouns.obj}) // ${background}`

    // console.log(preset)

    // const titleGroup = preset.Titles[this.weightedSelection(preset.Titles)]
    // const titleSelections = exTitles.find(x => x.group === titleGroup.group)

    // console.log(titleSelections)

    // const title = _.sample(titleSelections?.content)

    // return title

    // const data = {
    //   id: uuid(),
    //   name: this.pull(preset, 'Name'),
    //   alias: this.pull(preset, 'Alias'),
    //   title: this.pull(preset, 'Title'),
    // } as ICharacterData

    // return new Character().Update(data)
  }

  private async getName(gender: string): Promise<string> {
    const g = gender === 'nb' ? (Math.random > 0.5 ? 'female' : 'male') : gender

    const firstnames = pullRandom(`character/names/basic/${g}`, 2)
    const lastnames = pullRandom('character/names/basic/surname', 2)
    let name =
      Math.random() <= nameMods.middleNameChance
        ? `${firstnames[0]} ${firstnames[1]}`
        : `${firstnames[0]}`
    name +=
      Math.random() <= nameMods.secondSurnameChance
        ? ` ${lastnames[0]}-${lastnames[1]}`
        : ` ${lastnames[0]}`

    if (Math.random() <= nameMods.suffixChance) name += ` ${_.sample(nameMods.suffixes)}`

    return name
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

  // private pull(preset: GeneratorTemplate, group: string) {
  //   return ''
  //   // return this.weightedSelection(preset.Pools.filter(x => x.group === group))
  // }
}

export { CharacterGenerator, GeneratorTemplate }
