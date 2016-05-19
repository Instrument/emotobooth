'use strict';

export function linear(startVal = 0, endVal = 0, progress = 0) {
  return (startVal + ((endVal - startVal) * progress));
}

export function square(startVal = 0, endVal = 0, progress = 0) {
  return (startVal + ((endVal - startVal) * Math.pow(progress, 2)));
}

export function cube(startVal = 0, endVal = 0, progress = 0) {
  return (startVal + ((endVal - startVal) * Math.pow(progress, 3)));
}

export function exp(startVal = 0, endVal = 0, progress = 0) {
  return (startVal + (endVal - startVal) * Math.pow(2, 10 * (progress - 1)));
}

export function expOut(startVal = 0, endVal = 0, progress = 0) {
  return (startVal + (endVal - startVal) * (-1 * Math.pow(2, -10 * progress) + 1));
}
