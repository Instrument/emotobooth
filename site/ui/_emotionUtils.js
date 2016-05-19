'use strict';

export const EMOTION_LIKELIHOODS = [
  'joyLikelihood', 'sorrowLikelihood', 'angerLikelihood', 'surpriseLikelihood'
];

export const EMOTION_STATES = {
  VERY_UNLIKELY: 'VERY_UNLIKELY',
  UNLIKELY: 'UNLIKELY',
  POSSIBLE: 'POSSIBLE',
  LIKELY: 'LIKELY',
  VERY_LIKELY: 'VERY_LIKELY'
};

export const EMOTION_STRENGTHS = {
  VERY_LIKELY: 4,
  LIKELY: 3,
  POSSIBLE: 2,
  UNLIKELY: 1,
  VERY_UNLIKELY: 0
};

export function getStrongestEmotions(emotionsRaw, numToChoose = 2) {
  const emotionTiers = [];
  for (let i = 0; i < Object.keys(EMOTION_STRENGTHS).length; i++) {
    emotionTiers.push([]);
  }

  const emotions = Object.keys(emotionsRaw);
  emotions.forEach((emotion) => {
    const index = EMOTION_STRENGTHS[emotionsRaw[emotion]];
    emotionTiers[index].push(emotion);
  });

  emotionTiers.reverse();

  const outputEmotions = [];
  const maxOutputEmotions = numToChoose;

  emotionTiers.forEach((tier) => {
    // if we can get all the emotions from this tier into the output, do so
    if (outputEmotions.length + tier.length <= maxOutputEmotions) {
      tier.forEach((emotion) => {
        outputEmotions.push(emotion);
      });
    } else {
      // if we can't, choose them from this tier, randomly, one at a time.
      const chosenIndices = [];

      while (Object.keys(outputEmotions).length < maxOutputEmotions) {
        const nextIndex = Math.floor(Math.random() * tier.length);
        if (!chosenIndices.includes(nextIndex)) {
          outputEmotions.push(tier[nextIndex]);
          chosenIndices.push(nextIndex);
        }
      }
    }
  });

  const outputEmotionsObj = {};
  outputEmotions.forEach((emotion) => {
    outputEmotionsObj[emotion] = emotionsRaw[emotion];
  });

  return outputEmotionsObj;
}

export function getDominantEmotion(person) {
  const emotions = Object.keys(person);
  emotions.sort((a, b) => {
    return (EMOTION_STRENGTHS[person[b]] - EMOTION_STRENGTHS[person[a]]);
  });

  return emotions[0];
}
