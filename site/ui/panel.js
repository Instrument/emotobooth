/* global document, single, XMLHttpRequest */

'use strict';

import nextImageElement from './image/imageElementNext';
import horizonImageElement from './image/imageElementHorizon';
import JsonElement from './jsonElement';

import {
  EVENT_NAME_NEXT,
  EVENT_NAME_HORIZON
} from './image/_imageConst';

export default class Panel {
  constructor(jsonData, eventName) {
    this.imagePath = jsonData.origPath;
    this.reqPath = jsonData.reqPath;
    this.respPath = jsonData.respPath;

    this.element = null;
    this.image = null;
    this.jsonElement = null;

    this.eventName = eventName;

    this.init();
  }

  init() {
    if (this.eventName === EVENT_NAME_NEXT) {
      this.image = new nextImageElement(this.imagePath, this.respPath, () => {
         this.imageIsReady();
      });
    } else if (this.eventName === EVENT_NAME_HORIZON) {
      this.image = new horizonImageElement(this.imagePath, this.respPath, () => {
         this.imageIsReady();
      });
    }

    this.jsonElement = new JsonElement(this.reqPath, this.respPath);
    this.sequenceTimeouts = [];
    this.loadPanel();
  }

  manifest(callback = null) {
    const third = document.createElement('section');
    third.classList.add('third');

    this.element = third;

    // create image for panel.
    this.injectBefore(this.image.imageElement);

    // create JSON for panel.
    if (!single) {
      this.injectContent(this.jsonElement.mainElt);
    }

    document.getElementById('latest').appendChild(this.element);

    if (callback) {
      callback();
    }
  }

  newImage(newOrigImgPath = this.imagePath, newReqPath = this.reqPath, newRespPath = this.respPath) {
    this.imagePath = newOrigImgPath;
    this.reqPath = newReqPath;
    this.respPath = newRespPath;

    this.image.imagePath = this.imagePath;
    this.image.jsonPath = this.respPath;

    this.jsonElement.reqPath = this.reqPath;
    this.jsonElement.respPath = this.respPath;
  }

  imageIsReady() {
    if (!this.element) {
      this.manifest(() => {
        // manifest panel & start animations
        this.image.startAnimations();
        this.jsonElement.startAnimations();
      });
    } else {
      // we've already manifested
      this.image.startAnimations();
      this.jsonElement.startAnimations();
    }
  }

  loadRespPath() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const respJson = JSON.parse(xhr.responseText);

        this.loadReqPath(respJson);
      }
    };
    xhr.open('GET', this.respPath, true);
    xhr.send();
  }

  loadReqPath(respJson) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const reqJson = JSON.parse(xhr.responseText);
        this.image.loadImage(respJson, this.imagePath);
        if (this.jsonElement) {
          this.jsonElement.loadJSON(reqJson, respJson);
        }
      }
    };
    xhr.open('GET', this.reqPath, true);
    xhr.send();
  }

  loadPanel(jsonData) {
    if (jsonData) {
      this.origPath = jsonData.origPath;
      this.reqPath = jsonData.reqPath;
      this.respPath = jsonData.respPath;
      this.imagePath = jsonData.origPath;
    }
    this.loadRespPath();
  }

  injectContent(content) {
    this.element.appendChild(content);
  }

  injectBefore(content) {
    this.element.insertBefore(content, this.element.children[0]);
  }

  tearDown() {
    document.body.removeChild(this.element);
  }
}
