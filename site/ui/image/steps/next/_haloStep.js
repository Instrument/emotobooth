/* global require */

'use strict';

import * as ease from './../../../_easings';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class HaloStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.animateInHalo(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  animateInHaloFrame(progress = 1) {
    if (this.imageElement.treatments.treatment.noEmotionScrim) {
      this.canvasUtils.redrawBaseImage();
      this.canvasUtils.cutOutHex();
      this.canvasUtils.drawBackgroundWithAlpha(0.35);
    } else {
      if (this.imageElement.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.imageElement.treatments.treatment.halo.innerColor ===  colorUtils.TRANSPARENT) {
        return;
      }
      if (this.imageElement.totalEmotions === 1) {
        this.canvasUtils.redrawBaseImage();
        this.canvasUtils.cutOutHex();
        this.context.save();
        this.canvasUtils.drawBackgroundWithAlpha(0.25);
        this.canvasUtils.drawVignetteWithAlpha(0.5);

        const alpha = ease.expOut(0, 0.75, progress);
        const r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);

        const gradient = this.context.createRadialGradient(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, this.imageElement.hexR, this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, r);

        gradient.addColorStop(0, this.imageElement.treatments.treatment.halo.innerColor);
        if (this.imageElement.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
          gradient.addColorStop(0.5, this.imageElement.treatments.treatment.halo.outerColor);
        }
        gradient.addColorStop(1, colorUtils.TRANSPARENT);

        this.context.fillStyle = gradient;
        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        this.context.restore();
      } else {
        const alpha = ease.expOut(0.2, 0.5, progress);
        const r = ease.expOut(0.1, 1.2, progress);

        this.canvasUtils.redrawBaseImage();
        this.canvasUtils.cutOutHex();
        this.context.save();

        this.canvasUtils.drawBackgroundWithAlpha(0.25);
        this.canvasUtils.drawVignetteWithAlpha(0.5);

        this.context.fillStyle = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.halo.outerColor, colorUtils.TRANSPARENT, r, false);
        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        const alpha2 = ease.expOut(0, 0.5, progress);
        const r2 = ease.expOut(0, (this.imageElement.hexR * (Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.radius : 3) / this.canvas.height), progress);
        this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha(this.imageElement.treatments.treatment.halo.innerColor, Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.alpha : 1), colorUtils.TRANSPARENT, r2, false, 0.3, 1);
        this.context.globalAlpha = alpha2;
        this.context.fill();

        this.context.restore();
      }
    }
  }

  animateInHalo(duration = 1) {
    if (duration === 0) {
      if (!this.imageElement.treatments.treatment.noEmotionScrim) {
        this.imageElement.ifNotDrawing(() => {
          this.animateInHaloFrame();
        });
      }
    } else {
      let active = null;
      let progress = 0;

      const haloTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(haloTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(haloTimeline);
          this.context.restore();
        }
      });

      haloTimeline.to(this.canvas, duration, {
        onStart: () => {
          this.context.save();
          active = haloTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
          this.context.restore();
        },
        onUpdate: () => {
          if (!this.imageElement.treatments.treatment.noEmotionScrim) {
            progress = active.progress();
            this.animateInHaloFrame(progress, this.imageElement.treatments.treatment.halo.radius);
          }
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
