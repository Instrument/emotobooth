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
    DURATION: 1
  },
  {
    NAME: 'animateInVignette',
    DURATION: 2
  },
  {
    NAME: 'animateInHalo',
    DURATION: 3
  },
  {
    NAME: 'chrome',
    DURATION: 2
  }
];

export const STATES_AURA_MULTIPLE = [
  {
    NAME: 'animateInMultiAura',
    DURATION: 1
  },
  {
    NAME: 'pause',
    DURATION: 0.5
  },
  {
    NAME: 'chrome',
    DURATION: 2
  }
];
