'use strict';

import * as emotionUtils from './_emotionUtils';
import * as geometryUtils from './_geometryUtils';


export const LANDMARK_SECTIONS = {
  EARS: ['LEFT_EAR_TRAGION', 'RIGHT_EAR_TRAGION'],
  FOREHEAD: ['LEFT_OF_LEFT_EYEBROW', 'RIGHT_OF_LEFT_EYEBROW', 'LEFT_OF_RIGHT_EYEBROW', 'RIGHT_OF_RIGHT_EYEBROW', 'LEFT_EYEBROW_UPPER_MIDPOINT', 'RIGHT_EYEBROW_UPPER_MIDPOINT', 'FOREHEAD_GLABELLA'],
  EYES: ['LEFT_EYE', 'RIGHT_EYE', 'MIDPOINT_BETWEEN_EYES', 'LEFT_EYE_TOP_BOUNDARY', 'LEFT_EYE_RIGHT_CORNER', 'LEFT_EYE_BOTTOM_BOUNDARY', 'LEFT_EYE_LEFT_CORNER', 'LEFT_EYE_PUPIL', 'RIGHT_EYE_TOP_BOUNDARY', 'RIGHT_EYE_RIGHT_CORNER', 'RIGHT_EYE_BOTTOM_BOUNDARY', 'RIGHT_EYE_LEFT_CORNER', 'RIGHT_EYE_PUPIL'],
  NOSE: ['NOSE_TIP', 'NOSE_BOTTOM_RIGHT', 'NOSE_BOTTOM_LEFT', 'NOSE_BOTTOM_CENTER'],
  MOUTH: ['UPPER_LIP', 'LOWER_LIP', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'MOUTH_CENTER'],
  CHIN: ['CHIN_GNATHION', 'CHIN_LEFT_GONION', 'CHIN_RIGHT_GONION'],
  FULL: ['LEFT_EAR_TRAGION', 'RIGHT_EAR_TRAGION', 'LEFT_OF_LEFT_EYEBROW', 'RIGHT_OF_LEFT_EYEBROW', 'LEFT_OF_RIGHT_EYEBROW', 'RIGHT_OF_RIGHT_EYEBROW', 'LEFT_EYEBROW_UPPER_MIDPOINT', 'RIGHT_EYEBROW_UPPER_MIDPOINT', 'FOREHEAD_GLABELLA', 'LEFT_EYE', 'RIGHT_EYE', 'MIDPOINT_BETWEEN_EYES', 'LEFT_EYE_TOP_BOUNDARY', 'LEFT_EYE_RIGHT_CORNER', 'LEFT_EYE_BOTTOM_BOUNDARY', 'LEFT_EYE_LEFT_CORNER', 'LEFT_EYE_PUPIL', 'RIGHT_EYE_TOP_BOUNDARY', 'RIGHT_EYE_RIGHT_CORNER', 'RIGHT_EYE_BOTTOM_BOUNDARY', 'RIGHT_EYE_LEFT_CORNER', 'RIGHT_EYE_PUPIL', 'NOSE_TIP', 'NOSE_BOTTOM_RIGHT', 'NOSE_BOTTOM_LEFT', 'NOSE_BOTTOM_CENTER', 'UPPER_LIP', 'LOWER_LIP', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'MOUTH_CENTER', 'CHIN_GNATHION', 'CHIN_LEFT_GONION', 'CHIN_RIGHT_GONION']
};

export const FACE_SECTIONS = [
  'boundingPoly',
  'fdboundingPoly',
  'rollAngle',
  'panAngle',
  'tiltAngle',
  'detectionConfidence',
  'landmarkingConfidence'
];

// sort faces, left to right, based on their left edges.
export function sortFaces(faces = []) {
  faces.sort((a, b) => {
    return (a.boundingPoly.vertices[0].x - b.boundingPoly.vertices[0].x);
  });
  return faces;
}

export function generateFacesAndEmotions(faces = [], strongestOnly = false) {
  const facesAndEmotions = [];

  faces.forEach((face) => {
    const emotions = {};
    if (face.angerLikelihood !== 'VERY_UNLIKELY') {
      emotions.ANGER = face.angerLikelihood;
    }
    if (face.joyLikelihood !== 'VERY_UNLIKELY') {
      emotions.JOY = face.joyLikelihood;
    }
    if (face.sorrowLikelihood !== 'VERY_UNLIKELY') {
      emotions.SORROW = face.sorrowLikelihood;
    }
    if (face.surpriseLikelihood !== 'VERY_UNLIKELY') {
      emotions.SURPRISE = face.surpriseLikelihood;
    }
    if (!strongestOnly) {
      facesAndEmotions.push(emotions);
    } else {
      facesAndEmotions.push(emotionUtils.getStrongestEmotions(emotions));
    }
  });
  return facesAndEmotions;
}

export function generateAllEyesCenter(faces) {
  const center = new geometryUtils.Point();

  let minX = 10000000;
  let maxX = 0;
  let avgY = 0;

  faces.forEach((face) => {
    if (face.boundingPoly.vertices[0].x < minX) {
      minX = face.boundingPoly.vertices[0].x;
    }

    if (face.boundingPoly.vertices[1].x > maxX) {
      maxX = face.boundingPoly.vertices[1].x;
    }

    const eyesYAvg = (face.landmarks[0].position.y + face.landmarks[1].position.y) / 2;

    avgY += eyesYAvg;
  });

  const centerX = (minX + maxX) / 2;
  const centerY = avgY / faces.length;

  center.x = centerX;
  center.y = centerY;

  return center;
}

export function generateFaceBounds(faces) {
  let minX = 10000000;
  let maxX = 0;
  let minY = 10000000;
  let maxY = 0;

  faces.forEach((face) => {
    if (face.boundingPoly.vertices[0].x < minX) {
      minX = face.boundingPoly.vertices[0].x;
    }

    if (face.boundingPoly.vertices[1].x > maxX) {
      maxX = face.boundingPoly.vertices[1].x;
    }

    if (face.boundingPoly.vertices[0].y < minY) {
      minY = face.boundingPoly.vertices[0].y;
    }

    if (face.boundingPoly.vertices[2].y > maxY) {
      maxY = face.boundingPoly.vertices[2].y;
    }
  });

  return({
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY
  });
}

export function generateEyeMidpoints(faces) {
  const eyeMidpoints = [];

  faces.forEach((face) => {
    eyeMidpoints.push(new geometryUtils.midpointFromCoords(
      face.landmarks[0].position.x,
      face.landmarks[1].position.x,
      face.landmarks[0].position.y,
      face.landmarks[1].position.y
    ));
  });

  return eyeMidpoints;
}
