/* global require */

'use strict';

import canvasUtils from './../_canvasUtils';

const Tween = require('gsap/src/minified/TweenMax.min.js');
const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class FlashStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    
    this.flash(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  flash(duration = 0) {
    const thisTimeline = new Timeline({
      onComplete: () => {
        this.imageElement.killTimeline(thisTimeline);
      }
    });
    const origBrightness = 100;
    let currBrightness = origBrightness;
    const targetBrightness = 200;

    const flashUpTime = duration * 0.2;
    const flashDownTime = duration - flashUpTime;

    let currActive = null;
    thisTimeline.to(this.canvas, flashUpTime, {
      onStart: () => {
        currActive = thisTimeline.getActive()[0];
        this.imageElement.tweens.push(currActive);
      },
      onUpdate: () => {
        if (currActive) {
          currBrightness = origBrightness + ((targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2));
          Tween.set(this.canvas, {
            css: {
              '-webkit-filter': `brightness(${ currBrightness }%)`
            }
          });
        }
      },
      onComplete: () => {
        this.imageElement.killTween(currActive);
      }
    });
    thisTimeline.to(this.canvas, flashDownTime, {
      onStart: () => {
        currActive = thisTimeline.getActive()[0];
        this.imageElement.tweens.push(currActive);
      },
      onUpdate: () => {
        if (currActive) {
          currBrightness = targetBrightness - ((targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2));
          Tween.set(this.canvas, {
            css: {
              '-webkit-filter': `brightness(${ currBrightness }%)`
            }
          });
        }
      },
      onComplete: () => {
        this.imageElement.killTween(currActive);
      }
    });
    thisTimeline.to(this.canvas, 0, {
      clearProps: '-webkit-filter'
    });

    this.imageElement.timelines.push(thisTimeline);
  }

}
