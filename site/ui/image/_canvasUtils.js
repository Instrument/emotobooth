/* global require, single, document, window, Image, requestAnimationFrame */

'use strict';

import * as animationUtils from './../_animationUtils';
import * as geometryUtils from './../_geometryUtils';
import * as colorUtils from './../_colorUtils';
import pointUtils from './_pointUtils';
import * as ease from './../_easings';

import {
  TOTAL_CIRCLE_FRAMES
} from './_imageConst';

import {getStrongestColor} from './../_animationUtils';

const Tween = require('gsap/src/minified/TweenMax.min.js');

const BASE_RADIUS = 135;
const BASE_GROUP_RADIUS = 225;
const MAX_GROUP_RADIUS = 390;
const CIRCLE_OFFSET = 10;
const CIRCLE_GROUP_OFFSET = 75;
const LINE_WIDTH = 2;
const LINE_WIDTH_PRINT = 7;
const LINE_TRANSLATE_OFFSET = 0;

export default class CanvasUtils {
  constructor(imageElement) {
    this.imageElement = imageElement;

    this.pointUtils = new pointUtils(imageElement);

    this.shapeScale = 1;
    
    if (single) {
      this.shapeScale = 2;
    }

    this.PIXEL_RATIO = (function () {
        const ctx = document.createElement('canvas').getContext('2d'),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                  ctx.mozBackingStorePixelRatio ||
                  ctx.msBackingStorePixelRatio ||
                  ctx.oBackingStorePixelRatio ||
                  ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    })();

    this.isGroup = this.imageElement.facesAndEmotions.length !== 1;
  }

  retraceCanvas() {
    this.imageElement.context.beginPath();
    this.imageElement.context.moveTo(0, 0);
    this.imageElement.context.lineTo(this.imageElement.canvas.width, 0);
    this.imageElement.context.lineTo(this.imageElement.canvas.width, this.imageElement.canvas.height);
    this.imageElement.context.lineTo(0, this.imageElement.canvas.height);
    this.imageElement.context.lineTo(0, 0);
    this.imageElement.context.closePath();
  }

