/* global document */

'use strict';

export default class Controls {
  constructor() {
    this.controlsWrap = null;

    this.init();
  }

  init() {
    this.controlsWrap = document.createElement('div');
    this.controlsWrap.classList.add('controls');

    document.body.appendChild(this.controlsWrap);
  }

  genNewImage(callback, numEmotions) {
    return () => {
      callback(numEmotions);
    };
  }

  genNewGroupImage(callback, imgId) {
    return () => {
      callback(imgId);
    };
  }

  addNewSingleImageButtons(callback) {
    const wrap = document.createElement('span');

    for (let i = 0; i <= 2; i++) {
      const newSingleImageButton = document.createElement('button');
      newSingleImageButton.innerHTML = `Take Photo (${ i } emotion${ i !== 1 ? 's' : '' })`;
      newSingleImageButton.classList.add('controls-button');
      newSingleImageButton.onclick = this.genNewImage(callback, i);

      wrap.appendChild(newSingleImageButton);
    }

    this.addNewControlsSection(wrap);
  }

  addNewGroupImageButtons(callback) {
    const wrap = document.createElement('span');

    for (let i = 0; i <= 3; i++) {
      const newButton = document.createElement('button');
      newButton.innerHTML = `Take Group Photo (${ i < 3 ? i : 'many' } emotion${ i !== 1 ? 's' : '' })`;
      newButton.classList.add('controls-button');
      newButton.onclick = this.genNewGroupImage(callback, i);
      wrap.appendChild(newButton);
    }

    this.addNewControlsSection(wrap);
  }

  addViewPicker(callback = null) {
    const viewsWrap = document.createElement('div');

    const latestWrap = document.createElement('div');
    latestWrap.classList.add('controls-radio-wrap');
    const latestRadio = document.createElement('input');
    latestRadio.type = 'radio';
    latestRadio.id = 'controls-views-latest';
    latestRadio.name = 'controls-views';
    latestRadio.classList.add('controls-views-choice');
    latestRadio.checked = true;

    if (callback) {
      latestRadio.onchange = () => {
        callback('latest');
      };
    }

    const latestLabel = document.createElement('label');
    latestLabel.classList.add('controls-views-label');
    latestLabel.htmlFor = 'controls-views-latest';
    latestLabel.innerHTML = 'Latest';

    latestWrap.appendChild(latestRadio);
    latestWrap.appendChild(latestLabel);
    viewsWrap.appendChild(latestWrap);

    const historicalWrap = document.createElement('div');
    historicalWrap.classList.add('controls-radio-wrap');
    const historicalRadio = document.createElement('input');
    historicalRadio.type = 'radio';
    historicalRadio.id = 'controls-views-historical';
    historicalRadio.name = 'controls-views';
    historicalRadio.classList.add('controls-views-choice');

    if (callback) {
      historicalRadio.onchange = () => {
        callback('historical');
      };
    }

    const historicalLabel = document.createElement('label');
    historicalLabel.classList.add('controls-views-label');
    historicalLabel.htmlFor = 'controls-views-historical';
    historicalLabel.innerHTML = 'Historical';

    historicalWrap.appendChild(historicalRadio);
    historicalWrap.appendChild(historicalLabel);
    viewsWrap.appendChild(historicalWrap);

    this.addNewControlsSection(viewsWrap);
  }

  addNewControlsSection(content) {
    const newControlsSection = document.createElement('div');
    newControlsSection.classList.add('controls-section');
    newControlsSection.appendChild(content);
    this.controlsWrap.appendChild(newControlsSection);
  }
}
