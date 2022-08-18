import _ from 'lodash'

function pullRandom(path: string, count: number): string[] {
  const data = require(`raw-loader!@/assets/data/${path}.txt`).default
  const arr = data.split('\n')
  return _.sampleSize(arr, count).map(x => x.replace(/[\n\r]/g, ''))
}

// function callsign(): string {
//   const callsigns = require('raw-loader!@/assets/generators/callsigns.txt').default.concat(
//     store.getters.Tables?.callsigns || []
//   )
//   return pullRandom(callsigns, 1)[0]
// }

// function mechname(): string {
//   const mechnames = require('raw-loader!@/assets/generators/mechnames.txt').default.concat(
//     store.getters.Tables?.mech_names || []
//   )
//   return pullRandom(mechnames, 1)[0]
// }

// function teamName(): string {
//   const teamnames = require('raw-loader!@/assets/generators/teamnames.txt').default.concat(
//     store.getters.Tables?.team_names || []
//   )
//   return pullRandom(teamnames, 1)[0]
// }

// function tracert(jumps: number): string[] {
//   return pullRandom(require('raw-loader!@/assets/generators/traces.txt').default, jumps || 1)
// }

// function mission(): string {
//   const m = require('@/assets/generators/mission.json')
//   return `${_.sample(m.a)} ${_.sample(m.b)}`
// }

// function faction(): string {
//   const factions = require('raw-loader!@/assets/generators/factions.txt').default.concat(
//     store.getters.Tables?.team_names || []
//   )
//   return pullRandom(factions, 1)[0]
// }

// function encryption(): string {
//   return `${Math.random()
//     .toString()
//     .substring(2, 4)}::${mission()}`.toUpperCase()
// }

// function flavorID(template: string): string {
//   const uc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
//   const lc = 'abcdefghijklmnopqrstuvwxyz'
//   const num = '0123456789'

//   let i = template.length
//   let output = ''
//   while (i--) {
//     output += template[i]
//       .replace(/A/, _.sample(uc))
//       .replace(/a/, _.sample(lc))
//       .replace(/N/, _.sample(num))
//   }
//   return output
// }

export { pullRandom }
