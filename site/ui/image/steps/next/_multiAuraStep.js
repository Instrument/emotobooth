/* global require, single */

'use strict';

import * as ease from './../../../_easings';

import * as animationUtils from './../../../_animationUtils';
import * as colorUtils from './../../../_colorUtils';
import pointUtils from './../../_pointUtils';
import canvasUtils from './../../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class MultiAuraStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.pointUtils = new pointUtils(imageElement);
    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.animateInMultiAura(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
    this.pointUtils = null;
  }

  fillInFeatheredCircle(pattern, radius, feather, reverse = false, centered = false) {
    const tempCanvas = this.canvasUtils.createHiDPICanvas();
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    animationUtils.setSmoothing(tempContext);

    const x = centered ? this.canvas.width / 2 : this.imageElement.eyesMidpoint.x;
    const y = centered ? this.canvas.height / 2 : this.imageElement.eyesMidpoint.y;

    const gradient = tempContext.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(1 - (feather/radius), reverse ? colorUtils.TRANSPARENT : colorUtils.BLACK);
    gradient.addColorStop(1, reverse ? colorUtils.BLACK : colorUtils.TRANSPARENT);

    tempContext.fillStyle = gradient;
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempContext.fillStyle = pattern;
    tempContext.globalCompositeOperation = 'source-in';
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    const canvasPattern = tempContext.createPattern(tempCanvas, 'no-repeat');

    return canvasPattern;
  }

  animateInMultiAuraFrame(progress = 1, startR = this.canvas.width, fill = null, comp = animationUtils.BLEND_NORMAL) {
    if (!fill) {
      return;
    }

    this.imageElement.isDrawing = true;

    const feather = ease.linear(0, startR, progress);

    this.canvasUtils.redrawBaseImage();

    this.context.fillStyle = this.fillInFeatheredCircle(fill, startR, feather);
    this.context.globalAlpha = ease.expOut(0.4, 1, progress);
    this.context.globalCompositeOperation = comp;

    this.canvasUtils.cutOutHex();

    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(
      fill,
      ease.expOut(this.imageElement.hexR * 0.75, this.imageElement.hexR * 1.25, progress),
      ease.exp(this.imageElement.hexR * 0.25, this.imageElement.hexR * 0.75, progress)
    );

    this.context.globalAlpha = ease.exp(0.3, 0.7, progress);

    this.context.globalCompositeOperation = 'screen';
    this.context.fill();

    this.context.globalCompositeOperation = 'color-burn';
    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(
      fill,
      ease.expOut(this.canvas.height * 2, this.canvas.height, progress),
      ease.exp(this.canvas.height, this.canvas.height - (this.imageElement.hexR / 2), progress),
      true,
      false
    );

    this.context.globalAlpha = ease.exp(0, 0.6, progress);

    this.context.globalCompositeOperation = 'multiply';
    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(colorUtils.BLACK, this.canvas.height, this.canvas.height / 6, true, true);
    this.context.globalAlpha = ease.exp(0, 0.05, progress);
    this.context.globalCompositeOperation = 'source-over';
    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(fill, this.canvas.height * 1.2, this.canvas.height / 5, true, true);
    this.context.globalAlpha = ease.exp(0, 1, progress);
    this.context.globalCompositeOperation = 'hard-light';
    this.context.fill();

    this.imageElement.isDrawing = false;
  }

  animateInMultiAura(duration = 1) {
    let fill = null;
    const comp = this.imageElement.treatments.groupAuraColors.length > 0 ? 'screen' : 'lighten';
    const startR = this.pointUtils.toGridCoords(this.imageElement.faceBounds.right - this.imageElement.faceBounds.left) / 2;

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInMultiAuraFrame(1, this.canvas.width, this.getMultiAuraFill(), comp); 
      });
    } else {
      let active = null;

      const auraTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(auraTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(auraTimeline);
        }
      });
      auraTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = auraTimeline.getActive()[0];
          fill = this.getMultiAuraFill();
          this.imageElement.fills = [fill];
          this.imageElement.isDrawing = false;
          this.imageElement.tweens.push(active);
        },
        onUpdate: () => {
          const progress = active.progress();
          const r = ease.exp(startR, this.canvas.width, progress);

          this.animateInMultiAuraFrame(progress, r, this.imageElement.fills[0], comp);
        },
        onComplete: () => {
          this.imageElement.killTween(active);
        }
      });
    }
  }

  getMultiAuraFill() {
    const tempCanvas = this.canvasUtils.createHiDPICanvas(this.imageElement.canvasWidth, this.imageElement.canvasHeight);
    tempCanvas.width = this.imageElement.canvasWidth;
    tempCanvas.height = this.imageElement.canvasHeight;
    const tempContext = tempCanvas.getContext('2d');
    animationUtils.setSmoothing(tempContext);

    const gradientColors = this.imageElement.treatments.groupAuraColors;

    // no one in the group shows any emotion
    if (gradientColors.length === 0) {
      tempContext.save();
      tempContext.fillStyle = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.35);
      tempContext.globalAlpha = 1;
      tempContext.globalCompositeOperation = 'source-over';

      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const solidPattern = tempContext.createPattern(tempCanvas, 'no-repeat');

      tempContext.restore();

      return solidPattern;

    } else if (gradientColors.length === 1){
      // only one emotion in the entire group
      const gradient = this.canvasUtils.createSimpleGradient(gradientColors[0], colorUtils.subAlpha(gradientColors[0], 0.2));

      tempContext.save();
      tempContext.fillStyle = gradient;
      tempContext.globalAlpha = 1;
      tempContext.globalCompositeOperation = 'source-over';

      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');

      tempContext.restore();

      return gradientPattern;
    }

    tempContext.save();
    // get total number of emotions to display, and then tween between their colors, degree by degree
    const degBetweenColors = 360 / gradientColors.length;
    let currOffset = 0;
    const offsetDeg = 30 - Math.floor(Math.random() * 36) + 135;
    const startOffset = 360 + offsetDeg;
    tempContext.globalCompositeOperation = animationUtils.BLEND_NORMAL;

    tempContext.fillStyle = colorUtils.WHITE;
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempContext.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
    tempContext.lineWidth = 1;
    tempContext.lineCap = 'round';

    gradientColors.forEach((color, index, arr) => {
      const nextColor = arr[(index + 1) % arr.length];
      const colorSplit = colorUtils.splitRGBA(color);
      const nextColorSplit = colorUtils.splitRGBA(nextColor);
      const rStep = (nextColorSplit.r - colorSplit.r) / degBetweenColors;
      const gStep = (nextColorSplit.g - colorSplit.g) / degBetweenColors;
      const bStep = (nextColorSplit.b - colorSplit.b) / degBetweenColors;
      currOffset = degBetweenColors * index + startOffset;

      for (let currDeg = 0; currDeg < degBetweenColors; currDeg += single ? 0.01 : 0.02) {
        const actualCurrDeg = currDeg + currOffset + startOffset;
        tempContext.save();
        tempContext.rotate(Math.PI * actualCurrDeg * -1 / 180);
        tempContext.translate(tempContext.lineWidth / 2 * -1, tempContext.lineWidth / 2);

        const currR = parseInt(colorSplit.r + (currDeg * rStep), 10);
        const currG = parseInt(colorSplit.g + (currDeg * gStep), 10);
        const currB = parseInt(colorSplit.b + (currDeg * bStep), 10);
        const currA = 1;
        const currStyle = `rgba(${ currR }, ${ currG }, ${ currB }, ${ currA })`;

        tempContext.globalAlpha = currA;

        tempContext.fillStyle = currStyle;

        tempContext.fillRect(0, 0, 0.8, Math.max(tempCanvas.width, tempCanvas.height) * 2);

        tempContext.restore();
      }
    });

    const gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');

    tempContext.restore();

    return gradientPattern;
  }

}
