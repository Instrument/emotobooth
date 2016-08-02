/* global require, states, single */

'use strict';

import * as faceUtils from './_faceUtils';
import * as emotionUtils from './_emotionUtils';
import * as animationUtils from './_animationUtils';

require('gsap/src/minified/TweenMax.min.js');
const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class PanelComponent {
  constructor() {
    this.faces = [];
    this.currFace = 0;

    this.timeFactor = 1;
    this.tweens = [];
    this.timelines = [];

    this.animations = null;
  }

  pause() {
  }

  reinitFaces(json, callback = false) {
    this.currFace = 0;
    const faces = [];
    const newJSON = [];

    this.tweens = [];
    this.timelines = [];

    this.animations = null;

    if (json.responses[0].faceAnnotations) {
      json.responses[0].faceAnnotations.forEach((item, index) => {
        faces.push(item);
        if (index === json.responses[0].faceAnnotations.length - 1) {
          this.faces = faceUtils.sortFaces(faces);
          this.faces.forEach((face) => {
            newJSON.push(face);
          });
          this.json = newJSON;
          if (callback) {
            callback();
          }
        }
      });
    } else if (single) {
      if (callback) {
        callback();
      }
    }
  }

  getFaceInfo() {
    const json = {};
    faceUtils.FACE_SECTIONS.forEach((section) => {
      json[section] = this.json[this.currFace][section];
    });
    return json;
  }

  getEmotionInfo(face = this.currFace) {
    const json = {};
    emotionUtils.EMOTION_LIKELIHOODS.forEach((section) => {
      json[section] = this.json[face][section];
    });
    return json;
  }

  filterLandmarks(types) {
    return this.json[this.currFace].landmarks.filter((mark) => {
      return types.indexOf(mark.type) !== -1;
    });
  }

  // sort faces, left to right, based on their left edges.
  sortFaces() {
    this.faces.sort((a, b) => {
      return (a.boundingPoly.vertices[0].x - b.boundingPoly.vertices[0].x);
    });
  }

  // empty out every timeline; kill every tween.
  killAnimations() {
    this.timelines.forEach((timeline) => {
      this.killTimeline(timeline);
    });

    this.tweens.forEach((tween) => {
      this.killTween(tween);
    });

    this.timelines = [];
    this.tweens = [];
  }

  killTimeline(timeline = null) {
    if (!timeline) {
      return;
    }

    timeline.pause();
    timeline.clear();
    timeline.eventCallback('onStart', null);
    timeline.eventCallback('onUpdate', null);
    timeline.eventCallback('onComplete', null);

    this.timelines.splice(this.timelines.indexOf(timeline), 1);
  }

  killTween(tween = null) {
    if (!tween) {
      return;
    }

    tween.pause();
    tween.kill();
    this.tweens.splice(this.tweens.indexOf(tween), 1);
  }

  startAnimations(callback = null) {
    this.animations = new Timeline({
      onComplete: () => {
        if (++this.currFace < this.faces.length) {
          this.startAnimations(callback);
        } else {
          this.currFace = 0;
          this.killTimeline(this.animations);
          if (callback) {
            callback();
          }
        }
      }
    });

    let animStates = this.faces.length > 1 ? states.STATES_MULTIPLE_FACES : states.STATES_SINGLE_FACE;
    if ((this.currFace === 0) && (states.STATES_MULTIPLE_FACES.length > 0)) {
      animStates = states.STATES_INIT_FACE.concat(animStates);
    }

    if ((this.currFace === this.faces.length - 1) || (states.STATES_MULTIPLE_FACES.length === 0)) {
      animStates = animStates.concat(states.STATES_FINAL_FACE);
    }

    animStates.forEach((state) => {
      this.animations.to(this, Math.max(state.DURATION / this.timeFactor, animationUtils.MIN_DURATION), {
        onStart: () => {
          if (this[state.NAME]) {
            this[state.NAME](state.DURATION / this.timeFactor);
          } else {
            this.pause(state.DURATION);
          }
        }
      });
    });

    this.timelines.push(this.animations);
  }
}
