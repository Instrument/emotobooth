'use strict';

// All times are in seconds

export const STATES_INIT_FACE = [];

export const STATES_FINAL_FACE = [
  {
    NAME: 'zoomOut',
    DURATION: 0.5
  }
];

// times are in seconds.
export const STATES_SINGLE_FACE = [];

export const STATES_MULTIPLE_FACES = [];

export const STATES_AURA_SINGLE = [
  {
    NAME: 'animateInBackground',
    DURATION: 2
  },
  {
    NAME: 'animateInHalo',
    DURATION: 2
  },
  {
    NAME: 'chrome',
    DURATION: 1
  }
];

export const STATES_AURA_MULTIPLE = [
  {
    NAME: 'animateInBackground',
    DURATION: 2
  },
  {
    NAME: 'animateInHaloMulti',
    DURATION: 2
  },
  {
    NAME: 'chrome',
    DURATION: 1
  }
];
