'use strict';

export const ANGER = [
  'rgba(255, 87, 34, 1)',
  'rgba(244, 67, 54, 1)',
  'rgba(233, 30, 99, 1)'
];
export const JOY = [
  'rgba(255, 235, 59, 1)',
  'rgba(255, 193, 7, 1)',
  'rgba(255, 152, 0, 1)'
];
export const SORROW = [
  'rgba(33, 150, 243, 1)',
  'rgba(3, 196, 244, 1)',
  'rgba(0, 188, 212, 1)'
];
export const SURPRISE = [
  'rgba(156, 39, 176, 1)',
  'rgba(103, 58, 183, 1)',
  'rgba(63, 81, 181, 1)'
];

export const CANONICAL = {
  ANGER: 'rgba(255, 81, 0, 1)',
  JOY: 'rgba(255, 214, 0, 1)',
  SORROW: 'rgba(33, 150, 243, 1)',
  SURPRISE: 'rgba(171, 71, 188, 1)'
};

export const SCRIM = 'rgb(0, 0, 0, 1)';
export const SCRIM_MAX_ALPHA = 0.3;

export const NEUTRAL = 'rgba(34, 45, 51, 1)';
export const NEUTRAL_WHITE = 'rgba(255, 255, 255, 1)';
export const TRANSPARENT = 'rgba(255, 255, 255, 0)';
export const WHITE = 'rgba(255, 255, 255, 1)';
export const BLACK = 'rgba(0, 0, 0, 1)';

export const CERTAINTY_ALPHAS = {
  // VERY_UNLIKELY: 0,
  // UNLIKELY: 50,
  // POSSIBLE: 70,
  // LIKELY: 90,
  VERY_UNLIKELY: 100,
  UNLIKELY: 100,
  POSSIBLE: 100,
  LIKELY: 100,
  VERY_LIKELY: 100
};

export function subAlpha(color, alpha = 1) {
  return `${ color.split(color.split(',')[3])[0] } ${ alpha })`;
}

export function splitRGBA(color = 'rgba(255, 255, 255, 1)') {
  const split = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };

  split.r = Number(color.split('(')[1].split(',')[0]);
  split.g = Number(color.split(', ')[1].split(',')[0]);
  split.b = Number(color.split(', ')[2].split(',')[0]);
  split.a = Number(color.split(', ')[3].split(')')[0]);

  return split;
}

export function chooseRandomColorFromEmotion(emotion = null) {
  let color = null;

  switch (emotion) {
    case 'ANGER':
      color = ANGER[Math.floor(Math.random() * ANGER.length)];
      break;
    case 'JOY':
      color = JOY[Math.floor(Math.random() * JOY.length)];
      break;
    case 'SORROW':
      color = SORROW[Math.floor(Math.random() * SORROW.length)];
      break;
    case 'SURPRISE':
      color = SURPRISE[Math.floor(Math.random() * SURPRISE.length)];
      break;
    default:
      color = WHITE;
      break;
  }

  return color;
}

export function shadeRGBColor(color, percent) {
  const f = color.split(",");
  const sliceCount = f[0].includes('rgba') === true ? 5 : 4;
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent *- 1 : percent;
  const R = parseInt(f[0].slice(sliceCount));
  const G = parseInt(f[1]);
  const B = parseInt(f[2]);
  let returnVal = `rgba(${ (Math.round((t-R)*p)+R) },${ (Math.round((t-G)*p)+G) }, ${ (Math.round((t-B)*p)+B) }, 1)`
  if (sliceCount === 4) {
    returnVal = `rgb(${ (Math.round((t-R)*p)+R) },${ (Math.round((t-G)*p)+G) }, ${ (Math.round((t-B)*p)+B) })`
  }
  return returnVal;
}


export function getRandomColorWithAlpha(keyVal = null, key = null, val = null) {

  const keyToUse = key ? key : Object.keys(keyVal)[0];
  let valToUse = val ? val : keyVal[keyToUse];
  if (typeof valToUse !== 'number') {
    valToUse = CERTAINTY_ALPHAS[valToUse];
  }

  return subAlpha(chooseRandomColorFromEmotion(keyToUse),  valToUse / 100);
}

export function generateColorFromIndex(index = -1, emotions = []) {
  if (emotions.length === 0 || index < 0) {
    return TRANSPARENT;
  }

  const emotion = emotions[index];
  return getRandomColorWithAlpha(null, emotion, 100);
}

export function getEmotionForColor(color = null) {
  if (!color) {
    return null;
  }

  const newColor = subAlpha(color, 1);
  if (ANGER.includes(newColor)) {
    return 'ANGER';
  } else if (JOY.includes(newColor)) {
    return 'JOY';
  } else if (SORROW.includes(newColor)) {
    return 'SORROW';
  } else if (SURPRISE.includes(newColor)) {
    return 'SURPRISE';
  }

  return null;
}
