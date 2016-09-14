/* global require, single, Image */

'use strict';

import * as ease from './../../../_easings';
import * as assets from './../../../_assets';
import * as animationUtils from './../../../_animationUtils';
import * as geometryUtils from './../../../_geometryUtils';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class ChromeStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.logoTop = 40;
    this.logoLeft = 40;
    this.logoWidth = 348 * (110 / 348);
    this.logoHeight = 136 * (110 / 348);

    this.logo = new Image();
    this.logo.src = assets.logoSrc;

    this.chrome(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  chrome(duration = 2) {
    this.imageElement.finalImage = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
    this.drawChrome(duration);
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
      height = this.imageElement.totalEmotions <= (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) ? animationUtils.CHROME_SHORT_HEIGHT : animationUtils.CHROME_TALL_HEIGHT;
    }
    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        if (this.imageElement.totalEmotions > 0) {
          this.drawChromeFrame(1, height, () => {
            let tick = 0;
            this.imageElement.facesAndEmotions.forEach((person) => {
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
          this.imageElement.killTimeline(timeline);
        }
      });
      let currActive = null;
      let tick = -1;
      this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
      this.canvasUtils.redrawCurrentCanvas();
      if (this.imageElement.totalEmotions > 0) {
        timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.imageElement.timeFactor, {
          onStart: () => {
            currActive = timeline.getActive()[0];
            this.imageElement.tweens.push(currActive);
          },
          onUpdate: () => {
            const progress = currActive.progress();
            this.drawChromeFrame(progress, height);
          },
          onComplete: () => {
            this.imageElement.killTween(currActive);
          }
        });

        this.imageElement.facesAndEmotions.forEach((person) => {
          for (const emotion in person) {
            timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.imageElement.timeFactor, {
              onStart: () => {
                currActive = timeline.getActive()[0];
                this.imageElement.tweens.push(currActive);
                tick++;
                this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
              },
              onUpdate: () => {
                this.canvasUtils.redrawCurrentCanvas();
                this.drawChromeHex(height, emotion, person[emotion], tick, currActive.progress());
              },
              onComplete: () => {
                this.canvasUtils.redrawCurrentCanvas();
                this.drawChromeHex(height, emotion, person[emotion], tick, 1);
                this.imageElement.killTween(currActive);
                this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
              }
            });
          }
        });
      }
      timeline.to(this, animationUtils.EMOTION_HEX_FADE_DURATION / this.imageElement.timeFactor, {
        onStart: () => {
          currActive = timeline.getActive()[0];
        },
        onUpdate: () => {
          this.canvasUtils.redrawCurrentCanvas();
          this.context.globalCompositeOperation = 'overlay';
          this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
          this.context.drawImage(this.logo, this.logoLeft, this.logoTop, this.logoWidth, this.logoHeight);
          this.context.globalCompositeOperation = 'source-over';
        }
      });

      this.imageElement.timelines.push(timeline);
    }
  }

  drawChromeHex(height, emotion, strength, num, progress, radius = animationUtils.CHROME_HEX_RADIUS) {
    if (num >= animationUtils.CHROME_MAX_ITEMS) {
      return;
    }

    this.canvasUtils.retraceCanvas();

    let x = 0;
    let y = 0;
    if (single) {
      x = animationUtils.CHROME_HORIZONTAL_PADDING + ((num % animationUtils.CHROME_MAX_ITEMS ) * animationUtils.BACKEND_CHROME_ITEM_WIDTH);
      y = this.canvas.height - height + (animationUtils.CHROME_VERTICAL_PADDING) + (((Math.floor(num / animationUtils.CHROME_MAX_ITEMS )) * animationUtils.CHROME_SINGLE_LINE_HEIGHT)) + ((Math.floor(num / animationUtils.CHROME_MAX_ITEMS )) * animationUtils.CHROME_SPACE_BETWEEN_LINES);
    } else {
      x = animationUtils.CHROME_HORIZONTAL_PADDING + ((num % (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS)) * animationUtils.CHROME_ITEM_WIDTH);
      y = this.canvas.height - height + (animationUtils.CHROME_VERTICAL_PADDING) + (((Math.floor(num / (animationUtils.CHROME_MAX_ITEMS) / animationUtils.CHROME_MAX_ROWS))) * animationUtils.CHROME_SINGLE_LINE_HEIGHT) + ((Math.floor(num / (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS))) * animationUtils.CHROME_SPACE_BETWEEN_LINES);
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

}
