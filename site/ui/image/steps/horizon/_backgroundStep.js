/* global require */

'use strict';

import * as ease from './../../../_easings';
import canvasUtils from './../../_canvasUtils';

import {
  TOTAL_CIRCLE_FRAMES
} from './../../_imageConst';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class BackgroundStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;

    this.circleStarted = false;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    
    this.animateInBackground(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  animateInBackgroundFrame(progress = 1) {
    this.context.save();

    this.canvasUtils.redrawBaseImage();

    this.canvasUtils.createShapeBackground(progress);

    
    if (!this.circleStarted && progress !== 1) {
      this.circleStarted = true;
      this.canvasUtils.drawCircle();
    } else {
      if (this.imageElement.currentFrame >= TOTAL_CIRCLE_FRAMES) {
        this.canvasUtils.createTopShapes(true, 0);
      }
    }

    this.context.restore();
  }

  animateInBackground(duration = 1) {
    const rEnd = this.canvas.width;

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInBackgroundFrame(1, rEnd);
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

      const rStart = this.imageElement.hexR;
      let progress = 0;
      let currR = rStart;

      backgroundTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = backgroundTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          progress = active.progress();
          currR = ease.exp(rStart, rEnd, progress);
          this.animateInBackgroundFrame(progress, currR);
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
