/* global single */

'use strict';

import * as colorUtils from './../_colorUtils';

const PARTICLE_COUNT = 10;
const BASE_RADIUS = 135;
const BASE_GROUP_RADIUS = 225;
const MAX_GROUP_RADIUS = 390;
const RADIUS_LINE_OFFSET = 90;

export default class Particles {
  constructor(imageElement, canvas, context) {
    this.imageElement = imageElement;
    this.particlesStarted = false;
    this.particles = [];
    this.particleCount = 0;
    this.particleFade = 1;
    this.killParticles = false;

    this.isGroup = this.imageElement.facesAndEmotions.length !== 1;

    this.canvas = canvas;
    this.context = context;

    this.shapeScale = 1;
    if (single) {
      this.shapeScale = 2;
    }

    this.createParticles();
  }

  kill() {
    this.killParticles = true;
    this.imageElement = null;
    this.particles = null;
    this.canvas = null;
    this.context = null;
  }

  calculateWithScale(num) {
    let radiusScale = this.imageElement.hexR / (225 * this.shapeScale);
    if (radiusScale > 390 * this.shapeScale) {
      radiusScale = 390 * this.shapeScale;
    }
    let total = num * this.shapeScale;
    if (this.isGroup && this.imageElement.hexR > 225) {
      total = (num * radiusScale) * this.shapeScale;
    }
    return total;
  }

  createParticles() {
    let i = 0;
    let xPoint = 0;
    let yPoint = 0;

    for (i = 0; i < PARTICLE_COUNT; i++) {
      const randomAngle = -0.5 + Math.random();
      const particleLocation = (i/PARTICLE_COUNT) + (randomAngle * .1);
      const angle = ((Math.PI * 2) * particleLocation)
      const radius = this.getParaticleRadius() + RADIUS_LINE_OFFSET;

      xPoint = this.imageElement.eyesMidpoint.x + (Math.cos(angle) * radius) + (Math.random() * 2);
      yPoint = this.imageElement.eyesMidpoint.y + (Math.sin(angle) * radius) + (Math.random() * 2);

      this.particles.push({
        x: xPoint,
        y: yPoint,
        size: 2 * this.shapeScale,
        speed: ((Math.random() * 0.5) + 0.5) / 60,
        radius: (Math.random() * 10) + 2
      });
    }
  }

  getParaticleRadius() {
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

  drawParticles() {
    if (this.killParticles || single) {
      return;
    }

    let i = 0;

    this.context.save();

    let emoColor;
    let emoColorOffset = 0;

    if (this.imageElement.noEmotions) {
      emoColor = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
      emoColorOffset = 0.3;
    } else {
      emoColor = 'rgba(255, 255, 255, 1)';
      emoColorOffset = 1;
    }

    const color = colorUtils.subAlpha(emoColor, this.particleFade * emoColorOffset);

    this.context.fillStyle = color;

    for (; i < PARTICLE_COUNT; i++) {
      const p = this.particles[i];

      const x = p.x + Math.sin(this.particleCount * (p.speed)) * p.radius;
      const y = p.y + Math.cos(this.particleCount * (p.speed)) * p.radius;
      const s = p.size;
      this.context.beginPath();
      this.context.arc(x, y, s, 0, Math.PI * 2);
      this.context.fill();
      this.context.closePath();
    }

    this.context.restore();

    this.particleCount++;
  }

}
