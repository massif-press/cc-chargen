import _ from 'lodash';
import { Generator, LibraryData } from 'gmgen';
import genders from '../assets/data/character/genders.json';
import * as data from '../assets/data/character';
import * as lists from '../assets/data/lists';
import { logLevel, WeightedSelection } from 'gmgen/lib/util';
import { getNames, aliases } from '../assets/data/character/names';

const template = `
# %name% (%pro_sub%/%pro_obj%) #

## %jobtitle%

---

## Appearance
%physicality%
<br>
%clothing%

## Occupation
%occupation%

## Personality
%politics%
<br>
%personality%

## Secrets
%secrets%

`;

const Generate = (society: string, background: string): string => {
  console.log(society, background);
  const gen = new Generator();
  getLists(gen);

  gen.AddData(data[background]);

  gen.AddData(data[society]);

  const occupationSelection =
    data[_.sample(data[background].values.occupations)];

  gen.AddData(occupationSelection);

  const affiliationSelection =
    data[_.sample(data[society].values.affiliations)];

  console.log(data[society].values);
  console.log(data[society].values.affiliations);

  console.log(affiliationSelection);

  gen.AddData(affiliationSelection);

  gen.SetOption('Logging', logLevel.warning);
  // gen.SetOption('PreventEarlyExit', true);
  gen.SetOption('CleanEscapes', false);
  gen.SetOption('ClearBracketSyntax', false);
  gen.SetOption('ClearMissingKeys', false);

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

  let output = gen.Generate(template);
  output = finalize(output);

  return output;
};

const finalize = (str: string): string => {
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

  input = input.replace(/([!?.]\s|\s"+)([a-z])/g, (m, $1, $2) => {
    return $1 + $2.toUpperCase();
  });

  //TODO remove double punctuation

  return input;
};

//TODO: make this generic for all lists
const getLists = (gen: Generator) => {
  for (const key in lists) {
    gen.AddData(lists[key]);
  }
  gen.AddData(data.physicalities);
  gen.AddData(aliases);
};

export default Generate;