  createHiDPICanvas(w, h, ratio) {
    if (!ratio) {
      ratio = this.PIXEL_RATIO;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w * ratio;
    tempCanvas.height = h * ratio;
    tempCanvas.style.width = `${ w }px`;
    tempCanvas.style.height = `${ h }px`;
    tempCanvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    return tempCanvas;
  }

  drawScrim(callback = null) {
    if (this.imageElement.scrimAlpha === 0) {
      this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.context.drawImage(this.imageElement.image, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.width, this.imageElement.height, 0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
    } else {
      this.imageElement.context.globalAlpha = this.imageElement.scrimAlpha * colorUtils.SCRIM_MAX_ALPHA;
      this.imageElement.context.fillStyle = 'rgb(0, 0, 0)';
      this.imageElement.context.fillRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.context.globalAlpha = 1;
    }
    if (callback) {
      callback();
    }
  }

  redrawCurrentCanvas() {
    this.retraceCanvas();
    this.imageElement.context.globalAlpha = 1;
    this.imageElement.context.globalCompositeOperation = 'source-over';
    this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
    this.imageElement.context.fillStyle = this.imageElement.canvasSnapshot;
    this.imageElement.context.fill();
  }

  redrawBaseImage() {
    this.retraceCanvas();
    this.imageElement.context.globalAlpha = 1;
    this.imageElement.context.globalCompositeOperation = 'source-over';
    this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);

    this.fillBackground();

    if (single && (this.imageElement.offsetY < 0 || this.imageElement.offsetX < 0)) {
      this.imageElement.offsetX = ((this.imageElement.subRect.width - this.imageElement.image.width) / 2) / this.imageElement.resizedImageScale;
      this.imageElement.offsetY = (this.imageElement.subRect.height - this.imageElement.image.height) / this.imageElement.resizedImageScale;

      this.imageElement.context.drawImage(this.imageElement.image, 0, 0, this.imageElement.image.width, this.imageElement.image.height, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.canvas.width - (2 * this.imageElement.offsetX), this.imageElement.canvas.height - this.imageElement.offsetY);

      this.imageElement.resizedImageOffset = {
        x: this.imageElement.offsetX * -1 * this.imageElement.resizedImageScale,
        y: this.imageElement.offsetY * -1 * this.imageElement.resizedImageScale
      };

      if (this.imageElement.backgroundFill === 'blue' || this.imageElement.backgroundFill === 'rgba(0, 0, 255, 1)') {
        const dataSample = animationUtils.getSquareColorSample(this.imageElement.canvas, 10, new geometryUtils.Point(this.imageElement.canvas.width / 2, this.imageElement.offsetY));
        this.imageElement.backgroundFill = dataSample;
        this.redrawBaseImage();
      }
    } else {
      this.imageElement.context.drawImage(this.imageElement.image, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.subRect.width, this.imageElement.subRect.height, 0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      if (this.imageElement.backgroundFill === 'blue' || this.imageElement.backgroundFill === 'rgba(0, 0, 255, 1)') {
        let sampleOffset = 1;
        if (this.imageElement.resizedImageScale) {
          sampleOffset = this.imageElement.imageScale / this.imageElement.resizedImageScale;
        }

        const dataSample = animationUtils.getSquareColorSample(this.imageElement.canvas, 10, new geometryUtils.Point(Math.min(this.imageElement.canvas.width / 2, Math.abs(this.imageElement.offsetX)), (Math.min(this.imageElement.offsetY, 0) * -1 * sampleOffset)));

        this.imageElement.backgroundFill = dataSample;
        this.redrawBaseImage();
      }
    }
  }

  loadImage(json, imgPath) {
    this.imageElement.reinitFaces(json);

    const image = new Image();
    image.src = imgPath || this.imgPath;

    image.onload = () => {
      this.imageElement.image = image;
      this.imageElement.killAnimations();
      this.setImageScale();
      this.generateHexInfo();
      this.cleanUpImage();
    };
  }

  drawRect(topLeft, width, height, alpha = 1) {
    this.imageElement.ifNotDrawing(() => {
      this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.context.drawImage(this.imageElement.image, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.width, this.imageElement.height, 0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.drawScrim(() => {
        const x = this.pointUtils.toGridCoords(topLeft.x, 'x');
        const y = this.pointUtils.toGridCoords(topLeft.y, 'y');
        const w = this.pointUtils.toGridCoords(width);
        const h = this.pointUtils.toGridCoords(height);

        this.imageElement.context.strokeStyle = `rgba(255, 255, 255, ${ alpha })`;
        this.imageElement.context.lineWidth = 5;
        this.imageElement.context.strokeRect(x, y, w, h);
      });
    });
  }

  getSubRectDimension(image) {
    let width = this.imageElement.canvas.width;
    let height = this.imageElement.canvas.height;

    const widthsRatio = this.imageElement.canvas.width / image.width;
    const heightsRatio = this.imageElement.canvas.height / image.height;

    if (widthsRatio > heightsRatio) {
      width = image.width;
      height = this.imageElement.canvas.height / widthsRatio;
      this.imageElement.imageScale = 1 / widthsRatio;
    } else {
      height = image.height;
      width = this.imageElement.canvas.width / heightsRatio;
      this.imageElement.imageScale = 1 / heightsRatio;
    }

    return { width, height };
  }

  setImageScale(image = this.imageElement.image) {
    const widthsRatio = this.imageElement.canvas.width / image.width;
    const heightsRatio = this.imageElement.canvas.height / image.height;

    if (widthsRatio > heightsRatio) {
      this.imageElement.imageScale = 1 / widthsRatio;
    } else {
      this.imageElement.imageScale = 1 / heightsRatio;
    }
  }

  cleanUpImage() {
    this.resizeContent(() => {
      this.generateHexInfo();
      if (this.imageElement.readyCallback) {
        this.imageElement.readyCallback();
      }
    });
  }

  resizeContent(callback = null) {
    const scaledMin = animationUtils.MIN_HEX_RADIUS * this.imageElement.canvas.height;
    const scaledMax = animationUtils.MAX_HEX_RADIUS * this.imageElement.canvas.height;
    let targetHexR = this.imageElement.hexR;

    if (this.imageElement.hexR < scaledMin) {
      // make sure that we don't scale the image too much
      if ((scaledMin - this.imageElement.hexR) > (this.imageElement.hexR * animationUtils.MAX_HEX_DIFF)) {
        targetHexR = this.imageElement.hexR + (this.imageElement.hexR * animationUtils.MAX_HEX_DIFF);
      } else {
        targetHexR = scaledMin;
      }
    } else if (this.imageElement.hexR > scaledMax) {
      if ((this.imageElement.hexR - scaledMax) > (this.imageElement.hexR * animationUtils.MAX_HEX_DIFF)) {
        targetHexR = this.imageElement.hexR - (this.imageElement.hexR * animationUtils.MAX_HEX_DIFF);
      } else {
        targetHexR = scaledMax;
      }
    }

    // work backwards.
    let targetFaceDiff = targetHexR;
    const currentFaceDiff = this.imageElement.faceBounds.right - this.imageElement.faceBounds.left;
    // 1. get target difference between left and right face edges.
    if (this.imageElement.faces.length === 1) {
      targetFaceDiff /= 2;
    }
    targetFaceDiff *= Math.sqrt(3);
    // 2. use this to calculate different, ideal image scale.
    const newImageScale = 1 / (targetFaceDiff / currentFaceDiff);

    this.imageElement.subRect = {
      width: this.imageElement.canvas.width * newImageScale,
      height: this.imageElement.canvas.height * newImageScale
    };

    if (this.imageElement.image.width < this.imageElement.subRect.width) {
      this.imageElement.subRect.width = this.imageElement.image.width;
      this.imageElement.subRect.height = (this.imageElement.canvas.height / this.imageElement.canvas.width) * this.imageElement.subRect.width;
    }

    this.imageElement.width = this.imageElement.subRect.width;
    this.imageElement.height = this.imageElement.subRect.height;
    this.imageElement.resizedImageScale = this.imageElement.subRect.width / this.imageElement.canvas.width;

    this.imageElement.offsetX = (this.imageElement.image.width - this.imageElement.subRect.width) / 2;
    this.imageElement.offsetY = (this.imageElement.image.height - this.imageElement.subRect.height) / 2;

    this.imageElement.resizedImageOffset = {
      x: this.imageElement.offsetX,
      y: this.imageElement.offsetY
    };

    this.redrawBaseImage();

    if (callback) {
      callback();
    }
  }

  generateHexInfo() {
    this.imageElement.hexR = this.createHexR();
    this.imageElement.hexVertices = this.createHexVertices(this.imageElement.hexR);
  }

  createHexR() {
    let r = 1;
    const baseDistance = geometryUtils.distanceFromCoords(new geometryUtils.Point(this.imageElement.faceBounds.left, this.imageElement.faceBounds.bottom), new geometryUtils.Point(this.imageElement.faceBounds.right, this.imageElement.faceBounds.top));

    if (this.imageElement.resizedImageScale) {
      r = baseDistance / this.imageElement.resizedImageScale / Math.sqrt(3);
    } else {
      r = this.pointUtils.toGridCoords(baseDistance) / Math.sqrt(3);
    }

    if (this.imageElement.facesAndEmotions.length === 1) {
      r *= 1.5;
    }

    return r;
  }

  createHexVertices(radius = 1) {
    return (geometryUtils.createRoundedHexagon(radius, radius / 6));
  }

  cutOutHex(closePath = true) {
    this.imageElement.context.save();

    this.imageElement.context.beginPath();
    if (closePath) {
      this.imageElement.context.moveTo(0, 0);
      this.imageElement.context.lineTo(this.imageElement.canvas.width, 0);
      this.imageElement.context.lineTo(this.imageElement.canvas.width, this.imageElement.canvas.height);
      this.imageElement.context.lineTo(0, this.imageElement.canvas.height);
      this.imageElement.context.lineTo(0, 0);
    }

    this.imageElement.context.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
    this.imageElement.context.rotate(0);

    this.imageElement.hexVertices.forEach((vertex, i, vertices) => {
      if (i === 0) {
        this.imageElement.context.moveTo(vertex.x, vertex.y);
        return;
      }
      if (i % 2 === 0) {
        this.imageElement.context.lineTo(vertex.x, vertex.y);
      } else {
        const prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
        let xMid = (vertex.x + prev.x) / 2;
        let yMid = (vertex.y + prev.y) / 2;
        const r = geometryUtils.distanceFromCoords(prev, vertex) / 2;

        const bigIndex = Math.floor(i / 2);
        if ([5].includes(bigIndex)) {
          xMid -= r * (Math.sqrt(3) / 3);
        } else if ([2, 3].includes(bigIndex)) {
          xMid += r * (Math.sqrt(3) / 3);
        } else if ([4].includes(bigIndex)) {
          xMid += r * (Math.sqrt(2) / 4);
        } else if ([1].includes(bigIndex)) {
          xMid -= r * (Math.sqrt(2) / 4);
        } else if ([0].includes(bigIndex)) {
          xMid -= r * (Math.sqrt(3) / 3);
        }

        if ([1, 2].includes(bigIndex)) {
          yMid += r / 2;
        } else if ([4, 5].includes(bigIndex)) {
          yMid -= r / 2;
        }

        const startAngle = (30 + (bigIndex * - 1 * 60) + 360) % 360;
        const endAngle = (startAngle - 60 + 360) % 360;

        this.imageElement.context.arc(xMid, yMid, r, (startAngle / 360) * (Math.PI * 2), (endAngle / 360) * (Math.PI * 2), true);
      }
    });

    if (closePath) {
      this.imageElement.context.closePath();
    }
    this.imageElement.context.restore();
  }

  cutOutCircle(closePath = true) {
    const baseRadius = this.getBaseRadius();

    let circleOffset = CIRCLE_OFFSET;
    if (this.isGroup) {
      circleOffset = CIRCLE_GROUP_OFFSET;
    }

    this.imageElement.context.save();

    this.imageElement.context.beginPath();
    this.imageElement.context.moveTo(0, 0);
    this.imageElement.context.lineTo(0, this.imageElement.canvasHeight);
    this.imageElement.context.lineTo(this.imageElement.canvasWidth, this.imageElement.canvasHeight);
    this.imageElement.context.lineTo(this.imageElement.canvasWidth, 0);
    this.imageElement.context.lineTo(0, 0);

    this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, Math.PI * 2);

    if (closePath) {
      this.imageElement.context.closePath();
    }
    this.imageElement.context.restore();
  }

  fillBackground() {
    this.imageElement.context.fillStyle = this.imageElement.backgroundFill;
    this.imageElement.context.globalAlpha = 1;
    this.imageElement.context.globalCompositeOperation = 'source-over';
    this.imageElement.context.fillRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
  }

  drawBackgroundWithAlpha(alpha = 1) {
    this.imageElement.context.save();

    this.imageElement.context.fillStyle = this.imageElement.treatments.treatment.noEmotionScrim ? colorUtils.subAlpha(colorUtils.NEUTRAL, 0.25) : this.imageElement.treatments.treatment.background;
    this.imageElement.context.globalCompositeOperation = 'multiply';
    this.imageElement.context.globalAlpha = alpha;

    this.imageElement.context.fill();
    this.imageElement.context.restore();
  }

  drawVignetteWithAlpha(alpha = 1) {
    this.imageElement.context.save();

    this.imageElement.context.fillStyle = this.vignettePattern;
    this.imageElement.context.globalCompositeOperation = 'overlay';
    this.imageElement.context.globalAlpha = alpha;
    this.imageElement.context.fill();
    this.imageElement.context.restore();
  }

  applyFill(fill) {
    this.imageElement.isDrawing = false;
    this.imageElement.context.fillStyle = fill.style;
    this.imageElement.context.globalCompositeOperation = fill.comp || 'source-over';
    this.imageElement.context.globalAlpha = fill.alpha || 1;

    this.imageElement.context.fillRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);

    this.imageElement.context.globalCompositeOperation = 'source-over';
    this.imageElement.context.globalAlpha = 1;
    this.imageElement.isDrawing = false;
  }

  createSimpleGradient(centerColor = colorUtils.WHITE, edgeColor = colorUtils.BLACK, radiusFactor = 1, centered = false, colorstop1 = 0, colorstop2 = 1) {
    const x = centered ? this.imageElement.canvas.width / 2 : this.imageElement.eyesMidpoint.x;
    const y = centered ? this.imageElement.canvas.height / 2 : this.imageElement.eyesMidpoint.y;

    const gradient = this.imageElement.context.createRadialGradient(x, y, 0, x, y, this.imageElement.canvas.height * (radiusFactor || 1));

    gradient.addColorStop(colorstop1, centerColor);
    gradient.addColorStop(colorstop2, edgeColor);

    return gradient;
  }

  getBaseRadius() {
    let baseRadius = BASE_RADIUS * this.shapeScale;
    if (this.isGroup) {
      baseRadius = BASE_GROUP_RADIUS;
      if (this.imageElement.hexR > BASE_GROUP_RADIUS) {
        baseRadius = this.imageElement.hexR;
      }
      if (baseRadius > MAX_GROUP_RADIUS * this.shapeScale) {
        baseRadius = MAX_GROUP_RADIUS * this.shapeScale;
      }
    }

    return baseRadius;
  }

  createShapeBackground(opacityProgress) {
    const opacity = opacityProgress;
    this.imageElement.context.save();
    this.imageElement.context.moveTo(0, 0);
    this.imageElement.context.translate(0, 0);

    const group = this.isGroup;
    let color = null;

    let EMO_COLOR = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
    if (!this.imageElement.noEmotions) {
      if (group) {
        EMO_COLOR = getStrongestColor(this.imageElement)[0];
      } else {
        EMO_COLOR = this.imageElement.treatments.treatment.background;
      }
    }

    color = this.imageElement.noEmotions ? colorUtils.subAlpha(colorUtils.NEUTRAL_WHITE, opacity * 0.5) : colorUtils.subAlpha(EMO_COLOR, opacity * 0.9);

    const baseRadius = this.getBaseRadius();

    let circleOffset = CIRCLE_OFFSET;
    if (group) {
      circleOffset = CIRCLE_GROUP_OFFSET;
    }

    const fillColor = this.createSimpleGradient(colorUtils.TRANSPARENT, color, 0, false);

    this.imageElement.context.globalCompositeOperation = 'multiply';
    this.imageElement.context.fillStyle = fillColor;
    this.imageElement.context.beginPath();
    this.imageElement.context.moveTo(0, 0);
    this.imageElement.context.lineTo(0, this.imageElement.canvasHeight);
    this.imageElement.context.lineTo(this.imageElement.canvasWidth, this.imageElement.canvasHeight);
    this.imageElement.context.lineTo(this.imageElement.canvasWidth, 0);
    this.imageElement.context.lineTo(0, 0);

    this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, Math.PI * 2);
    this.imageElement.context.fill();
    this.imageElement.context.closePath();

    this.imageElement.context.restore();
  }

