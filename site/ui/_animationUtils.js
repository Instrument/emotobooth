'use strict';

import * as colorUtils from './_colorUtils';
import * as emotionUtils from './_emotionUtils';
import * as geometryUtils from './_geometryUtils';

import {
  CANVAS_WIDTH,
  BACKEND_CANVAS_WIDTH
} from './image/_imageConst';

import {EMOTION_STRENGTHS} from './_emotionUtils';

export const HEX_LOWER_MIN_VERTICAL_MARGIN = 10;
export const HEX_UPPER_MIN_VERTICAL_MARGIN = 30;
export const HEX_MIN_BOTTOM_VERTICAL_MARGIN = 180;

export const HEX_MIN_BOTTOM_EYES_MARGIN = 0.5;

export const HEXAGON_CORNER_RADIUS = 10;

export const BLEND_NORMAL = 'source-over';

export const BG_ALPHA = 0.35;

export const VIGNETTE_CENTER_COLOR = colorUtils.TRANSPARENT;
export const VIGNETTE_OUTER_COLOR_RANDOM = true;
export const VIGNETTE_RADIUS = 0.75;
export const VIGNETTE_ALPHA = 1;
export const VIGNETTE_BLEND = 'overlay';

export const HALO_OUTER_COLOR = colorUtils.TRANSPARENT;
export const HALO_INNER_COLOR_RANDOM = true;
export const HALO_ALPHA = 1;
export const HALO_BLEND = 'screen';

export const CHROME_MAX_ROWS = 2;
export const CHROME_MAX_ITEMS = 10;
export const CHROME_HEX_RADIUS = 12.5;
export const CHROME_HORIZONTAL_PADDING = 40;
export const CHROME_VERTICAL_PADDING = 25;
export const CHROME_ITEM_WIDTH = (CANVAS_WIDTH - (CHROME_HORIZONTAL_PADDING * 2)) / 5;
export const BACKEND_CHROME_ITEM_WIDTH = (BACKEND_CANVAS_WIDTH - (CHROME_HORIZONTAL_PADDING * 2)) / 10;
export const CHROME_SINGLE_LINE_HEIGHT = 75 - (CHROME_VERTICAL_PADDING * 2);
export const CHROME_SPACE_BETWEEN_LINES = 12.5;
export const CHROME_SHORT_HEIGHT = CHROME_SINGLE_LINE_HEIGHT + (CHROME_VERTICAL_PADDING * 2);
export const CHROME_TALL_HEIGHT = (CHROME_SINGLE_LINE_HEIGHT * 2) + (CHROME_VERTICAL_PADDING * 2) + CHROME_SPACE_BETWEEN_LINES;

export const JSON_PATHS = {
  REQ: 'req',
  RES: 'resp'
};

// relative to canvas height
export const MIN_HEX_RADIUS = 0.2;
export const MAX_HEX_RADIUS = 0.3;
export const MAX_HEX_DIFF = 0.25;

export const SIDE_SHADOW_HIDE_WIDTH = 60;
export const SHADOW_HIDE_FEATHER = SIDE_SHADOW_HIDE_WIDTH * 5;
export const CORNER_SHADOW_HIDE_RADIUS = 300;

export const EMOTION_HEX_FADE_DURATION = 0.6;

// to trick timelines into "playing" things that we still want to be instant.
export const MIN_DURATION = 1 / 60;
export const POINTS_FADE_DURATION = 0.2;

export const CERTAINTY_HALO_RADII = {
  UNLIKELY: 12,
  POSSIBLE: 8,
  LIKELY: 1,
  VERY_LIKELY: 1.5
};

export function getStrongestColor(imageElement) {
  const emo = imageElement.facesAndStrongestEmotions;
  const emotionStrengths = [];
  const returnColors = [];

  function compareStrength(a,b) {
    if (a.strength < b.strength)
      return 1;
    if (a.strength > b.strength)
      return -1;
    return 0;
  }

  emo.forEach((emotions, index) => {
    let strength = EMOTION_STRENGTHS[emo[index][Object.keys(emo[index])[0]]];
    if (!strength) strength = 0;
    const emoObj = {index:index, strength: strength};
    emotionStrengths.push(emoObj);
  });

  // Sort people by strength of emotion
  emotionStrengths.sort(compareStrength);

  emotionStrengths.forEach((item, index) => {
    const personIndex = emotionStrengths[index].index;
    const color = imageElement.treatments.personalAuraColors[personIndex][0];
    if(color !== colorUtils.NEUTRAL) {
      returnColors.push(imageElement.treatments.personalAuraColors[personIndex][0]);
    }
  });

  return returnColors;
      
  // This was so if a person had 2 emotions, and the other had none, it would use the first persons strongest emotion
  // returnColor = imageElement.treatments.personalAuraColors[strongestEmotion][0];
  // if(returnColor === 'rgba(34, 45, 51, 1)') {
  //   const changeTo = (strongestEmotion === 1) ? 0 : 1;
  //   returnColor = imageElement.treatments.personalAuraColors[changeTo][0];
  // }
  // return returnColor;
}

