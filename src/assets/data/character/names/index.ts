import _ from 'lodash';
import * as names from './names.json';

const getNames = (type: string): string[] => {
  switch (type) {
    case 'man':
      return names.male;
    case 'woman':
      return names.female;
    case 'person':
      return _.sample([names.male, names.female]) as string[];
    case 'surname':
      return names.surname;
    default:
      return [];
  }
};

export default getNames;