  getEmoColor() {
    let emoColor;
    if (this.imageElement.noEmotions) {
      emoColor = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
    } else {
      emoColor = 'rgba(255, 255, 255, 1)';
    }
    return emoColor;
  }

  drawCircle() {
    const group = this.isGroup;

    const baseRadius = this.getBaseRadius();

    const emoColor = this.getEmoColor();

    let circleOffset = CIRCLE_OFFSET;
    if (group) {
      circleOffset = CIRCLE_GROUP_OFFSET; 
    }

    this.imageElement.context.save();

    const perc = ease.expOut(0, 1, this.imageElement.currentFrame / TOTAL_CIRCLE_FRAMES);

    if (this.imageElement.currentFrame < TOTAL_CIRCLE_FRAMES) {
      requestAnimationFrame(this.drawCircle.bind(this));
      let lineSize = LINE_WIDTH;
      if(this.shapeScale === 2) lineSize = LINE_WIDTH_PRINT;

      this.imageElement.context.save();
      this.imageElement.context.globalCompositeOperation = 'source-over';
      this.imageElement.context.strokeStyle = emoColor;
      this.imageElement.context.lineWidth = lineSize;
      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
      this.imageElement.context.beginPath();

      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, (Math.PI * 2) * perc);

      this.imageElement.context.stroke();
      this.imageElement.context.restore();
      this.imageElement.currentFrame++;
    } else {
      this.createTopShapes(true, 0);
    }