export function generateSinglePersonTreatment(person) {
  const emotions = Object.keys(person);
  if (emotions.length === 0) {
    return {
      noEmotionScrim: true
    };
  }
  let backgroundIndex = 0;
  let vignetteOuterIndex = 0;
  let vignetteInnerIndex = 0;
  let haloInnerIndex = 0;
  let haloOuterIndex = 0;

  let haloRadius = 1;

  const backgroundColor = colorUtils.generateColorFromIndex(backgroundIndex, emotions);

  let vignetteInnerColor = null;
  let vignetteOuterColor = null;

  let haloInnerColor = null;
  let haloOuterColor = null;

  if (emotions.length > 1) {
    const dominantEmotion = emotionUtils.getDominantEmotion(person);

    backgroundIndex = emotions.indexOf(dominantEmotion);
    vignetteInnerIndex = 1 - backgroundIndex;
    vignetteOuterIndex = backgroundIndex;
    haloInnerIndex = 1 - backgroundIndex;
    haloOuterIndex = backgroundIndex;

    vignetteInnerColor = colorUtils.generateColorFromIndex(vignetteInnerIndex, emotions);
    vignetteOuterColor = colorUtils.generateColorFromIndex(vignetteOuterIndex, emotions);

    haloInnerColor = colorUtils.generateColorFromIndex(haloInnerIndex, emotions);
    haloOuterColor = colorUtils.generateColorFromIndex(haloOuterIndex, emotions);
  } else {
    // in one-emotion treatments, make sure we don't keep picking the same color.
    vignetteInnerColor = colorUtils.generateColorFromIndex(vignetteInnerIndex, emotions);
    vignetteOuterColor = vignetteInnerColor;
    while (vignetteOuterColor === vignetteInnerColor) {
      vignetteOuterColor = colorUtils.generateColorFromIndex(vignetteOuterIndex, emotions);
    }

    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[backgroundIndex]]] < 2) {
    //   backgroundColor = colorUtils.subAlpha(backgroundColor, 0.3);
    // }

    haloInnerColor = colorUtils.generateColorFromIndex(haloInnerIndex, emotions);
    haloOuterColor = haloInnerColor;
    while (haloOuterColor === haloInnerColor) {
      haloOuterColor = colorUtils.generateColorFromIndex(haloOuterIndex, emotions);
    }

    haloInnerColor = colorUtils.subAlpha(haloInnerColor, 0.75);

    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[haloInnerIndex]]] < 3) {
    //   haloInnerColor = colorUtils.TRANSPARENT;
    // }
    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[haloOuterIndex]]] < 4) {
    //   haloOuterColor = colorUtils.TRANSPARENT;
    // } else {
    haloOuterColor = colorUtils.subAlpha(haloOuterColor, 0.75);
    // }
  }

  haloRadius = CERTAINTY_HALO_RADII[person[emotions[haloInnerIndex]]];

  return ({
    background: backgroundColor,
    vignette: {
      innerColor: vignetteInnerColor,
      outerColor: vignetteOuterColor,
      alpha: colorUtils.CERTAINTY_ALPHAS[person[emotions[vignetteOuterIndex]]] / 100.00
    },
    halo: {
      innerColor: haloInnerColor,
      outerColor: haloOuterColor,
      radius: haloRadius,
      alpha: colorUtils.CERTAINTY_ALPHAS[person[emotions[haloInnerIndex]]] / 100.00
    }
  });
}

export function generatePersonalAuraColors(people) {
  const peopleOutput = [];

  people.forEach((emotions) => {
    const person = [];
    if (Object.keys(emotions).length === 0) {
      person.push(colorUtils.subAlpha(colorUtils.NEUTRAL, colorUtils.BG_ALPHA));
    } else if (Object.keys(emotions).length === 1) {
      person.push(colorUtils.getRandomColorWithAlpha(null, Object.keys(emotions)[0], 100));
      person.push(colorUtils.TRANSPARENT);
    } else {
      const first = Object.keys(emotions)[0];
      const second = Object.keys(emotions)[1];
      person.push(colorUtils.getRandomColorWithAlpha({}, first, 100));
      person.push(colorUtils.getRandomColorWithAlpha({}, second, 100));
    }
    peopleOutput.push(person);
  });

  return peopleOutput;
}

export function generateGroupAuraColors(people) {
  const gradientColors = [];

  people.forEach((person) => {
    const emotions = Object.keys(person);
    emotions.forEach((emotion) => {
      gradientColors.push(colorUtils.getRandomColorWithAlpha(null, emotion, person[emotion]));
    });
  });

  return gradientColors;
}

export function generateTreatments(facesAndEmotions = []) {
  const treatments = {};

  // store different colors & return different objects
  // if one person vs. multiple people
  if (facesAndEmotions.length === 1) {
    treatments.treatment = generateSinglePersonTreatment(facesAndEmotions[0]);
  } else {
    treatments.personalAuraColors = generatePersonalAuraColors(facesAndEmotions);
    treatments.groupAuraColors = generateGroupAuraColors(facesAndEmotions);
  }

  return treatments;
}

export function setSmoothing(context = null) {
  if (!context) {
    return;
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
}

export function getSquareColorSample(canvas = null, dim = 3, topLeftPoint = new geometryUtils.Point()) {
  if (!canvas || !dim) {
    return;
  }

  const context = canvas.getContext('2d');
  setSmoothing(context);

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalPixels = 0;

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      totalPixels++;
      const pixelData = context.getImageData(topLeftPoint.x + j, topLeftPoint.y + i, 1, 1);
      totalR += pixelData.data[0];
      totalG += pixelData.data[1];
      totalB += pixelData.data[2];
    }
  }

  totalR /= totalPixels;
  totalR = totalR.toFixed(0);

  totalG /= totalPixels;
  totalG = totalG.toFixed(0);

  totalB /= totalPixels;
  totalB = totalB.toFixed(0);

  return `rgba(${ totalR }, ${ totalG }, ${ totalB }, 1)`;
}
