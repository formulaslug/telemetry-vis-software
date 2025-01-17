// This script is intended to be run standalone with something like `ts-node`.
// From the testing below, it seems to be that TypedArrays (Float32Array), at
// least for our use case (keeping track of a few thousand rows of frequent
// small batches of number-like data), are only very slightly faster than
// regular arrays (number[]). See the top answer here for some more interesting
// information:
// https://stackoverflow.com/questions/24853686/javascript-typedarray-performance

function assert_eq(val1: any, val2: any) {
  if (val1 !== val2) {
    throw Error(`AssertionError: ${val1} !== ${val2}!`);
  }
  console.debug(`Assert passed! (${val1} === ${val2})`);
}

const NUM_ROWS = 2000;
const BATCH_SIZE = 10;
const NUM_BATCHES = 100_000;

// We use double the length so that we can always have a full NUM_ROWS' of rows
// to look at by shifting the top half to the bottom half when it fills up
const floatArr = new Float32Array(NUM_ROWS * 2);
let idxTyped = 0;
const arr = new Array<number>(NUM_ROWS);

// Using Float32Array
const start1 = performance.now();
for (const i of Array.from({ length: NUM_BATCHES }, (_, n) => n + 1)) {
  const tenRows = Array.from({ length: BATCH_SIZE }, (_, n) => i + n / 10);
  if (idxTyped + tenRows.length >= floatArr.length) {
    // needs swap
    const topHalf = floatArr.subarray(NUM_ROWS);
    // assert_eq(topHalf.length, NUM_ROWS);
    // assert_eq(topHalf[0] > floatArr.subarray(0, NUM_ROWS)[NUM_ROWS - 1], true);
    floatArr.set(topHalf);
    floatArr.fill(0, NUM_ROWS);
    idxTyped = NUM_ROWS;
  }
  floatArr.set(tenRows, idxTyped);
  idxTyped += tenRows.length;

  // console.table(floatArr);

  const lhs = Math.max(0, idxTyped - NUM_ROWS);
  const sub = floatArr.subarray(lhs, lhs + NUM_ROWS)
  // assert_eq(sub.length, NUM_ROWS);
}
const end1 = performance.now();

// Using number[]
const start2 = performance.now();
for (const i of Array.from({ length: NUM_BATCHES }, (_, n) => n + 1)) {
  const tenRows = Array.from({ length: BATCH_SIZE }, (_, n) => i + n / 10);
  for (let j = 0; j < tenRows.length; j++) {
    arr.push(tenRows[j]);
  }
  // Remove as many from the start of arr as needed to maintain NUM_ROWS length
  arr.splice(0, Math.max(0, arr.length - NUM_ROWS))

  // console.table(arr);

  // assert_eq(arr.length, NUM_ROWS);
}
const end2 = performance.now();

// assert_eq(floatArr.length, NUM_ROWS*2);
// assert_eq(arr.length, NUM_ROWS);

console.log(`floatArr: ${(end1 - start1).toFixed(2)}ms`);
console.log(`arr: ${(end2 - start2).toFixed(2)}ms`);
