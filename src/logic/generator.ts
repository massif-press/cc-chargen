/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash';
import fs from 'fs';

class Model {
  Configurations: Configuration[];
  Definitions: object;
}

class Configuration {
  Definitions: object;
  Fields: object;
}

interface WeightedItem {
  weight: number;
}

class Generator {
  public Library: object;
  public Dictionary: Map<string, string>;
  // public Model: Model
  public ValueMap: Map<string, string[]>;

  constructor() {
    // this.Model = model
    this.Library = {};
    this.Dictionary = new Map<string, string>();
    this.ValueMap = new Map<string, string[]>();
  }

  public Generate(Configuration: Configuration) {
    console.log(Configuration);
    // traverse and collect property tree
    // collect fields
    // compose dictionary
    // compose valuemap
    // traverse template tree and select templates
    // compose templates
    // define-replace loop
    // out
    console.log('not yet implemented');
  }

  // public async LoadLibraryDir(...filters: string[]) {
  //   const start = new Date().getTime();
  //   let cache = {};

  //   async function importAll(r) {
  //     r.keys().forEach((key) => (cache[key] = r(key)));
  //   }

  //   fs.readdirSync('/assets/data/').forEach(async (e) => {
  //     importAll(await import(e));
  //   });

  //   for (const key in cache) {
  //     if (!filters.some((str) => key.includes(str))) delete cache[key];
  //   }

  //   for (const key in cache) {
  //     filters.forEach((f) => {
  //       if (key.includes(f)) {
  //         const subkey = key?.split(`${f}/`)?.pop()?.replace('.json', '');
  //         const pArr = subkey?.split('/');
  //         if (_.has(this.Library, pArr)) this.AppendLibrary(pArr, cache[key]);
  //         else this.SetLibrary(pArr, cache[key]);
  //       }
  //     });
  //   }

  //   cache = {};
  //   let ms = (new Date().getTime() - start).toString();
  //   if (ms === '0') ms = '<1';
  //   console.info(`Library loaded in ${ms}ms`);
  //   console.log(this.Library);
  // }

  public LoadLibraryObject(...objs: object[]) {
    const start = new Date().getTime();
    objs.forEach((obj) => {
      for (const key in obj) {
        if (_.has(this.Library, key)) this.AppendLibrary(key, obj[key]);
        else this.SetLibrary(key, obj[key]);
      }
    });

    let ms = (new Date().getTime() - start).toString();
    if (ms === '0') ms = '<1';
    console.info(`Library loaded in ${ms}ms`);
  }

  public async LoadLibraryFile(...paths: string[]) {
    const start = new Date().getTime();
    paths.forEach(async (path) => {
      let cache = await import(path);

      for (const key in cache) {
        if (_.has(this.Library, key)) this.AppendLibrary(key, cache[key]);
        else this.SetLibrary(key, cache[key]);
      }

      cache = null;
    });

    let ms = (new Date().getTime() - start).toString();
    if (ms === '0') ms = '<1';
    console.info(`Library loaded in ${ms}ms`);
  }

  public SetLibrary(path: _.PropertyPath, data: string[]) {
    _.set(this.Library, path, data);
  }

  public AppendLibrary(path: _.PropertyPath, data: string[]) {
    const e = _.get(this.Library, path, data);
    _.set(this.Library, path, [...e, ...data]);
  }

  public DeleteLibrary(path: _.PropertyPath) {
    _.unset(this.Library, path);
  }

  public GetLibrary(path: _.PropertyPath): string[] {
    return _.get(this.Library, path);
  }

  public HasLibrary(path: _.PropertyPath): boolean {
    return _.has(this.Library, path);
  }

  public SetValueMap(key: string, value: string | string[]) {
    this.ValueMap.set(key, Array.isArray(value) ? value : [value]);
  }
  public AppendValueMap(key: string, value: string | string[]) {
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

  public GetDefinition(key: string): string {
    return this.Dictionary.get(key) || '';
  }
  public HasDefinition(key: string) {
    return this.Dictionary.has(key);
  }
  public DeleteDefinition(key: string) {
    this.Dictionary.delete(key);
  }
  public SetDefinition(key: string, val: string) {
    this.Dictionary.set(key, val);
  }

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
