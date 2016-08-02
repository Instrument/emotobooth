/* global require */

'use strict';

import canvasUtils from './../_canvasUtils';
import * as animationUtils from './../../_animationUtils';
import * as faceUtils from './../../_faceUtils';
import pointUtils from './../_pointUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class FaceStep {
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

  ears(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EARS), duration);
  }

  forehead(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FOREHEAD), duration);
  }

  nose(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.NOSE), duration);
  }

  mouth(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.MOUTH), duration);
  }

  chin(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.CHIN), duration);
  }

  eyes(duration = 0) {
    this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EYES), duration);
  }

  face(duration = 3) {
    const boundingPoly = this.imageElement.json[this.imageElement.currFace].fdBoundingPoly;
    const topLeft = boundingPoly.vertices[0];
    const width = Math.abs(topLeft.x - boundingPoly.vertices[1].x);
    const height = Math.abs(topLeft.y - boundingPoly.vertices[2].y);

    const timeline = new Timeline({
      onComplete: () => {
        this.imageElement.killTimeline(timeline);
      }
    });
    let active = null;
    let prog = 0;

    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        this.imageElementscrimAlpha = 1;
        this.context.globalAlpha = 1;
        this.context.globalCompositeOperation = 'source-over';
        active = timeline.getActive()[0];
        this.imageElement.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.imageElementisDrawing = false;
        this.canvasUtils.drawRect(topLeft, width, height, prog);
      },
      onComplete: () => {
        this.imageElement.killTween(active);
      }
    });
    timeline.to(this.canvas, duration - (animationUtils.POINTS_FADE_DURATION * 2), {
      onStart: () => {
        this.canvasUtils.drawRect(topLeft, width, height, 1);
      }
    });
    timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
      onStart: () => {
        active = timeline.getActive()[0];
        this.imageElement.tweens.push(active);
      },
      onUpdate: () => {
        prog = active.progress();
        this.canvasUtils.drawRect(topLeft, width, height, 1 - prog);
      },
      onComplete: () => {
        this.imageElement.killTween(active);
      }
    });

    this.imageElement.timelines.push(timeline);
  }

  allFeatures(duration = 0) {
    if (!this.imageElementisDrawing) {
      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FULL), duration);
    }
  }

}
