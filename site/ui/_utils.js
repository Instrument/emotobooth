'use strict';

export function actualCompare(a, b) {
  return a - b;
}

export function randomOrder(inputArr = []) {
  const chosenIndices = [];
  const inputLength = inputArr.length;
  const outputArr = [];

  while(outputArr.length < inputLength) {
    const nextIndex = Math.floor(Math.random() * inputLength);
    if (!chosenIndices.includes(nextIndex)) {
      outputArr.push(inputArr[nextIndex]);
      chosenIndices.push(nextIndex);
    }
  }

  return outputArr;
}

export function thisOrZero(val) {
  if ((typeof val === 'undefined') || !val) {
    return 0;
  }
  return val;
}
