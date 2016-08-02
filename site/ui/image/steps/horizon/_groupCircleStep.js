/* global require */

'use strict';

import canvasUtils from './../../_canvasUtils';

import {
  TOTAL_CIRCLE_FRAMES
} from './../../_imageConst';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class CircleStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;

    this.circleStarted = false;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    
    this.animateInCircle(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  animateInCircleFrame(progress = 1) {
    this.canvasUtils.redrawBaseImage();
    if (!this.circleStarted && progress !== 1) {
      this.circleStarted = true;
      this.canvasUtils.drawCircle();
    } else {
      if (this.imageElement.currentFrame >= TOTAL_CIRCLE_FRAMES) {
        this.canvasUtils.createTopShapes(true, 0);
      }
    }
  }

  animateInCircle(duration = 1) {
    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInCircleFrame(1);
      });
    } else {
      let active = null;
      const backgroundTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(backgroundTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(backgroundTimeline);
          this.context.restore();
        }
      });

      let progress = 0;

      backgroundTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = backgroundTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          progress = active.progress();
          this.animateInCircleFrame(progress);
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
