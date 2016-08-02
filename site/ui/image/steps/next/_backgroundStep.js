/* global require */

'use strict';

import * as ease from './../../../_easings';
import * as geometryUtils from './../../../_geometryUtils';
import canvasUtils from './../../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class BackgroundStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.vignettePattern;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    
    this.animateInBackground(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  animateInBackgroundFrame(progress = 1, hexRadius = 1) {
    this.canvasUtils.redrawBaseImage();

    this.canvasUtils.cutOutHex(false);

    this.imageElement.context.save();
    this.imageElement.context.moveTo(0, 0);
    this.imageElement.context.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);

    const points = geometryUtils.createRoundedHexagon(Math.max(this.imageElement.hexR, hexRadius));

    this.imageElement.context.moveTo(Math.max(this.imageElement.hexR, hexRadius), 0);

    points.reverse();

    points.forEach((vertex, i, vertices) => {
      if (i % 2 === 0) {
        this.imageElement.context.lineTo(vertex.x, vertex.y);
      } else {
        const prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
        let xMid = (vertex.x + prev.x) / 2;
        let yMid = (vertex.y + prev.y) / 2;
        const r = geometryUtils.distanceFromCoords(prev, vertex) / 2;

        const bigIndex = Math.floor(i / 2);
        if ([0, 4].includes(bigIndex)) {
          xMid -= r / 2;
        } else if ([1, 2].includes(bigIndex)) {
          xMid += r / 2;
        } else if ([5].includes(bigIndex)) {
          xMid -= (r * Math.sqrt(3) / 2);
        } else if ([3].includes(bigIndex)) {
          xMid += r / 3;
        }

        if ([5, 1].includes(bigIndex)) {
          yMid -= r / 2;
        } else if ([4].includes(bigIndex)) {
          yMid += r / 2;
        } else if ([0].includes(bigIndex)) {
          yMid -= r / 2;
        } else if ([3].includes(bigIndex)) {
          yMid += r / 2;
        }

        const startAngle = (30 + (bigIndex * 60) + 360) % 360;
        const endAngle = (startAngle + 60 + 360) % 360;

        this.imageElement.context.arc(xMid, yMid, r, (startAngle / 360) * (Math.PI * 2), (endAngle / 360) * (Math.PI * 2), false);
      }

    });

    this.imageElement.context.closePath();
    this.imageElement.context.restore();

    this.canvasUtils.drawBackgroundWithAlpha(ease.square(0, 0.25, progress));
  }

  animateInBackground(duration = 1) {
    const rEnd = this.imageElement.canvas.width;

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
          this.imageElement.context.restore();
        }
      });

      const rStart = this.imageElement.hexR;
      let progress = 0;
      let currR = rStart;

      backgroundTimeline.to(this.imageElement.canvas, duration, {
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
