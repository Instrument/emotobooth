'use strict';

// All times are in seconds

export const STATES_INIT_FACE = [];

export const STATES_FINAL_FACE = [
  {
    NAME: 'zoomOut',
    DURATION: 0
  }
];

// times are in seconds.
export const STATES_SINGLE_FACE = [];

export const STATES_MULTIPLE_FACES = [];

export const STATES_AURA_SINGLE = [
  {
    NAME: 'animateInBackground',
    DURATION: 0
  },
  {
    NAME: 'animateInVignette',
    DURATION: 0
  },
  {
    NAME: 'animateInHalo',
    DURATION: 0
  },
  {
    NAME: 'chrome',
    DURATION: 0
  }
];

export const STATES_AURA_MULTIPLE = [
  {
    NAME: 'animateInMultiAura',
    DURATION: 0
  },
  {
    NAME: 'pause',
    DURATION: 0
  },
  {
    NAME: 'chrome',
    DURATION: 0
  }
];
