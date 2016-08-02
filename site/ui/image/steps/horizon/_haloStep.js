/* global require */

'use strict';

import * as ease from './../../../_easings';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';
import {getStrongestColor} from './../../../_animationUtils';

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

  animateInHaloFrame(prg = 1) {
    const progress = prg / 2;
    const group = this.imageElement.facesAndEmotions.length !== 1;

    this.canvasUtils.redrawBaseImage();
    this.context.save();
    this.canvasUtils.createShapeBackground(1);

    if (!this.imageElement.noEmotions) {

      if(this.imageElement.treatments.treatment) {
        if (this.imageElement.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.imageElement.treatments.treatment.halo.innerColor ===  colorUtils.TRANSPARENT) {
          this.canvasUtils.createTopShapes(false, prg);
          return;
        }
      }

      if (this.imageElement.totalEmotions === 1) {
        const alpha = ease.expOut(0, 0.5, progress);
        const r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);

        const gradient = this.context.createRadialGradient(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, this.imageElement.hexR - 125, this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, r);

        if (group) {
          gradient.addColorStop(0, getStrongestColor(this.imageElement)[1]);
        } else {
          gradient.addColorStop(0, this.imageElement.treatments.treatment.halo.innerColor);

          if (this.imageElement.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
            gradient.addColorStop(0.5, this.imageElement.treatments.treatment.halo.outerColor);
          }
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

        if (group) {
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(getStrongestColor(this.imageElement)[0], colorUtils.TRANSPARENT, r, false);
        } else {
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.halo.innerColor, this.imageElement.treatments.treatment.halo.outerColor, r, false);
        }

        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        const alpha2 = ease.expOut(0, 0.5, progress);
        let r2;
        if (group) {
          r2 = ease.expOut(0, (this.imageElement.hexR * (3) / this.canvas.height), progress);
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha(getStrongestColor(this.imageElement)[1], 1), colorUtils.TRANSPARENT, r2, false); // 0.4, 1
          this.context.globalAlpha = alpha2;
          this.context.fill();
        }

        this.context.restore();
      }
    }
    this.canvasUtils.createTopShapes(false, prg);
  }

  animateInHalo(duration = 1) {
    const group = this.imageElement.facesAndEmotions.length !== 1;

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInHaloFrame();
      });
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
          this.imageElement.allDone = true;
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
          progress = active.progress();
          if (!group) {
            if (!this.imageElement.treatments.treatment.noEmotionScrim) {
              this.animateInHaloFrame(progress, this.imageElement.treatments.treatment.halo.radius);
            } else {
              this.animateInHaloFrame(progress);
            }
          } else {
            this.animateInHaloFrame(progress);
          }
        },
        onComplete: () => {
          this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
