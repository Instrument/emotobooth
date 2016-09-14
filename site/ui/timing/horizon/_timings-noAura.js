'use strict';

// All times are in seconds

export const STATES_INIT_FACE = [
  {
    NAME: 'flash',
    DURATION: 0.5
  },
  {
    NAME: 'analyze',
    DURATION: 1
  }
];

export const STATES_FINAL_FACE = [
  {
    NAME: 'zoomOut',
    DURATION: 0.5
  },
  {
    NAME: 'complete',
    DURATION: 0.2
  }
];

// times are in seconds.
export const STATES_SINGLE_FACE = [
  {
    NAME: 'zoom',
    DURATION: 0.5
  },
  {
    NAME: 'face',
    DURATION: 2
  },
  {
    NAME: 'forehead',
    DURATION: 2
  },
  {
    NAME: 'eyes',
    DURATION: 2
  },
  {
    NAME: 'ears',
    DURATION: 2
  },
  {
    NAME: 'nose',
    DURATION: 2
  },
  {
    NAME: 'mouth',
    DURATION: 2
  },
  {
    NAME: 'chin',
    DURATION: 2
  },
  {
    NAME: 'emotion',
    DURATION: 2
  }
];

export const STATES_MULTIPLE_FACES = [
  {
    NAME: 'zoom',
    DURATION: 0.5
  },
  {
    NAME: 'face',
    DURATION: 2
  },
  {
    NAME: 'allFeatures',
    DURATION: 5
  },
  {
    NAME: 'emotion',
    DURATION: 2
  }
];

export const STATES_AURA_SINGLE = [];

export const STATES_AURA_MULTIPLE = [];
