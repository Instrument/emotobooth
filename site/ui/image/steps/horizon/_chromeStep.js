/* global require, single, Image, requestAnimationFrame, setTimeout */

'use strict';

import * as ease from './../../../_easings';
import * as assets from './../../../_assets';
import * as animationUtils from './../../../_animationUtils';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';

import particles from './../../_particles';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class ChromeStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;

    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.logoTop = 35;
    this.logoLeft = 40;
    this.logoWidth = 60;
    this.logoHeight = 53;

    this.logo = new Image();
    this.logo.src = assets.googleLogoSrc;

    this.chrome(duration);
  }

  kill() {
    this.killAnimation = true;
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  chrome(duration = 2) {
    this.particles = new particles(this.imageElement, this.canvas, this.context);
    this.drawChrome(duration);
  }

  drawParticles() {
    if (this.killAnimation) {
      return;
    }
    requestAnimationFrame(this.drawParticles.bind(this));
    this.canvasUtils.redrawCurrentCanvas();
    if (this.imageElement.totalEmotions > 0) {
      this.drawChrome(0);
    }
    this.particles.drawParticles();
  }

  drawChromeFrame(progress = 1, height = 112, callback = null) {
    this.context.save();
    this.context.globalCompositeOperation = 'source-over';
    this.context.fillStyle = `rgba(255, 255, 255, ${ progress })`;
    this.context.fillRect(0, this.canvas.height - height, this.canvas.width, height);
    this.context.restore();

    if (callback) {
      callback();
    }
  }

  drawChrome(duration = 2) {
    if (this.killAnimation) {
      return;
    }
    let height = 0;
    if (single) {
      height = animationUtils.CHROME_SHORT_HEIGHT;
    } else {
      height = this.imageElement.totalEmotions <= (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) ? animationUtils.CHROME_SHORT_HEIGHT : animationUtils.CHROME_TALL_HEIGHT;
    }
    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        if (!this.imageElement || !this.imageElement.totalEmotions) {
          return;
        }
        if (this.imageElement.totalEmotions > 0) {
          this.drawChromeFrame(1, height, () => {
            let tick = 0;
            this.imageElement.facesAndEmotions.forEach((person) => {
              for (const emotion in person) {
                this.drawChromeHex(height, emotion, person[emotion], tick, 1);
                tick++;
              }
            });
          });
        }
        
        this.context.globalAlpha = 1;
        this.particles.drawParticles();

        this.context.globalCompositeOperation = 'source-over';
        this.context.drawImage(this.logo, this.logoLeft, this.logoTop, single ? this.logoWidth * 1.5 : this.logoWidth, single ? this.logoHeight * 1.5 : this.logoHeight);
      });
    } else {
      const timeline = new Timeline({
        onComplete: () => {
          this.imageElement.killTimeline(timeline);
        }
      });
      let currActive = null;
      if (this.imageElement.totalEmotions > 0) {
        timeline.to(this, duration, {
          onStart: () => {
            currActive = timeline.getActive()[0];
            this.imageElement.tweens.push(currActive);
          },
          onUpdate: () => {
            const progress = currActive.progress();
            this.canvasUtils.redrawCurrentCanvas();
            this.drawChromeFrame(progress, height);

            this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
            
            this.particles.drawParticles();

            this.context.drawImage(this.logo, this.logoLeft, this.logoTop, this.logoWidth, this.logoHeight);

            let tick = -1;

            this.imageElement.facesAndEmotions.forEach((person) => {
              for (const emotion in person) {
                tick++;
                 // animationUtils.EMOTION_HEX_FADE_DURATION / this.imageElement.timeFactor
                this.drawChromeHex(height, emotion, person[emotion], tick, currActive.progress());
              }
            });
          },
          onComplete: () => {
            this.imageElement.killTween(currActive);
            setTimeout(() => {
              this.drawParticles();
            }, 100);
          }
        });
      } else {
        timeline.to(this, duration, {
          onStart: () => {
            currActive = timeline.getActive()[0];
            this.imageElement.tweens.push(currActive);
          },
          onUpdate: () => {
            this.canvasUtils.redrawCurrentCanvas();
            this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
            this.particles.drawParticles();
          },
          onComplete: () => {
            this.imageElement.killTween(currActive);
            this.drawParticles();
          }
        });
      }

      this.imageElement.timelines.push(timeline);
    }
  }

  drawChromeHex(height, emotion, strength, num, progress, radius = animationUtils.CHROME_HEX_RADIUS) {
    if (num >= animationUtils.CHROME_MAX_ITEMS) {
      return;
    }

    this.context.save();

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

    this.context.beginPath();
    const hexStartX = x + radius;
    const hexStartY = y + radius;
    this.context.arc(hexStartX, hexStartY, radius, 0, Math.PI * 2);
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

    this.context.restore();
  }

}
