/* global require */

'use strict';

import * as utils from './../../_utils';
import * as geometryUtils from './../../_geometryUtils';
import canvasUtils from './../_canvasUtils';
import pointUtils from './../_pointUtils';

const Tween = require('gsap/src/minified/TweenMax.min.js');

export default class ZoomStep {
  constructor(imageElement, canvas, context) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.canvasUtils = new canvasUtils(imageElement, canvas, context);
    this.pointUtils = new pointUtils(imageElement);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
    this.pointUtils = null;
  }

  zoom(duration = 1, zoomOut = false) {
    const topLeft = new geometryUtils.Point(utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[0].x), utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[0].y));

    let width = Math.abs(topLeft.x - utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[1].x));
    width += geometryUtils.createPadding(width);

    let height = Math.abs(topLeft.y - utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[2].y));
    height += geometryUtils.createPadding(height);

    const centerX = topLeft.x + (width / 2);
    const centerY = topLeft.y + (height / 2);

    if (height > width) {
      width = (this.canvas.width / this.canvas.height) * height;
    } else {
      height = (this.canvas.height / this.canvas.width) * width;
    }

    let targetLeft = Math.max(centerX - (width / 2), 0);
    let targetTop = Math.max(centerY - (height / 2), 0);

    if (zoomOut) {
      width = this.imageElement.subRect.width;
      height = this.imageElement.subRect.height;

      targetLeft = this.imageElement.resizedImageOffset ? this.imageElement.resizedImageOffset.x : 0;
      targetTop = this.imageElement.resizedImageOffset ? this.imageElement.resizedImageOffset.y : 0;
    }

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.imageElement.isDrawing = false;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvasUtils.fillBackground();

        this.context.drawImage(this.imageElement.image, targetLeft, targetTop, this.imageElement.width, this.imageElement.height, 0, 0, this.canvas.width, this.canvas.height);
        this.imageElement.offsetX = targetLeft;
        this.imageElement.offsetY = targetTop;
        this.imageElement.width = width;
        this.imageElement.height = height;
        this.imageElement.imageScale = width / this.canvas.width;
        
        if (zoomOut) {
          this.imageElement.eyesMidpoint = this.pointUtils.pointToGridCoords(this.imageElement.allEyesCenter);
        } else {
          this.imageElement.eyesMidpoint = this.pointUtils.pointToGridCoords(this.imageElement.eyeMidpoints[this.imageElement.currFace]);
        }

        this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');

        this.imageElement.isDrawing = false;

      });
    } else {
      const tween = Tween.to(this.canvas, duration, {
        onStart: () => {
          this.imageElement.isDrawing = false;
          this.imageElement.tweens.push(tween);
        },
        onUpdate: () => {
          const prog = tween.progress();
          const currX = this.imageElement.offsetX - ((this.imageElement.offsetX - targetLeft) * prog);
          const currY = this.imageElement.offsetY - ((this.imageElement.offsetY - targetTop) * prog);

          const currWidth = this.imageElement.width - ((this.imageElement.width - width) * prog);
          const currHeight = this.imageElement.height - ((this.imageElement.height - height) * prog);

          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.canvasUtils.fillBackground();

          this.context.drawImage(this.imageElement.image, currX, currY, currWidth, currHeight, 0, 0, this.canvas.width, this.canvas.height);
        },
        onComplete: () => {
          this.imageElement.offsetX = targetLeft;
          this.imageElement.offsetY = targetTop;
          this.imageElement.width = width;
          this.imageElement.height = height;
          this.imageElement.imageScale = width / this.canvas.width;
          if (zoomOut) {
            this.imageElement.eyesMidpoint = this.pointUtils.pointToGridCoords(this.imageElement.allEyesCenter);
          } else {
            this.imageElement.eyesMidpoint = this.pointUtils.pointToGridCoords(this.imageElement.eyeMidpoints[this.imageElement.currFace]);
          }
          this.imageElement.killTween(tween);

          this.imageElement.isDrawing = false;
          this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
        }
      });
      this.imageElement.tweens.push(tween);
    }
  }

}
