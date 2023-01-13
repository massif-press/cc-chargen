import _ from 'lodash';
import { Generator, GeneratorLibrary, LibraryData } from 'gmgen';
import genders from '../assets/data/character/genders.json';
import * as data from '../assets/data/character';
import * as lists from '../assets/data/lists';
import { WeightedSelection } from 'gmgen/lib/util';
import getNames from '../assets/data/character/names';

const template = `
# %name% (%pro_sub%/%pro_obj%) #

## %jobtitle%

---

## Appearance
%physicality%

%clothing%




## Occupation
%occupation%

## Personality
%personality%
%opinions%
%ideals%
%flaws%

## History
%history_early%
%history_middle%
%history_recent%

## Relationships
%relationships%

## Secrets
%secrets%

`;

const Generate = (society: string, background: string): string => {
  console.log(background);
  console.log(data);
  const lib = new GeneratorLibrary(data[background]);
  getLists(lib);

  lib.AddData(data[society]);

  const occupationSelection =
    data[_.sample(data[background].values.occupations)];

  console.log(occupationSelection);

  lib.AddData(occupationSelection);

  const gen = new Generator(lib);
  gen.SetOption('Logging', 5);
  gen.SetOption('PreventEarlyExit', true);

  const genderSelection = WeightedSelection(genders);

  gen.Define('gender', genderSelection.name);
  for (const key in genderSelection.pronouns) {
    gen.Define(key, genderSelection.pronouns[key]);
  }

  gen.AddValueMap(
    'names',
    LibraryData.PrepValues(getNames(genderSelection.name))
  );
  gen.AddValueMap('surnames', LibraryData.PrepValues(getNames('surname')));
  // lib.SetData(new LibraryData('names', {}, getNames(genderSelection.name)));

  console.log(gen);
  console.log(gen.DefinitionMap);

  let output = gen.Generate(template);
  output = grammarPass(output);
  return output;
};

const grammarPass = (str: string): string => {
  let input = str;
  // 0 is match, 1 is they, 2 is word
  const theyRegex = /(\bthey\s)(\w+)/gim;
  const matches = [...input.matchAll(theyRegex)];
  matches.forEach((match) => {
    switch (match[2]) {
      case 'is':
        input = input.replace(match[0], `${match[1]} are`);
        break;
      case 'has':
        input = input.replace(match[0], `${match[1]} have`);
        break;
      default:
        break;
    }
  });

  return input;
};

//TODO: make this generic for all lists
const getLists = (lib: GeneratorLibrary) => {
  for (const key in lists) {
    lib.AddData(lists[key]);
  }
};

export default Generate;
