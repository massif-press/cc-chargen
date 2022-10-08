interface WeightedItem {
  weight: number;
}

const IntBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const FloatBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

const Capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const WeightedSelection = (collection: WeightedItem[]) => {
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

const cLog = (icon: string, msg: string, type?: 'error' | 'warning') => {
  const tagStyle = `background-color:${
    type === 'error' ? '#991e2a' : type === 'warning' ? '#612a17' : '#253254'
  }; color:white; font-weight: bold; padding: 4px; border-radius: 2px`;
  console.log(`%c${icon} cc-gen ${type || 'info'}`, tagStyle, msg);
};

export {
  WeightedItem,
  IntBetween,
  FloatBetween,
  Capitalize,
  WeightedSelection,
  cLog,
};