    this.imageElement.context.restore();
  }

  createTopShapes(single, progress) {
    const group = this.isGroup;
    const blendMode = 'source-over';

    this.imageElement.context.save();
    this.imageElement.context.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);

    const emoColor = this.getEmoColor();

    let circleOffset = CIRCLE_OFFSET;
    if (group) {
      circleOffset = CIRCLE_GROUP_OFFSET;
    }

    let lineSize = LINE_WIDTH;
    if(this.shapeScale === 2) lineSize = LINE_WIDTH_PRINT;

    this.imageElement.context.restore();
    this.imageElement.context.save();
    this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
    this.imageElement.context.strokeStyle = emoColor;
    this.imageElement.context.lineWidth = lineSize;
    this.imageElement.context.globalCompositeOperation = blendMode;

    const baseRadius = this.getBaseRadius();

    this.imageElement.context.beginPath();
    this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, Math.PI * 2);
    this.imageElement.context.closePath();
    this.imageElement.context.stroke();

    if (!this.imageElement.randomizedArcs) {
      this.imageElement.randomizedArcs = [];
      for (let i = 0; i < 3; i++) {
        this.imageElement.randomizedArcs.push(Math.random() * Math.PI);
      }
    }

    if (!single) {

      if (!this.imageElement.shapesInit) {
        this.imageElement.shapesInit = true;

        this.circleAnim = 0;
        
        let timing = 1.5;

        if (progress === 1) {
          timing = 0;
        }

        Tween.to(this, timing, { circleAnim: 1, delay: 0 });
      }

      // 2

      this.imageElement.context.restore();
      this.imageElement.context.save();
      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
      this.imageElement.context.strokeStyle = emoColor;
      this.imageElement.context.lineWidth = lineSize;
      this.imageElement.context.globalCompositeOperation = blendMode;

      let randomOffset = this.imageElement.randomizedArcs[0];

      this.imageElement.context.beginPath();
      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + (15 * (this.shapeScale * 1.25)), randomOffset, randomOffset + (this.circleAnim * Math.PI));
      this.imageElement.context.stroke();

      // 3

      randomOffset = this.imageElement.randomizedArcs[1];

      this.imageElement.context.restore();
      this.imageElement.context.save();
      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
      this.imageElement.context.strokeStyle = emoColor;
      this.imageElement.context.lineWidth = lineSize;
      this.imageElement.context.globalCompositeOperation = blendMode;

      this.imageElement.context.beginPath();
      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + (35 * (this.shapeScale * 1.25)), randomOffset, randomOffset + (this.circleAnim * (Math.PI * 0.5)));
      this.imageElement.context.stroke();

      // 4

      randomOffset = this.imageElement.randomizedArcs[2];

      this.imageElement.context.restore();
      this.imageElement.context.save();
      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
      this.imageElement.context.strokeStyle = emoColor;
      this.imageElement.context.lineWidth = lineSize;
      this.imageElement.context.globalCompositeOperation = blendMode;

      this.imageElement.context.beginPath();
      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + (55 * (this.shapeScale * 1.25)), randomOffset + (-(0.1 * Math.PI)), randomOffset + (this.circleAnim * (Math.PI * 0.7)));
      this.imageElement.context.stroke();

      // 5

      this.imageElement.context.restore();
      this.imageElement.context.save();
      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
      this.imageElement.context.strokeStyle = emoColor;
      this.imageElement.context.lineWidth = lineSize;
      this.imageElement.context.globalCompositeOperation = blendMode;

      this.imageElement.context.beginPath();
      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + (55 * (this.shapeScale * 1.25)), randomOffset + (0.8 * Math.PI), randomOffset + (0.8 * Math.PI + (this.circleAnim * Math.PI)));
      this.imageElement.context.stroke();
   }

    this.imageElement.context.restore();
  }

}
