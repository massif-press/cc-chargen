interface WeightedItem {
  weight: number
}

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function intBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function floatBetween(min, max) {
  return Math.random() * (max - min) + min
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function weightedSelection(collection: WeightedItem[]) {
  const arr = []
  const totalWeight = collection.reduce((n, { weight }) => n + weight, 0)
  for (const i in collection) {
    for (let j = 0; j < collection[i].weight * totalWeight; j++) {
      arr.push(i)
    }
  }
  return getRandom(arr)
}

export { weightedSelection, getRandom, intBetween, floatBetween, capitalize }
