/* global require */

'use strict';

import * as ease from './../../_easings';
import canvasUtils from './../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class EmotionStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.emotion(duration);
  }

  emotion(duration) {
    this.imageElement.ntscrimAlpha = 0;

    this.imageElement.ifNotDrawing(() => {
      this.canvasUtils.drawScrim();
      if (this.imageElement.faces.length > 1) {
        this.personalColor(duration);
      }
    });
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  personalColor(duration = 1) {
    const fillColors = this.imageElement.treatments.personalAuraColors[this.imageElement.currFace];
    this.imageElement.fills = [];

    // maybe have scrim pulse instead of just drawing?
    if (fillColors.length === 1) {
      this.canvasUtils.applyFill({
        style: fillColors[0],
        comp: 'multiply',
        alpha: 0.35
      });
      this.canvasUtils.redrawCurrentCanvas();
    } else {
      const colorTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(colorTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(colorTimeline);
        }
      });

      let active = null;
      let gradient = null;

      colorTimeline.to(this.canvas, duration * 0.75, {
        onStart: () => {
          active = colorTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          this.canvasUtils.redrawCurrentCanvas();

          const progress = active.progress();
          const opacity = ease.expOut(0.5, 1, progress);
          const radius = ease.expOut(0, 1, progress);

          gradient = this.canvasUtils.createSimpleGradient(fillColors[0], fillColors[1], radius);

          this.canvasUtils.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: opacity
          });
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
      colorTimeline.to(this.canvas, duration * 0.25, {
        onStart: () => {
          active = colorTimeline.getActive()[0];
          this.canvasUtils.redrawCurrentCanvas();

          this.canvasUtils.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: 1
          });

          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          const progress = active.progress();
          const opacity = ease.square(1, 0, progress);

          this.canvasUtils.redrawCurrentCanvas();

          this.canvasUtils.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: opacity
          });
        },
        onComplete: () => {
          this.canvasUtils.redrawCurrentCanvas();
          this.imageElement.isDrawing = false;
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
