import _ from 'lodash';
import { GeneratorLibrary } from './generatorLibrary';
import { LibraryData } from './libraryData';
import { cLog } from './util';

interface WeightedItem {
  weight: number;
}

interface templateItem {
  templates: string[];
}

class Generator {
  public Library: GeneratorLibrary;
  public ValueMap: Map<string, string[]>;

  constructor(library?: GeneratorLibrary) {
    if (library) this.Library = library;
    this.ValueMap = new Map<string, string[]>();
  }

  public LoadLibrary(library: GeneratorLibrary) {
    const start = new Date().getTime();

    this.Library = library;

    library.Content.forEach((e: LibraryData) => {
      if (e.definitions) {
        for (const def in e.definitions) {
          this.Define(def, e.definitions[def]);
        }
      }
      if (e.values) {
        for (const prop in e.values) {
          this.AddValueMap(prop, e.values[prop]);
        }
      }
      if (e.templates) {
        e.templates.forEach((t) => {
          this.AddValueMap(e.key, t);
        });
      }
    });

    let ms = (new Date().getTime() - start).toString();
    if (ms === '0') ms = '<1';
    cLog(`⏱️ Library loaded in ${ms}ms`);
  }

  public Generate(template?: string | string[] | templateItem): string {
    if (!this.Library) {
      cLog(
        '🈳 No library loaded! Load a GeneratorLibrary with the LoadLibrary function',
        'error'
      );
      return '';
    }

    let baseTemplate;
    if (typeof template === 'string') baseTemplate = template;
    else if (Array.isArray(template)) baseTemplate = _.sample(template);
    else {
      if (!template) template = _.sample(this.Library.Content) as templateItem;
      baseTemplate = _.sample(template.templates);
    }

    // define-replace loop
    // out
    console.log(this.Library);
    console.log(baseTemplate);
    return 'not yet implemented';
  }

  // -- ValueMap ---------

  public Define(key: string, value: string) {
    if (!this.HasValueMap(key)) this.ValueMap.set(key, [value]);
    else
      cLog(`🔒 A definition already exists for ${key} (${value})`, 'warning');
  }

  public SetValueMap(key: string, value: string | string[]) {
    //TODO: split |s
    //TODO: add weights
    this.ValueMap.set(key, Array.isArray(value) ? value : [value]);
  }

  public AddValueMap(key: string, value: string | string[]) {
    //TODO: split |s
    //TODO: add weights
    const val = Array.isArray(value) ? value : [value];
    if (this.HasValueMap(key))
      this.ValueMap.set(key, [...this.GetValueMap(key), ...val]);
    else this.ValueMap.set(key, val);
  }

  public GetValueMap(key: string): string[] {
    return this.ValueMap.get(key) || [];
  }

  public HasValueMap(key: string): boolean {
    return this.ValueMap.has(key);
  }

  public DeleteValueMap(key: string) {
    this.ValueMap.delete(key);
  }

  // ------ utility

  public static IntBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  public static FloatBetween = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  public static Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  public static WeightedSelection = (collection: WeightedItem[]) => {
    if (!collection) {
      return null;
    }

    const totals: number[] = [];
    let total = 0;
    for (let i = 0; i < collection.length; i++) {
      total += collection[i].weight || 1;
      totals.push(total);
    }
    const rnd = Math.floor(Math.random() * total);
    let selected = collection[0];
    for (let i = 0; i < totals.length; i++) {
      if (totals[i] > rnd) {
        selected = collection[i];
        break;
      }
    }

    return selected;
  };
}

const isValidPoolData = (test: any): boolean => {
  if (typeof test === 'string') return true;
  if (!Array.isArray(test)) {
    console.error(`Invalid pool data: item is not string or array`);
    return false;
  }
  for (let i = 0; i < test.length; i++) {
    if (typeof test[i] !== 'string') {
      console.error(
        `Invalid pool data: array at index ${i} is ${typeof test[
          i
        ]}, not a string `
      );
      return false;
    }
  }
  return true;
};

const ConvertToMap = (input: object): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const key in input) {
    if (!isValidPoolData(input[key])) {
      throw new Error(
        `Error: unable to convert to map. Property "${key}" is not a string or array of strings`
      );
    }
    const value = typeof input[key] === 'string' ? [input[key]] : input[key];
    map.set(key, value);
  }
  return map;
};

const ImportJson = async (path: string): Promise<Map<string, string[]>> => {
  return ConvertToMap(import(`${path}.json`));
};

const ImportText = async (path: string): Promise<Map<string, string[]>> => {
  const load = await import(`raw-loader!${path}.txt`);
  const data = load.default.split('\n');
  const key = path.split('/').pop();
  const map = new Map<string, string[]>();
  map.set(key as string, data);
  return map;
};

const Pool = (...input: Map<string, string[]>[]): Map<string, string[]> => {
  const out = new Map<string, any>();
  input.forEach((m) => {
    for (const key of m.keys()) {
      if (out.has(key))
        out.set(key, [...(m.get(key) as string[]), ...out.get(key)]);
      else out.set(key, m.get(key));
    }
  });
  return out;
};

// const SetKey = (input: string): string => {
//   const regex = /(?<!\\)@(.*?){\K(.*?)(?=\})/g
// }

// const PoolReplace = (input: string): string => {
//   let out = input

//   const insertRegex = /(?<=(?<!\\)\{)(.*?)(?=\})/g
//   const matchedInserts = out.match(insertRegex) || []
//   matchedInserts.forEach(s => {})

//   return out
// }

// const replaceString = (str: string) => {
//   const pct = str.split('%')
//   if (pct.length > 1) {
//     if (floatBetween(0, 100) > Number(pct[1])) {
//       return ''
//     } else {
//       return getReplacement(pct[0])
//     }
//   } else {
//     return getReplacement(str)
//   }
// }

const getReplacement = (key: string, pools: Map<string, string[]>) => {
  if (Array.from(pools.keys()).some((x) => x === key))
    return _.sample(pools.get(key));

  return `{${key}}`;
};

// private replaceStr(input: string): string {
//   if (Array.from(this.replaceMap.keys()).some(x => x === input))
//     return _.sample(this.replaceMap.get(input))

//   if (Array.from(this.valueMap.keys()).some(x => x === input)) {
//     return this.valueMap.get(input)
//   }

//   // TODO: replace this with a map, like above. build map from multiple sources
//   switch (input) {
//     // case 'fullname':
//     //   return `${this.firstname}${this.middlename} ${this.lastname}`
//     case 'hon':
//       return this.gender.name === 'man' ? 'Lord' : this.gender.name === 'woman' ? 'Lady' : 'Peer'
//     // case 'firstname':
//     //   return this.nickname ? this.nickname : this.firstname
//     case 'pro_ref':
//       return this.gender.pronouns.ref
//     case 'pro_sub':
//       return this.gender.pronouns.sub
//     case 'pro_pos':
//       return this.gender.pronouns.pos
//     case 'pro_obj':
//       return this.gender.pronouns.obj
//     case 'gender':
//       return this.gender.name
//     case 'gen_name_family':
//       return `${this.genName(true)} {lastname}`
//     case 'gen_name':
//       return this.genName()
//     // case 'jobtitle':
//     //   return this.jobtitle
//     default:
//       return `{${input}}`
//   }
// }

export { Generator, ConvertToMap, ImportJson, ImportText, Pool };
