/* global require */

'use strict';

import * as ease from './../../../_easings';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class VignetteStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.vignettePattern;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    
    this.animateInVignette(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
    this.vignettePattern = null;
  }

  drawVignetteWithAlpha(alpha = 1) {
    this.context.save();

    this.context.fillStyle = this.vignettePattern;
    this.context.globalCompositeOperation = 'overlay';
    this.context.globalAlpha = alpha;
    this.context.fill();
    this.context.restore();
  }

  animateInVignetteFrame(progress = 1) {
    if (this.imageElement.treatments.treatment.noEmotionScrim) {
      this.canvasUtils.redrawBaseImage();

      this.canvasUtils.cutOutHex();
      this.canvasUtils.drawBackgroundWithAlpha(0.35);
    } else {
      const opacity = ease.expOut(0, 0.5, progress);

      this.canvasUtils.redrawBaseImage();
      this.canvasUtils.cutOutHex();

      this.canvasUtils.drawBackgroundWithAlpha(0.25);
      this.canvasUtils.drawVignetteWithAlpha(opacity);

      this.context.restore();
    }
  }

  animateInVignette(duration = 1) {
    if (!this.imageElement.treatments.treatment.noEmotionScrim) {

      this.context.save();
     
      const vignetteGradient = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.vignette.innerColor, this.imageElement.treatments.treatment.vignette.outerColor, 0, false);

      this.canvasUtils.applyFill({
        style: colorUtils.TRANSPARENT
      });
      this.canvasUtils.applyFill({
        style: vignetteGradient
      });

      const vignetteLayer = this.canvas;
      this.vignettePattern = this.context.createPattern(vignetteLayer, 'no-repeat');

      this.context.restore();
    }

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInVignetteFrame(1);
      });
    } else {
      let active = null;
      let progress = 0;

      const vignetteTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(vignetteTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(vignetteTimeline);
          this.context.restore();
        }
      });

      vignetteTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = vignetteTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          progress = active.progress();
          this.animateInVignetteFrame(progress);
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
