'use strict';

import * as animationUtils from './_animationUtils';

export class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class BoundingRect {
  constructor(pointTopLeft = new Point(), pointTopRight = new Point(), pointBottomRight = new Point(), pointBottomLeft = new Point()) {
    this.pointTopLeft = pointTopLeft;
    this.pointTopRight = pointTopRight;
    this.pointBottomRight = pointBottomRight;
    this.pointBottomLeft = pointBottomLeft;
  }
}

export function createPadding(val) {
  const paddingFactor = 0;

  return val * paddingFactor * 2;
}

export function createHexagon(r = 1) {
  const vertices = [];

  const k = (Math.PI * 2) / -6;

  for (let i = 1; i < 6; i++) {
    const nextX = r * Math.cos(i * k);
    const nextY =  r * Math.sin(i * k);
    vertices.push(new Point(nextX, nextY));
  }

  return vertices;
}

export function createRoundedHexagon(r = 1, cornerRadius = animationUtils.HEXAGON_CORNER_RADIUS) {
  const vertices = [];

  const k = (Math.PI * 2) / -6;
  const degDiff = k * cornerRadius / r;
  for (let i = 0; i < 6; i++) {
    const firstX = r * Math.cos((i * k) - degDiff);
    const firstY = r * Math.sin((i * k) - degDiff);
    vertices.push(new Point(firstX, firstY));
    const secondX = r * Math.cos((i * k) + degDiff);
    const secondY = r * Math.sin((i * k) + degDiff);
    vertices.push(new Point(secondX, secondY));
  }

  return vertices;
}

export function midpointFromPoints(point1 = null, point2 = null) {
  if (!point1 || !point2) {
    return new Point(0, 0);
  }
  const newX = (point1.x + point2.x) / 2;
  const newY = (point1.y + point2.y) / 2;
  return new Point(newX, newY);
}

export function midpointFromCoords(x1 = 0, x2 = 0, y1 = 0, y2 = 0) {
  const newX = (x1 + x2) / 2;
  const newY = (y1 + y2) / 2;
  return new Point(newX, newY);
}

export function distanceFromCoords(point1 = null, point2 = null) {
  if (!point1 || !point2) {
    return 0;
  }

  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}
