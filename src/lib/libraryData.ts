import { cLog } from './util';
import _ from 'lodash';
import { ValueItem } from './generator';

class LibraryData {
  key: string;
  definitions: object;
  values: object;
  templates: string[];

  constructor(
    key: string,
    definitions?: object,
    values?: object,
    templates?: string[]
  ) {
    this.key = key;
    this.definitions = definitions || {};
    this.values = values || {};
    this.templates = templates || [];
  }

  public static Convert(json: string | object): LibraryData {
    const c = typeof json === 'string' ? JSON.parse(json) : json;
    if (!c.key) {
      cLog(
        `🔑 Error converting object to LibraryData: item lacks key property`,
        'error'
      );
      throw new Error(`object has no key field: ${c}`);
    }
    return new LibraryData(
      c.key,
      c.definitions,
      this.prepValueObject(c.values),
      c.templates
    );
  }

  private static prepValueObject(obj: object) {
    const out = {};
    for (const k in obj) {
      out[k] = LibraryData.PrepValues(obj[k]);
    }
    return out;
  }

  public Define(key: string, value: string) {
    this.checkKey(key, 'definitions');
    this.definitions[key] = value;
  }

  public ClearDefinition(key: string) {
    this.checkKey(key, 'definitions');
    delete this.definitions[key];
  }

  public AddTemplate(...values: string[]) {
    this.templates = [...this.templates, ...values];
  }

  public SetTemplate(index: number, value: string) {
    this.checkIndex(index, 'templates');
    this.templates[index] = value;
  }

  public RemoveTemplate(index: number) {
    this.checkIndex(index, 'templates');
    this.templates.splice(index, 1);
  }

  public ClearTemplates() {
    this.templates.splice(0, this.templates.length);
  }

  public GetValue(key: string): string[] {
    this.checkKey(key, 'values');
    return this.values[key];
  }

  public AddValue(
    key: string,
    value: string | string[],
    weight?: number | number[]
  ) {
    if (this.values[key])
      this.values[key] = [
        ...this.values[key],
        ...LibraryData.PrepValues(value, weight),
      ];
    else this.SetValue(key, value, weight);
  }

  public SetValue(
    key: string,
    value: string | string[],
    weight?: number | number[]
  ) {
    this.values[key] = LibraryData.PrepValues(value, weight);
  }

  public SetValueItem(key: string, index: number, value: string, weight = 1) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index] = {
      value,
      weight,
    };
  }

  public SetValueItemWeight(key: string, index: number, weight: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index].weight = weight;
  }

  public ClearValueWeights(key: string) {
    this.checkKey(key, 'values');
    this.values[key].forEach((v) => {
      v.weight = 1;
    });
  }

  public DeleteValueItem(key: string, index: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key].splice(index, 1);
  }

  public ClearValueItem(key: string, index: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index].value = '';
    this.values[key][index].weight = 1;
  }

  public DeleteValue(key: string) {
    this.checkKey(key, 'values');
    delete this.values[key];
  }

  public ClearValue(key: string) {
    this.checkKey(key, 'values');
    this.values[key] = [{ value: '', weight: 1 }];
  }

  public static PrepValues(
    values: any,
    weights?: number | number[]
  ): ValueItem[] {
    let v, w;

    if (typeof values === 'string') values = values.split('|');

    if (typeof values[0] === 'string') {
      v = values;
      w = [];

      [v, w] = this.SplitValueWeights(v);

      if (weights) {
        const wArr = Array.isArray(weights) ? weights : [weights];
        for (const i of wArr) {
          w[i] = wArr[i];
        }
      }
    } else if (Array.isArray(values[0])) {
      v = values.map((x) => x[0]);
      w = values.map((x) => x[1] || 1);
    } else if (values[0].value !== undefined) {
      v = values.map((x) => x.value);
      w = values.map((x) => x.weight || 1);
    } else {
      cLog('🚨', 'Inappropriate or malformed value item detected', 'error');
      throw new Error(values);
    }

    return v.map((x, i) => ({
      value: x,
      weight: w && w[i] && Number.isSafeInteger(w[i]) ? w[i] : 1,
    }));
  }

  public static SplitValueWeights(arr: string[]): [string[], number[]] {
    let values: string[] = [];
    let weights: number[] = [];
    arr.forEach((str) => {
      if (typeof str !== 'string') return;
      // capture :number, ignore escape /:
      const match = str.match(/(?<!\\)(?:\:)\d+/);
      if (match && match[0]) {
        weights.push(Number(match[0].replace(':', '')));
        values.push(str.replace(match[0], ''));
      } else {
        weights.push(1);
        values.push(str);
      }
    });

    return [values, weights];
  }

  public checkIndex(index: number, arrKey: string) {
    if (!Number.isInteger(index)) {
      cLog(`📙`, `Error setting ${arrKey}: inappropriate index value`, 'error');
      throw new Error(`${index} cannot be used as index`);
    }
    if (index > _.property(`this.${arrKey}`).length - 1 || index < 0) {
      cLog(`📙 Error setting ${arrKey}: index exceeds array bounds`, 'error');
      throw new Error(
        `Index ${index} exceeds array bounds of 0-${
          _.property(`this.${arrKey}`).length
        }`
      );
    }
  }

  private checkKey(key: string, objKey: string) {
    if (!_.property(`this.${objKey}.${key}`)) {
      cLog(
        `📙`,
        `Error clearing ${objKey}: LibraryData contains no ${objKey} for ${key}`,
        'error'
      );
      throw new Error(`LibraryData is undefined at ${objKey}.${key}`);
    }
  }
}

export { LibraryData };
