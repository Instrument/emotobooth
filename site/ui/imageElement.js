/* global require, single, document, window, Image, states, requestAnimationFrame */

'use strict';

import PanelComponent from './panelComponent';

import * as assets from './_assets';
import * as ease from './_easings';

import * as utils from './_utils';
import * as animationUtils from './_animationUtils';
import * as faceUtils from './_faceUtils';
import * as geometryUtils from './_geometryUtils';
import * as colorUtils from './_colorUtils';

const Tween = require('gsap/src/minified/TweenMax.min.js');
const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class ImageElement extends PanelComponent {
  constructor(imgPath = null, jsonPath = null, readyCallback = null) {
    super();

    this.canvasWidth = single ? animationUtils.BACKEND_CANVAS_WIDTH : animationUtils.CANVAS_WIDTH;
    this.canvasHeight = single ? animationUtils.BACKEND_CANVAS_HEIGHT : animationUtils.CANVAS_HEIGHT;

    this.imgPath = imgPath;
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.image = null;
    this.logo = null;

    this.logoTop = 40;
    this.logoLeft = 40;
    this.logoWidth = 348 * (110 / 348);
    this.logoHeight = 136 * (110 / 348);

    this.finalImage = null;

    this.jsonPath = jsonPath;
    this.json = null;

    this.offsetX = 0;
    this.offsetY = 0;
    this.width = 0;
    this.height = 0;
    this.imageScale = 1;
    this.subRect = {};

    this.fills = [];
    this.scrimAlpha = 0;

    this.eyesMidpoint = new geometryUtils.Point();
    this.allEyesCenter = new geometryUtils.Point();
    this.faceBounds = null;
    this.facesAndEmotions = null;
    this.facesAndStrongestEmotions = null;
    this.treatments = null;

    this.gradientURL = null;

    this.isDrawing = false;
    this.auraAnimations = null;

    this.totalEmotions = 0;
    this.noEmotions = true;
    this.facesAndEmotions = [];
    this.facesAndColors = [];
    this.eyeMidpoints = [];
    this.hexVertices = [];
    this.hexR = 1;
    this.vignettePattern = null;
    this.canvasSnapshot = null;

    this.backgroundFill = 'blue';

    this.treatments = {};

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

    this.resizedImageOffset = null;
    this.resizedImageScale = 0;
    this.readyCallback = readyCallback;

    this.init();
  }

  startAnimations() {
    if (single) {
      this.zoom(0, true);
      this.startAuraAnimations();
    } else {
      super.startAnimations(() => {
        this.startAuraAnimations();
      });
    }
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

  init() {
    if (this.imageElement) {
      return;
    }

    this.imageElement = document.createElement('div');
    this.imageElement.classList.add('image');

    this.canvas = this.createHiDPICanvas(this.canvasWidth, this.canvasHeight, 4);
    this.canvas.classList.add('image-canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.imageElement.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
    animationUtils.setSmoothing(this.context);

    this.logo = new Image();
    this.logo.src = assets.logoSrc;
  }

  reinitFaces(json) {
    super.reinitFaces(json, () => {
      this.retraceCanvas();
      this.backgroundFill = 'blue';
      this.totalEmotions = 0;
      this.imageScale = 1;
      this.hexVertices = [];
      this.facesAndEmotions = faceUtils.generateFacesAndEmotions(this.faces);
      this.facesAndStrongestEmotions = faceUtils.generateFacesAndEmotions(this.faces, true);
      this.treatments = animationUtils.generateTreatments(this.facesAndStrongestEmotions);
      this.eyeMidpoints = faceUtils.generateEyeMidpoints(this.faces);
      this.faceBounds = faceUtils.generateFaceBounds(this.faces);
      this.allEyesCenter = faceUtils.generateAllEyesCenter(this.faces);
      let totalEmotions = 0;
      this.facesAndEmotions.forEach((face) => {
        totalEmotions += Object.keys(face).length;
      });
      this.noEmotions = totalEmotions === 0;
      this.totalEmotions = totalEmotions;
      this.scrimAlpha = 0;
      this.fills = [];
      this.vignettePattern = null;
      this.resizedImageOffset = null;
      this.resizedImageScale = 0;
      this.auraAnimations = null;
      this.offsetX = 0;
      this.offsetY = 0;
    });
  }

  loadImage(json, imgPath) {
    this.reinitFaces(json);

    const image = new Image();
    image.src = imgPath || this.imgPath;

    image.onload = () => {
      this.image = image;

      this.killAnimations();
      this.setImageScale();
      this.generateHexInfo();
      this.cleanUpImage();
    };
  }

  drawScrim(callback = null) {
    if (this.scrimAlpha === 0) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.image, this.offsetX, this.offsetY, this.width, this.height, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.context.globalAlpha = this.scrimAlpha * colorUtils.SCRIM_MAX_ALPHA;
      this.context.fillStyle = 'rgb(0, 0, 0)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.globalAlpha = 1;
    }
    if (callback) {
      callback();
    }
  }

  toGridCoords(value = this.canvas.width, axis = null) {
    let offset = 0;
    if (axis === 'x') {
      if (this.offsetX === 0 && this.resizedImageOffset) {
        offset = this.resizedImageOffset.x;
      } else {
        offset = this.offsetX;
      }
    } else if (axis === 'y') {
      if (this.offsetY === 0 && this.resizedImageOffset) {
        offset = this.resizedImageOffset.y;
      } else {
        offset = this.offsetY;
      }
    }

    return ((value - offset) / this.imageScale);
  }

  applyFill(fill) {
    this.isDrawing = false;
    this.context.fillStyle = fill.style;
    this.context.globalCompositeOperation = fill.comp || 'source-over';
    this.context.globalAlpha = fill.alpha || 1;

    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    this.isDrawing = false;
  }

  getMultiAuraFill() {
    const tempCanvas = this.createHiDPICanvas(this.canvasWidth, this.canvasHeight);
    tempCanvas.width = this.canvasWidth;
    tempCanvas.height = this.canvasHeight;
    const tempContext = tempCanvas.getContext('2d');
    animationUtils.setSmoothing(tempContext);

    const gradientColors = this.treatments.groupAuraColors;

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
      const gradient = this.createSimpleGradient(gradientColors[0], colorUtils.subAlpha(gradientColors[0], 0.2));

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

    tempContext.translate(this.eyesMidpoint.x, this.eyesMidpoint.y);
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

  drawBackgroundWithAlpha(alpha = 1) {
    this.context.save();

    this.context.fillStyle = this.treatments.treatment.noEmotionScrim ? colorUtils.subAlpha(colorUtils.NEUTRAL, 0.25) : this.treatments.treatment.background;
    this.context.globalCompositeOperation = 'multiply';
    this.context.globalAlpha = alpha;

    this.context.fill();
    this.context.restore();
  }

  retraceCanvas() {
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(this.canvas.width, 0);
    this.context.lineTo(this.canvas.width, this.canvas.height);
    this.context.lineTo(0, this.canvas.height);
    this.context.lineTo(0, 0);
    this.context.closePath();
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
    if (this.treatments.treatment.noEmotionScrim) {
      this.redrawBaseImage();

      this.cutOutHex();
      this.drawBackgroundWithAlpha(0.35);
    } else {
      const opacity = ease.expOut(0, 0.5, progress);

      this.redrawBaseImage();
      this.cutOutHex();

      this.drawBackgroundWithAlpha(0.25);
      this.drawVignetteWithAlpha(opacity);

      this.context.restore();
    }
  }

  animateInVignette(duration = 1) {
    if (!this.treatments.treatment.noEmotionScrim) {

      this.context.save();

      const vignetteGradient = this.createSimpleGradient(this.treatments.treatment.vignette.innerColor, this.treatments.treatment.vignette.outerColor, 0, false);

      this.applyFill({
        style: colorUtils.TRANSPARENT
      });
      this.applyFill({
        style: vignetteGradient
      });

      const vignetteLayer = this.canvas;
      this.vignettePattern = this.context.createPattern(vignetteLayer, 'no-repeat');

      this.context.restore();
    }

    if (duration === 0) {
      this.ifNotDrawing(() => {
        this.animateInVignetteFrame(1);
      });
    } else {
      let active = null;
      let progress = 0;

      const vignetteTimeline = new Timeline({
        onStart: () => {
          this.timelines.push(vignetteTimeline);
        },
        onComplete: () => {
          super.killTimeline(vignetteTimeline);
          this.context.restore();
        }
      });

      vignetteTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = vignetteTimeline.getActive()[0];
          this.tweens.push(active);
        },
        onUpdate: () => {
          progress = active.progress();
          this.animateInVignetteFrame(progress);
        },
        onComplete: () => {
          super.killTween(active);
        }
      });
    }
  }

  animateInHaloFrame(progress = 1) {
    if (this.treatments.treatment.noEmotionScrim) {
      this.redrawBaseImage();
      this.cutOutHex();
      this.drawBackgroundWithAlpha(0.35);
    } else {
      if (this.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.treatments.treatment.halo.innerColor ===  colorUtils.TRANSPARENT) {
        return;
      }
      if (this.totalEmotions === 1) {
        this.redrawBaseImage();
        this.cutOutHex();
        this.context.save();
        this.drawBackgroundWithAlpha(0.25);
        this.drawVignetteWithAlpha(0.5);

        const alpha = ease.expOut(0, 0.75, progress);
        const r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);

        const gradient = this.context.createRadialGradient(this.eyesMidpoint.x, this.eyesMidpoint.y, this.hexR, this.eyesMidpoint.x, this.eyesMidpoint.y, r);

        gradient.addColorStop(0, this.treatments.treatment.halo.innerColor);
        if (this.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
          gradient.addColorStop(0.5, this.treatments.treatment.halo.outerColor);
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

        this.redrawBaseImage();
        this.cutOutHex();
        this.context.save();

        this.drawBackgroundWithAlpha(0.25);
        this.drawVignetteWithAlpha(0.5);

        this.context.fillStyle = this.createSimpleGradient(this.treatments.treatment.halo.outerColor, colorUtils.TRANSPARENT, r, false);
        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        const alpha2 = ease.expOut(0, 0.5, progress);
        const r2 = ease.expOut(0, (this.hexR * (Object.keys(this.facesAndEmotions[0]).length === 1 ? this.treatments.treatment.halo.radius : 3) / this.canvas.height), progress);
        this.context.fillStyle = this.createSimpleGradient(colorUtils.subAlpha(this.treatments.treatment.halo.innerColor, Object.keys(this.facesAndEmotions[0]).length === 1 ? this.treatments.treatment.halo.alpha : 1), colorUtils.TRANSPARENT, r2, false, 0.3, 1);
        this.context.globalAlpha = alpha2;
        this.context.fill();

        this.context.restore();
      }
    }
  }

  animateInHalo(duration = 1) {
    if (duration === 0) {
      if (!this.treatments.treatment.noEmotionScrim) {
        this.ifNotDrawing(() => {
          this.animateInHaloFrame();
        });
      }
    } else {
      let active = null;
      let progress = 0;

      const haloTimeline = new Timeline({
        onStart: () => {
          this.timelines.push(haloTimeline);
        },
        onComplete: () => {
          super.killTimeline(haloTimeline);
          this.context.restore();
        }
      });

      haloTimeline.to(this.canvas, duration, {
        onStart: () => {
          this.context.save();
          active = haloTimeline.getActive()[0];
          this.tweens.push(active);
          this.context.restore();
        },
        onUpdate: () => {
          if (!this.treatments.treatment.noEmotionScrim) {
            progress = active.progress();
            this.animateInHaloFrame(progress, this.treatments.treatment.halo.radius);
          }
        },
        onComplete: () => {
          super.killTween(active);
        }
      });
    }
  }

  animateInBackgroundFrame(progress = 1, hexRadius = 1) {
    this.redrawBaseImage();

    this.cutOutHex(false);

    this.context.save();
    this.context.moveTo(0, 0);
    this.context.translate(this.eyesMidpoint.x, this.eyesMidpoint.y);

    const points = geometryUtils.createRoundedHexagon(Math.max(this.hexR, hexRadius));

    this.context.moveTo(Math.max(this.hexR, hexRadius), 0);

    points.reverse();

    points.forEach((vertex, i, vertices) => {
      if (i % 2 === 0) {
        this.context.lineTo(vertex.x, vertex.y);
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

        this.context.arc(xMid, yMid, r, (startAngle / 360) * (Math.PI * 2), (endAngle / 360) * (Math.PI * 2), false);
      }

    });

    this.context.closePath();
    this.context.restore();

    this.drawBackgroundWithAlpha(ease.square(0, 0.25, progress));
  }

  animateInBackground(duration = 1) {
    const rEnd = this.canvas.width;

    if (duration === 0) {
      this.ifNotDrawing(() => {
        this.animateInBackgroundFrame(1, rEnd);
      });
    } else {
      let active = null;
      const backgroundTimeline = new Timeline({
        onStart: () => {
          this.timelines.push(backgroundTimeline);
        },
        onComplete: () => {
          super.killTimeline(backgroundTimeline);
          this.context.restore();
        }
      });

      const rStart = this.hexR;
      let progress = 0;
      let currR = rStart;

      backgroundTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = backgroundTimeline.getActive()[0];
          this.tweens.push(active);
        },
        onUpdate: () => {
          progress = active.progress();
          currR = ease.exp(rStart, rEnd, progress);
          this.animateInBackgroundFrame(progress, currR);
        },
        onComplete: () => {
          super.killTween(active);
        }
      });
    }
  }

  startAuraAnimations() {
    this.auraAnimations = new Timeline({
      onComplete: () => {
        super.killTimeline(this.auraAnimations);
      }
    });

    const auraAnimStates = this.faces.length === 1 ? states.STATES_AURA_SINGLE : states.STATES_AURA_MULTIPLE;

    auraAnimStates.forEach((state) => {
      this.auraAnimations.to(this, Math.max(state.DURATION, animationUtils.MIN_DURATION), {
        onStart: () => {
          if (this[state.NAME]) {
            this[state.NAME](state.DURATION);
          } else {
            this.pause(state.DURATION);
          }
        }
      });
    });

    this.timelines.push(this.auraAnimations);
  }

  fillInFeatheredCircle(pattern, radius, feather, reverse = false, centered = false) {
    const tempCanvas = this.createHiDPICanvas();
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    animationUtils.setSmoothing(tempContext);

    const x = centered ? this.canvas.width / 2 : this.eyesMidpoint.x;
    const y = centered ? this.canvas.height / 2 : this.eyesMidpoint.y;

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

    this.isDrawing = true;

    const feather = ease.linear(0, startR, progress);

    this.redrawBaseImage();

    this.context.fillStyle = this.fillInFeatheredCircle(fill, startR, feather);
    this.context.globalAlpha = ease.expOut(0.4, 1, progress);
    this.context.globalCompositeOperation = comp;

    this.cutOutHex();

    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(
      fill,
      ease.expOut(this.hexR * 0.75, this.hexR * 1.25, progress),
      ease.exp(this.hexR * 0.25, this.hexR * 0.75, progress)
    );

    this.context.globalAlpha = ease.exp(0.3, 0.7, progress);

    this.context.globalCompositeOperation = 'screen';
    this.context.fill();

    this.context.globalCompositeOperation = 'color-burn';
    this.context.fill();

    this.context.fillStyle = this.fillInFeatheredCircle(
      fill,
      ease.expOut(this.canvas.height * 2, this.canvas.height, progress),
      ease.exp(this.canvas.height, this.canvas.height - (this.hexR / 2), progress),
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

    this.isDrawing = false;
  }

  animateInMultiAura(duration = 1) {
    let fill = null;
    const comp = this.treatments.groupAuraColors.length > 0 ? 'screen' : 'lighten';
    const startR = this.toGridCoords(this.faceBounds.right - this.faceBounds.left) / 2;

    if (duration === 0) {
      this.ifNotDrawing(() => {
        this.animateInMultiAuraFrame(1, this.canvas.width, this.getMultiAuraFill(), comp);
      });
    } else {
      let active = null;

      const auraTimeline = new Timeline({
        onStart: () => {
          this.timelines.push(auraTimeline);
        },
        onComplete: () => {
          this.killTimeline(auraTimeline);
        }
      });
      auraTimeline.to(this.canvas, duration, {
        onStart: () => {
          active = auraTimeline.getActive()[0];
          fill = this.getMultiAuraFill();
          this.fills = [fill];
          this.isDrawing = false;
          this.tweens.push(active);
        },
        onUpdate: () => {
          const progress = active.progress();
          const r = ease.exp(startR, this.canvas.width, progress);

          this.animateInMultiAuraFrame(progress, r, this.fills[0], comp);
        },
        onComplete: () => {
          super.killTween(active);
        }
      });
    }
  }

  personalColor(duration = 1) {
    const fillColors = this.treatments.personalAuraColors[this.currFace];
    this.fills = [];

    // maybe have scrim pulse instead of just drawing?
    if (fillColors.length === 1) {
      this.applyFill({
        style: fillColors[0],
        comp: 'multiply',
        alpha: 0.35
      });
      this.redrawCurrentCanvas();
    } else {
      const colorTimeline = new Timeline({
        onStart: () => {
          this.timelines.push(colorTimeline);
        },
        onComplete: () => {
          super.killTimeline(colorTimeline);
        }
      });

      let active = null;
      let gradient = null;

      colorTimeline.to(this.canvas, duration * 0.75, {
        onStart: () => {
          active = colorTimeline.getActive()[0];
          this.tweens.push(active);
        },
        onUpdate: () => {
          this.redrawCurrentCanvas();

          const progress = active.progress();
          const opacity = ease.expOut(0.5, 1, progress);
          const radius = ease.expOut(0, 1, progress);

          gradient = this.createSimpleGradient(fillColors[0], fillColors[1], radius);

          this.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: opacity
          });
        },
        onComplete: () => {
          super.killTween(active);
        }
      });
      colorTimeline.to(this.canvas, duration * 0.25, {
        onStart: () => {
          active = colorTimeline.getActive()[0];
          this.redrawCurrentCanvas();

          this.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: 1
          });

          this.tweens.push(active);
        },
        onUpdate: () => {
          const progress = active.progress();
          const opacity = ease.square(1, 0, progress);

          this.redrawCurrentCanvas();

          this.applyFill({
            style: gradient,
            comp: 'screen',
            alpha: opacity
          });
        },
        onComplete: () => {
          this.redrawCurrentCanvas();
          this.isDrawing = false;
          super.killTween(active);
        }
      });
    }
  }

  createSimpleGradient(centerColor = colorUtils.WHITE, edgeColor = colorUtils.BLACK, radiusFactor = 1, centered = false, colorstop1 = 0, colorstop2 = 1) {
    const x = centered ? this.canvas.width / 2 : this.eyesMidpoint.x;
    const y = centered ? this.canvas.height / 2 : this.eyesMidpoint.y;

    const gradient = this.context.createRadialGradient(x, y, 0, x, y, this.canvas.height * (radiusFactor || 1));

    gradient.addColorStop(colorstop1, centerColor);
    gradient.addColorStop(colorstop2, edgeColor);

    return gradient;
  }

  emotion(duration) {
    this.scrimAlpha = 0;

    this.ifNotDrawing(() => {
      this.drawScrim();
      if (this.faces.length > 1) {
        this.personalColor(duration);
      }
    });
  }

  fillBackground() {
    this.context.fillStyle = this.backgroundFill;
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = 'source-over';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redrawCurrentCanvas() {
    this.retraceCanvas();
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = 'source-over';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.canvasSnapshot;
    this.context.fill();
  }

  redrawBaseImage() {
    this.retraceCanvas();
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = 'source-over';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.fillBackground();

    if (single && (this.offsetY < 0 || this.offsetX < 0)) {
      this.offsetX = ((this.subRect.width - this.image.width) / 2) / this.resizedImageScale;
      this.offsetY = (this.subRect.height - this.image.height) / this.resizedImageScale;

      this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.offsetX, this.offsetY, this.canvas.width - (2 * this.offsetX), this.canvas.height - this.offsetY);

      this.resizedImageOffset = {
        x: this.offsetX * -1 * this.resizedImageScale,
        y: this.offsetY * -1 * this.resizedImageScale
      };

      if (this.backgroundFill === 'blue' || this.backgroundFill === 'rgba(0, 0, 255, 1)') {
        const dataSample = animationUtils.getSquareColorSample(this.canvas, 10, new geometryUtils.Point(this.canvas.width / 2, this.offsetY));
        this.backgroundFill = dataSample;
        this.redrawBaseImage();
      }
    } else {
      this.context.drawImage(this.image, this.offsetX, this.offsetY, this.subRect.width, this.subRect.height, 0, 0, this.canvas.width, this.canvas.height);
      if (this.backgroundFill === 'blue' || this.backgroundFill === 'rgba(0, 0, 255, 1)') {
        let sampleOffset = 1;
        if (this.resizedImageScale) {
          sampleOffset = this.imageScale / this.resizedImageScale;
        }

        const dataSample = animationUtils.getSquareColorSample(this.canvas, 10, new geometryUtils.Point(Math.min(this.canvas.width / 2, Math.abs(this.offsetX)), (Math.min(this.offsetY, 0) * -1 * sampleOffset)));

        this.backgroundFill = dataSample;
        this.redrawBaseImage();
      }
    }
  }

  createHexR() {
    let r = 1;
    const baseDistance = geometryUtils.distanceFromCoords(new geometryUtils.Point(this.faceBounds.left, this.faceBounds.bottom), new geometryUtils.Point(this.faceBounds.right, this.faceBounds.top));

    if (this.resizedImageScale) {
      r = baseDistance / this.resizedImageScale / Math.sqrt(3);
    } else {
      r = this.toGridCoords(baseDistance) / Math.sqrt(3);
    }

    if (this.facesAndEmotions.length === 1) {
      r *= 1.5;
    }

    return r;
  }

  createHexVertices(radius = 1) {
    return (geometryUtils.createRoundedHexagon(radius, radius / 6));
  }

  cutOutHex(closePath = true) {
    this.context.save();

    this.context.beginPath();
    if (closePath) {
      this.context.moveTo(0, 0);
      this.context.lineTo(this.canvas.width, 0);
      this.context.lineTo(this.canvas.width, this.canvas.height);
      this.context.lineTo(0, this.canvas.height);
      this.context.lineTo(0, 0);
    }

    this.context.translate(this.eyesMidpoint.x, this.eyesMidpoint.y);
    this.context.rotate(0);

    this.hexVertices.forEach((vertex, i, vertices) => {
      if (i === 0) {
        this.context.moveTo(vertex.x, vertex.y);
        return;
      }
      if (i % 2 === 0) {
        this.context.lineTo(vertex.x, vertex.y);
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


        this.context.arc(xMid, yMid, r, (startAngle / 360) * (Math.PI * 2), (endAngle / 360) * (Math.PI * 2), true);
      }
    });

    if (closePath) {
      this.context.closePath();
    }
    this.context.restore();
  }

  flash(duration = 0) {
    const thisTimeline = new Timeline({
      onComplete: () => {
        super.killTimeline(thisTimeline);
      }
    });
    const origBrightness = 100;
    let currBrightness = origBrightness;
    const targetBrightness = 200;

    const flashUpTime = duration * 0.2;
    const flashDownTime = duration - flashUpTime;

    let currActive = null;
    thisTimeline.to(this.canvas, flashUpTime, {
      onStart: () => {
        currActive = thisTimeline.getActive()[0];
        this.tweens.push(currActive);
      },
      onUpdate: () => {
        if (currActive) {
          currBrightness = origBrightness + ((targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2));
          Tween.set(this.canvas, {
            css: {
              '-webkit-filter': `brightness(${ currBrightness }%)`
            }
          });
        }
      },
      onComplete: () => {
        super.killTween(currActive);
      }
    });
    thisTimeline.to(this.canvas, flashDownTime, {
      onStart: () => {
        currActive = thisTimeline.getActive()[0];
        this.tweens.push(currActive);
      },
      onUpdate: () => {
        if (currActive) {
          currBrightness = targetBrightness - ((targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2));
          Tween.set(this.canvas, {
            css: {
              '-webkit-filter': `brightness(${ currBrightness }%)`
            }
          });
        }
      },
      onComplete: () => {
        super.killTween(currActive);
      }
    });
    thisTimeline.to(this.canvas, 0, {
      clearProps: '-webkit-filter'
    });

    this.timelines.push(thisTimeline);
  }

  zoom(duration = 1, zoomOut = false) {
    const topLeft = new geometryUtils.Point(utils.thisOrZero(this.json[this.currFace].boundingPoly.vertices[0].x), utils.thisOrZero(this.json[this.currFace].boundingPoly.vertices[0].y));

    let width = Math.abs(topLeft.x - utils.thisOrZero(this.json[this.currFace].boundingPoly.vertices[1].x));
    width += geometryUtils.createPadding(width);

    let height = Math.abs(topLeft.y - utils.thisOrZero(this.json[this.currFace].boundingPoly.vertices[2].y));
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
      width = this.subRect.width;
      height = this.subRect.height;

      targetLeft = this.resizedImageOffset ? this.resizedImageOffset.x : 0;
      targetTop = this.resizedImageOffset ? this.resizedImageOffset.y : 0;
    }



    if (duration === 0) {
      this.ifNotDrawing(() => {
        this.isDrawing = false;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.fillBackground();

        this.context.drawImage(this.image, targetLeft, targetTop, this.width, this.height, 0, 0, this.canvas.width, this.canvas.height);
        this.offsetX = targetLeft;
        this.offsetY = targetTop;
        this.width = width;
        this.height = height;
        this.imageScale = width / this.canvas.width;
        if (zoomOut) {
          this.eyesMidpoint = this.pointToGridCoords(this.allEyesCenter);
        } else {
          this.eyesMidpoint = this.pointToGridCoords(this.eyeMidpoints[this.currFace]);
        }

        this.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');

        this.isDrawing = false;

      });
    } else {
      const tween = Tween.to(this.canvas, duration, {
        onStart: () => {
          this.isDrawing = false;
          this.tweens.push(tween);
        },
        onUpdate: () => {
          const prog = tween.progress();
          const currX = this.offsetX - ((this.offsetX - targetLeft) * prog);
          const currY = this.offsetY - ((this.offsetY - targetTop) * prog);

          const currWidth = this.width - ((this.width - width) * prog);
          const currHeight = this.height - ((this.height - height) * prog);

          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.fillBackground();

          this.context.drawImage(this.image, currX, currY, currWidth, currHeight, 0, 0, this.canvas.width, this.canvas.height);
        },
        onComplete: () => {
          this.offsetX = targetLeft;
          this.offsetY = targetTop;
          this.width = width;
          this.height = height;
          this.imageScale = width / this.canvas.width;
          if (zoomOut) {
            this.eyesMidpoint = this.pointToGridCoords(this.allEyesCenter);
          } else {
            this.eyesMidpoint = this.pointToGridCoords(this.eyeMidpoints[this.currFace]);
          }
          super.killTween(tween);

          this.isDrawing = false;
          this.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
        }
      });
      this.tweens.push(tween);
    }
  }

  zoomOut(duration = 1) {
    this.zoom(duration, true);
  }

  drawPoint(point, alpha = 1, isLast = false) {
    this.isDrawing = false;

    const x = this.toGridCoords(point.position.x, 'x');
    const y = this.toGridCoords(point.position.y, 'y');

    this.context.beginPath();
    this.context.fillStyle = `rgba(255, 255, 255, ${ alpha })`;
    this.context.arc(x, y, 3, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();

    if (isLast) {
      this.isDrawing = false;
    }
  }

  pointToGridCoords(point = null) {
    if (!point) {
      return new geometryUtils.Point(0, 0);
    }

    return new geometryUtils.Point(this.toGridCoords(point.x, 'x'), this.toGridCoords(point.y, 'y'));
  }

  ifNotDrawing(callback) {
    requestAnimationFrame(() => {
      if (this.isDrawing) {
        this.ifNotDrawing(callback);
      } else {
        callback();
      }
    });
  }

  drawPoints(points = [], alpha = 1) {
    if (points.length === 0) {
      return;
    }

    this.ifNotDrawing(() => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.image, this.offsetX, this.offsetY, this.width, this.height, 0, 0, this.canvas.width, this.canvas.height);
      this.drawScrim(() => {
        points.forEach((point, index) => {
          this.drawPoint(point, alpha, index === points.length - 1);
        });
      });
    });
  }

  drawRect(topLeft, width, height, alpha = 1) {
    this.ifNotDrawing(() => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.image, this.offsetX, this.offsetY, this.width, this.height, 0, 0, this.canvas.width, this.canvas.height);
      this.drawScrim(() => {
        const x = this.toGridCoords(topLeft.x, 'x');
        const y = this.toGridCoords(topLeft.y, 'y');
        const w = this.toGridCoords(width);
        const h = this.toGridCoords(height);

        this.context.strokeStyle = `rgba(255, 255, 255, ${ alpha })`;
        this.context.lineWidth = 5;
        this.context.strokeRect(x, y, w, h);
      });
    });
  }

  face(duration = 3) {
    const boundingPoly = this.json[this.currFace].fdBoundingPoly;
    const topLeft = boundingPoly.vertices[0];
    const width = Math.abs(topLeft.x - boundingPoly.vertices[1].x);
    const height = Math.abs(topLeft.y - boundingPoly.vertices[2].y);

    const timeline = new Timeline({
      onComplete: () => {
        super.killTimeline(timeline);
      }
    });
    let active = null;
    let prog = 0;

    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        this.scrimAlpha = 1;
        this.context.globalAlpha = 1;
        this.context.globalCompositeOperation = 'source-over';
        active = timeline.getActive()[0];
        this.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.isDrawing = false;
        this.drawRect(topLeft, width, height, prog);
      },
      onComplete: () => {
        super.killTween(active);
      }
    });
    timeline.to(this.canvas, duration - (animationUtils.POINTS_FADE_DURATION * 2), {
      onStart: () => {
        this.drawRect(topLeft, width, height, 1);
      }
    });
    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.drawRect(topLeft, width, height, 1 - prog);
      },
      onComplete: () => {
        super.killTween(active);
      }
    });

    this.timelines.push(timeline);
  }

  drawPointsWithAnim(points, duration) {
    const timeline = new Timeline({
      onComplete: () => {
        super.killTimeline(timeline);
      }
    });

    let active = null;
    let prog = 0;
    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.drawPoints(points, prog);
      },
      onComplete: () => {
        super.killTween(active);
      }
    });
    timeline.to(this.canvas, duration - (animationUtils.POINTS_FADE_DURATION * 2), {
      onStart: () => {
        active = timeline.getActive()[0];
        this.tweens.push(active);
      },
      onUpdate: () => {
        this.drawPoints(points);
      },
      onComplete: () => {
        super.killTween(active);
      }
    });
    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.drawPoints(points, 1 - prog);
      },
      onComplete: () => {
        super.killTween(active);
      }
    });

    this.timelines.push(timeline);
  }

  drawChromeFrame(progress = 1, height = 112, callback = null) {
    this.context.globalCompositeOperation = 'source-over';
    this.context.fillStyle = `rgba(255, 255, 255, ${ progress })`;
    this.context.fillRect(0, this.canvas.height - height, this.canvas.width, height);

    if (callback) {
      callback();
    }
  }

  drawChrome(duration = 2) {
    let height = 0;
    if (single) {
      height = animationUtils.CHROME_SHORT_HEIGHT;
    } else {
      height = this.totalEmotions <= (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) ? animationUtils.CHROME_SHORT_HEIGHT : animationUtils.CHROME_TALL_HEIGHT;
    }
    if (duration === 0) {
      this.ifNotDrawing(() => {
        if (this.totalEmotions > 0) {
          this.drawChromeFrame(1, height, () => {
            let tick = 0;
            this.facesAndEmotions.forEach((person) => {
              for (const emotion in person) {
                this.drawChromeHex(height, emotion, person[emotion], tick, 1);
                tick++;
              }
            });
            this.context.globalCompositeOperation = 'overlay';
            this.context.drawImage(this.logo, this.logoLeft, this.logoTop, single? this.logoWidth * 1.5 : this.logoWidth, single ? this.logoHeight * 1.5 : this.logoHeight);
            this.context.globalCompositeOperation = 'source-over';
          });
        } else {
          this.context.globalCompositeOperation = 'overlay';
          this.context.drawImage(this.logo, this.logoLeft, this.logoTop, single ? this.logoWidth * 1.5 : this.logoWidth, single ? this.logoHeight * 1.5 : this.logoHeight);
          this.context.globalCompositeOperation = 'source-over';
        }
      });
    } else {
      const timeline = new Timeline({
        onComplete: () => {
          super.killTimeline(timeline);
        }
      });
      let currActive = null;
      let tick = -1;
      this.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
      this.redrawCurrentCanvas();
      if (this.totalEmotions > 0) {
        timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.timeFactor, {
          onStart: () => {
            currActive = timeline.getActive()[0];
            this.tweens.push(currActive);
          },
          onUpdate: () => {
            const progress = currActive.progress();
            this.drawChromeFrame(progress, height);
          },
          onComplete: () => {
            super.killTween(currActive);
          }
        });

        this.facesAndEmotions.forEach((person) => {
          for (const emotion in person) {
            timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.timeFactor, {
              onStart: () => {
                currActive = timeline.getActive()[0];
                this.tweens.push(currActive);
                tick++;
                this.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
              },
              onUpdate: () => {
                this.redrawCurrentCanvas();
                this.drawChromeHex(height, emotion, person[emotion], tick, currActive.progress());
              },
              onComplete: () => {
                this.redrawCurrentCanvas();
                this.drawChromeHex(height, emotion, person[emotion], tick, 1);
                super.killTween(currActive);
                this.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
              }
            });
          }
        });
      }
      timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.timeFactor, {
        onStart: () => {
          currActive = timeline.getActive()[0];
        },
        onUpdate: () => {
          this.redrawCurrentCanvas();
          this.context.globalCompositeOperation = 'overlay';
          this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
          this.context.drawImage(this.logo, this.logoLeft, this.logoTop, this.logoWidth, this.logoHeight);
          this.context.globalCompositeOperation = 'source-over';
        }
      });

      this.timelines.push(timeline);
    }
  }

  drawChromeHex(height, emotion, strength, num, progress, radius = animationUtils.CHROME_HEX_RADIUS) {
    if (num >= animationUtils.CHROME_MAX_ITEMS) {
      return;
    }

    this.retraceCanvas();

    let x = 0;
    let y = 0;
    if (single) {
      x = animationUtils.CHROME_HORIZONTAL_PADDING + ((num % animationUtils.CHROME_MAX_ITEMS ) * animationUtils.BACKEND_CHROME_ITEM_WIDTH);
      y = this.canvas.height - height + (animationUtils.CHROME_VERTICAL_PADDING) + (((Math.floor(num / animationUtils.CHROME_MAX_ITEMS )) * animationUtils.CHROME_SINGLE_LINE_HEIGHT)) + ((Math.floor(num / animationUtils.CHROME_MAX_ITEMS )) * animationUtils.CHROME_SPACE_BETWEEN_LINES);
    } else {
      x = animationUtils.CHROME_HORIZONTAL_PADDING + ((num % (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS)) * animationUtils.CHROME_ITEM_WIDTH);
      y = this.canvas.height - height + (animationUtils.CHROME_VERTICAL_PADDING) + (((Math.floor(num / (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS))) * animationUtils.CHROME_SINGLE_LINE_HEIGHT)) + ((Math.floor(num / (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS))) * animationUtils.CHROME_SPACE_BETWEEN_LINES);
    }
    const hexPoints = geometryUtils.createRoundedHexagon(radius, radius / 5);
    this.context.beginPath();
    const hexStartX = x + radius;
    const hexStartY = y + radius;
    hexPoints.forEach((vertex, i, vertices) => {
      vertex.x += hexStartX;
      vertex.y += hexStartY;

      if (i === 0) {
        this.context.moveTo(vertex.x, vertex.y);
        return;
      }
      if (i % 2 === 0) {
        this.context.lineTo(vertex.x, vertex.y);
      } else {
        const prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
        let xMid = (vertex.x + prev.x) / 2;
        let yMid = (vertex.y + prev.y) / 2;

        const r = geometryUtils.distanceFromCoords(prev, vertex) / 2;

        const bigIndex = Math.floor(i / 2);
        if ([5].includes(bigIndex)) {
          xMid -= r * (Math.sqrt(2) / 3);
        } else if ([2, 3].includes(bigIndex)) {
          xMid += r * (Math.sqrt(2) / 3);
        } else if ([4].includes(bigIndex)) {
          xMid += r * (Math.sqrt(2) / 3);
        } else if ([1].includes(bigIndex)) {
          xMid -= r * (Math.sqrt(2) / 3);
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


        this.context.arc(xMid, yMid, r, (startAngle / 360) * (Math.PI * 2), (endAngle / 360) * (Math.PI * 2), true);
      }
    });
    this.context.closePath();
    this.context.globalAlpha = ease.exp(0, 1, progress);
    const grad = this.context.createLinearGradient(x, y, x + radius * 2, y + radius * 2);
    grad.addColorStop(0, colorUtils[emotion][0]);
    grad.addColorStop(1, colorUtils[emotion][2]);
    this.context.fillStyle = grad;
    this.context.fill();
    this.context.globalAlpha = 1;
    this.context.font = `12px "Roboto Mono"`;
    this.context.fillStyle = `rgba(0, 0, 0, ${ ease.exp(0, 0.38, progress) })`;
    this.context.fillText(`${ emotion.toLowerCase() }:${ strength }`, hexStartX + (radius * 1.5), hexStartY + (radius / 4));
  }

  chrome(duration = 2) {
    this.finalImage = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
    this.drawChrome(duration);
  }

  ears(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EARS), duration);
  }

  forehead(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FOREHEAD), duration);
  }

  nose(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.NOSE), duration);
  }

  mouth(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.MOUTH), duration);
  }

  chin(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.CHIN), duration);
  }

  eyes(duration = 0) {
    this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EYES), duration);
  }

  allFeatures(duration = 0) {
    if (!this.isDrawing) {
      this.drawPointsWithAnim(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FULL), duration);
    }
  }

  getSubRectDimension(image) {
    let width = this.canvas.width;
    let height = this.canvas.height;

    const widthsRatio = this.canvas.width / image.width;
    const heightsRatio = this.canvas.height / image.height;

    if (widthsRatio > heightsRatio) {
      width = image.width;
      height = this.canvas.height / widthsRatio;
      this.imageScale = 1 / widthsRatio;
    } else {
      height = image.height;
      width = this.canvas.width / heightsRatio;
      this.imageScale = 1 / heightsRatio;
    }

    return { width, height };
  }

  setImageScale(image = this.image) {
    const widthsRatio = this.canvas.width / image.width;
    const heightsRatio = this.canvas.height / image.height;

    if (widthsRatio > heightsRatio) {
      this.imageScale = 1 / widthsRatio;
    } else {
      this.imageScale = 1 / heightsRatio;
    }
  }

  cleanUpImage() {
    this.resizeContent(() => {
      this.generateHexInfo();
      if (this.readyCallback) {
        this.readyCallback();
      }
    });
  }

  resizeContent(callback = null) {
    const scaledMin = animationUtils.MIN_HEX_RADIUS * this.canvas.height;
    const scaledMax = animationUtils.MAX_HEX_RADIUS * this.canvas.height;
    let targetHexR = this.hexR;

    if (this.hexR < scaledMin) {
      // make sure that we don't scale the image too much
      if ((scaledMin - this.hexR) > (this.hexR * animationUtils.MAX_HEX_DIFF)) {
        targetHexR = this.hexR + (this.hexR * animationUtils.MAX_HEX_DIFF);
      } else {
        targetHexR = scaledMin;
      }
    } else if (this.hexR > scaledMax) {
      if ((this.hexR - scaledMax) > (this.hexR * animationUtils.MAX_HEX_DIFF)) {
        targetHexR = this.hexR - (this.hexR * animationUtils.MAX_HEX_DIFF);
      } else {
        targetHexR = scaledMax;
      }
    }

    // work backwards.
    let targetFaceDiff = targetHexR;
    const currentFaceDiff = this.faceBounds.right - this.faceBounds.left;
    // 1. get target difference between left and right face edges.
    if (this.faces.length === 1) {
      targetFaceDiff /= 2;
    }
    targetFaceDiff *= Math.sqrt(3);
    // 2. use this to calculate different, ideal image scale.
    const newImageScale = 1 / (targetFaceDiff / currentFaceDiff);

    this.subRect = {
      width: this.canvas.width * newImageScale,
      height: this.canvas.height * newImageScale
    };

    if (this.image.width < this.subRect.width) {
      this.subRect.width = this.image.width;
      this.subRect.height = (this.canvas.height / this.canvas.width) * this.subRect.width;
    }

    this.width = this.subRect.width;
    this.height = this.subRect.height;
    this.resizedImageScale = this.subRect.width / this.canvas.width;

    this.offsetX = (this.image.width - this.subRect.width) / 2;
    this.offsetY = (this.image.height - this.subRect.height) / 2;

    this.resizedImageOffset = {
      x: this.offsetX,
      y: this.offsetY
    };

    this.redrawBaseImage();

    if (callback) {
      callback();
    }
  }

  generateHexInfo() {
    this.hexR = this.createHexR();
    this.hexVertices = this.createHexVertices(this.hexR);
  }
}
