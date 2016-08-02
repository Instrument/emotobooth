/* global require */

'use strict';

import * as animationUtils from './../_animationUtils';
import * as geometryUtils from './../_geometryUtils';
const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class PointUtils {
  constructor(imageElement) {
    this.imageElement = imageElement;
  }

  drawPointsWithAnim(points, duration) {
    const timeline = new Timeline({
      onComplete: () => {
        this.imageElement.killTimeline(timeline);
      }
    });

    let active = null;
    let prog = 0;
    timeline.to(this.imageElement.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.imageElement.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.drawPoints(points, prog);
      },
      onComplete: () => {
        this.imageElement.killTween(active);
      }
    });
    timeline.to(this.imageElement.canvas, duration - (animationUtils.POINTS_FADE_DURATION * 2), {
      onStart: () => {
        active = timeline.getActive()[0];
        this.imageElement.tweens.push(active);
      },
      onUpdate: () => {
        this.drawPoints(points);
      },
      onComplete: () => {
        this.imageElement.killTween(active);
      }
    });
    timeline.to(this.imageElement.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.imageElement.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.drawPoints(points, 1 - prog);
      },
      onComplete: () => {
        this.imageElement.killTween(active);
      }
    });

    this.imageElement.timelines.push(timeline);
  }

  drawPoints(points = [], alpha = 1) {
    if (points.length === 0) {
      return;
    }

    this.imageElement.ifNotDrawing(() => {
      this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.context.drawImage(this.imageElement.image, this.imageElement.offsetX, this.imageElement.offsetY, this.width, this.height, 0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.canvasUtils.drawScrim(() => {
        points.forEach((point, index) => {
          this.drawPoint(point, alpha, index === points.length - 1);
        });
      });
    });
  }

  pointToGridCoords(point = null) {
    if (!point) {
      return new geometryUtils.Point(0, 0);
    }

    return new geometryUtils.Point(this.toGridCoords(point.x, 'x'), this.toGridCoords(point.y, 'y'));
  }

  drawPoint(point, alpha = 1, isLast = false) {
    this.imageElement.isDrawing = false;

    const x = this.toGridCoords(point.position.x, 'x');
    const y = this.toGridCoords(point.position.y, 'y');

    this.imageElement.context.beginPath();
    this.imageElement.context.fillStyle = `rgba(255, 255, 255, ${ alpha })`;
    this.imageElement.context.arc(x, y, 3, 0, Math.PI * 2);
    this.imageElement.context.fill();
    this.imageElement.context.closePath();

    if (isLast) {
      this.imageElement.isDrawing = false;
    }
  }

  toGridCoords(value = this.imageElement.canvas.width, axis = null) {
    let offset = 0;
    if (axis === 'x') {
      if (this.imageElement.offsetX === 0 && this.imageElement.resizedImageOffset) {
        offset = this.imageElement.resizedImageOffset.x;
      } else {
        offset = this.imageElement.offsetX;
      }
    } else if (axis === 'y') {
      if (this.imageElement.offsetY === 0 && this.imageElement.resizedImageOffset) {
        offset = this.imageElement.resizedImageOffset.y;
      } else {
        offset = this.imageElement.offsetY;
      }
    }

    // this.imageElement.resizedImageOffset
    // this.imageElement.imageScale


    return ((value - offset) / this.imageElement.imageScale);
  }

}
