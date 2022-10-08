import { assert, expect, test } from 'vitest';
import * as Util from '../lib/util';

const iterations = 5000;

const testCollection = [
  { idx: 0, weight: 0.1 },
  { idx: 1, weight: 5 },
  { idx: 2, weight: 11 },
];

test('Util.Capitalize', () => {
  expect(Util.Capitalize('hello')).toBe('Hello');
  expect(Util.Capitalize('hello').length).toBe(5);
});

test('Util.IntBetween', () => {
  for (let i = iterations; i; i--) {
    expect(Util.IntBetween(0, 10)).greaterThanOrEqual(0);
    expect(Util.IntBetween(0, 10)).lessThanOrEqual(10);
    expect(Util.IntBetween(0, 10)).to.satisfy(Number.isInteger);
  }
});

test('Util.FloatBetween', () => {
  for (let i = iterations; i; i--) {
    expect(Util.FloatBetween(0, 1)).greaterThanOrEqual(0);
    expect(Util.FloatBetween(0, 1)).lessThanOrEqual(10);
    expect(Util.FloatBetween(0, 1)).to.not.satisfy(Number.isInteger);
  }
});

test('Util.WeightedSelection', () => {
  expect(Util.WeightedSelection([])).toBe(null);
  expect(Util.WeightedSelection(undefined as any)).toBe(null);

  const countArr = [0, 0, 0];
  for (let i = iterations; i; i--) {
    countArr[(Util.WeightedSelection(testCollection) as any).idx]++;
  }
  expect(countArr[0]).lessThan(countArr[1]);
  expect(countArr[1]).lessThan(countArr[2]);
  expect(countArr[2]).greaterThan(countArr[0]);
  expect(countArr.reduce((a, b) => a + b, 0)).toBe(iterations);
});

// test('Util.cLog', () => {
//   expect(Util.Capitalize('hello')).toBe('Hello');
//   expect(Util.Capitalize('hello').length).toBe(5);
// });
