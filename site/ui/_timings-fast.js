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
    DURATION: 0.2
  },
  {
    NAME: 'forehead',
    DURATION: 0.2
  },
  {
    NAME: 'eyes',
    DURATION: 0.2
  },
  {
    NAME: 'ears',
    DURATION: 0.2
  },
  {
    NAME: 'nose',
    DURATION: 0.2
  },
  {
    NAME: 'mouth',
    DURATION: 0.2
  },
  {
    NAME: 'chin',
    DURATION: 0.2
  },
  {
    NAME: 'emotion',
    DURATION: 0.2
  }
];

export const STATES_MULTIPLE_FACES = [
  {
    NAME: 'zoom',
    DURATION: 0.5
  },
  {
    NAME: 'face',
    DURATION: 0.2
  },
  {
    NAME: 'allFeatures',
    DURATION: 0.3
  },
  {
    NAME: 'emotion',
    DURATION: 0.2
  }
];

export const STATES_AURA_SINGLE = [
  {
    NAME: 'animateInBackground',
    DURATION: 1
  },
  {
    NAME: 'animateInVignette',
    DURATION: 1
  },
  {
    NAME: 'animateInHalo',
    DURATION: 1
  },
  {
    NAME: 'chrome',
    DURATION: 1
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
    DURATION: 0.2
  }
];
