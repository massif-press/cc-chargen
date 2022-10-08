import _ from 'lodash';
import { GeneratorLibrary } from './generatorLibrary';
import { LibraryData } from './libraryData';
import { cLog, FloatBetween, WeightedSelection } from './util';

interface templateItem {
  templates: string[];
}

type ValueItem = {
  value: string;
  weight: number;
};

class GeneratorOptions {
  CleanMultipleSpaces: boolean = true;
  CapitalizeFirst: boolean = true;
  IgnoreMissingKeys: boolean = true;
  MaxIterations: number = 100;
}

class Generator {
  public Library: GeneratorLibrary;
  public ValueMap: Map<string, ValueItem[]>;

  private _timer;
  private _output = '';

  constructor(library?: GeneratorLibrary) {
    if (library) this.Library = library;
    this.ValueMap = new Map<string, ValueItem[]>();
  }

  public LoadLibrary(library: GeneratorLibrary) {
    this.startTimer();

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
        e.templates.forEach((value) => {
          this.AddValueMap(e.key, [{ value, weight: 1 }]);
        });
      }
    });

    this.endTimer('Library loaded');
  }

  public Generate(
    template?: string | string[] | templateItem,
    options: GeneratorOptions = new GeneratorOptions()
  ): string {
    this.startTimer();

    if (!this.Library) {
      cLog(
        '🈳',
        'No library loaded! Load a GeneratorLibrary with the LoadLibrary function',
        'error'
      );
      return '';
    }
    this.startTimer();

    this._output = this.getBaseTemplate(template);
    let loops = options.MaxIterations;
    let selectionsRemaining = true;
    while (loops && selectionsRemaining) {
      selectionsRemaining = this.process();
      loops--;
    }

    if (!loops) {
      cLog(
        '🔁',
        'Generator has exceeded its iteration limit. This likely means an referenced key cannot be resolved. The FindMissingValues() function can help debug these issues.',
        'warning'
      );
    }

    this.endTimer(`Item generated (${100 - loops}  loops)`);

    console.log(this._output);

    return this._output;
  }

  private process(): boolean {
    const contFlags = new Array(5).fill(false);
    // remove @pct misses
    contFlags[0] = this.resolvePcts();
    // remove @pct misses
    contFlags[1] = this.resolveInlineSelectionSets();
    // assign keywords
    contFlags[2] = this.assignKeys();
    // resolve inline selections
    contFlags[3] = this.resolveInline();
    // do other selections
    contFlags[4] = this.resolveSets();

    return contFlags.includes(true);
  }

  private resolveInlineSelectionSets() {
    let found = false;
    // collapse all inline sets of sets %like|this%
    // group 0 is full match, group 1 is content, not including syntactical elements
    const inlineRegex = /(?<!\`)[?>%](.*?.)[?<=%]/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      console.log(match);
      if (match[1].includes('|')) {
        found = true;
        console.log(match[0]);
        this._output = this._output.replace(
          match[1],
          this._getInlineValue(match[1])
        );
      }
    });

    return found;
  }

  private assignKeys(): boolean {
    let found = false;
    // find all @key
    // group 0 is full match, group 1 is key, group 2 is content, including syntactical elements
    // backtick escapes
    const keywordRegex = /(?<!\`)@(.*?)([?>{%].*?[?<=}%])/g;
    const matches = [...this._output.matchAll(keywordRegex)];
    matches.forEach((match) => {
      found = true;
      if (match[2].includes('{')) {
        // inline selection
        const val = this._getInlineValue(match[2]);
        this.Define(match[1], val);
        this._output = this._output.replace(match[0], val);
      } else {
        // array selection
        const vmKey = match[2].split('%').join('');
        console.log(vmKey);
        if (this.HasValueMap(vmKey)) {
          const sel = this._getMapValue(vmKey);
          this.Define(match[1], sel);
          this._output = this._output.replace(match[0], sel);
        }
      }
    });
    return found;
  }

  private resolveInline(): boolean {
    let found = false;
    // find all {inline|selections}
    // group 0 is full match, group 1 is content, not including syntactical elements
    // backtick escapes
    const inlineRegex = /(?<!\`)[?>{](.*?)[?<=}]/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      found = true;
      this._output = this._output.replace(
        match[0],
        this._getInlineValue(match[1])
      );
    });

    return found;
  }

  private resolveSets(): boolean {
    let found = false;
    // find all %sets%
    // group 0 is full match, group 1 is content, not including syntactical elements
    // backtick escapes
    const inlineRegex = /(?<!\`)[?>%](.*?)[?<=%]/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      found = true;
      if (this.HasValueMap(match[1])) {
        this._output = this._output.replace(
          match[0],
          this._getMapValue(match[1])
        );
      }
    });

    return found;
  }

  private _getInlineValue(inlineStr: string): string {
    const valueItems = LibraryData.PrepValues(inlineStr);
    return (WeightedSelection(valueItems) as ValueItem).value;
  }

  private _getMapValue(mapKey: string): string {
    const selArr = this.GetValueMap(mapKey);
    return (WeightedSelection(selArr) as ValueItem).value;
  }

  private resolvePcts(): boolean {
    let found = false;
    // find all @pctN{x} and @pctN%x%
    // group 0 is full match, group 1 is pct, group 2 is content, including syntactical elements
    // backtick escapes
    const pctRegex = /(?<!\`)@pct(\.?\d*\.?\d*)([?>{%].*?[?<=}%])/g;
    const matches = [...this._output.matchAll(pctRegex)];
    matches.forEach((match) => {
      found = true;
      if (this.rollPct(match[1])) {
        this._output = this._output.replace(match[0], match[2]);
      } else {
        this._output = this._output.replace(match[0], '');
      }
    });
    return found;
  }

  private rollPct(p: string): boolean {
    const n = Number(p);
    if (isNaN(n)) {
      cLog(`🚨','generator encountered a non-number weight`, 'error');
      throw new Error(`${p} cannot be cast to number`);
    }
    // roll under pct value for success
    return FloatBetween(0, 100) < n;
  }

  private startTimer() {
    this._timer = new Date().getTime();
  }

  private endTimer(msg: string) {
    let ms = (new Date().getTime() - this._timer).toString();
    if (ms === '0') ms = '<1';
    cLog('⏱️', `${msg} in ${ms}ms`);
  }

  private getBaseTemplate(template: any): string {
    try {
      if (typeof template === 'string') return template;
      else if (Array.isArray(template)) return _.sample(template);
      else {
        if (!template)
          template = _.sample(this.Library.Content) as templateItem;
        return _.sample(template.templates);
      }
    } catch (error) {
      cLog(
        `🚨','inappropriate or malformed template/template container sent to generator`,
        'error'
      );
      throw new Error(template);
    }
  }

  public Define(key: string, value: string) {
    if (!this.HasValueMap(key)) this.ValueMap.set(key, [{ value, weight: 1 }]);
    else
      cLog(`🔒','A definition already exists for ${key} (${value})`, 'warning');
  }

  public SetValueMap(key: string, data: ValueItem[]) {
    this.ValueMap.set(key, data);
  }

  public AddValueMap(key: string, data: ValueItem[]) {
    if (this.HasValueMap(key))
      this.ValueMap.set(key, [...this.GetValueMap(key), ...data]);
    else this.ValueMap.set(key, data);
  }

  public GetValueMap(key: string): ValueItem[] {
    return this.ValueMap.get(key) || [];
  }

  public HasValueMap(key: string): boolean {
    return this.ValueMap.has(key);
  }

  public DeleteValueMap(key: string) {
    this.ValueMap.delete(key);
  }

  public TestGeneration() {
    //TODO
  }

  public FindMissingValues() {
    //TODO
  }

  public OverlappingDefinitions() {
    //TODO
  }
}

export { Generator, ValueItem };
