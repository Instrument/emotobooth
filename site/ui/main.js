/* global window, document, setTimeout, clearTimeout, XMLHttpRequest, require, socket */

'use strict';

import Panel from './panel';
import Threeup from './threeup';

import Controls from './controls';

let zoom = false;
let controls = false;
let showGrid = false;
let prepopulate = false;
let dontPrint = false;

const panels = [];
let oldestPanel = null;

const threeups = [];
const threeupsHistory = [];
let oldestThreeup = null;
let timingsType = 'normal';
window.states = null;
let newImage = null;
let eventName = null;

let refreshTimer = null;
// faster timing for when images have not been processed for a while
const refreshInitTiming = 20000;
// time to wait for inactivity before switching to refreshInitTiming
const refreshPostTiming = 120000;
let refreshTiming = refreshInitTiming;

let latestSessionId = -1;

function calcZoomLevel() {
  const pageWidth = window.innerWidth;
  const docWidth = document.getElementById('main').clientWidth;

  const zoomLevel = pageWidth / docWidth;
  document.getElementById('main').style.transform = `scale(${ zoomLevel })`;
}

function createPanel(jsonData) {
  if (panels.length < 3) {
    oldestPanel = (panels.length + 1);

    const newPanel = new Panel(jsonData, eventName);
    panels.push(newPanel);
  } else {
    if (jsonData.sessionId !== latestSessionId) {
      latestSessionId = jsonData.sessionId;
      const nextUpPanel = panels[0];
      nextUpPanel.loadPanel(jsonData);
      oldestPanel = 1;
    } else {
      const nextUpPanel = panels[oldestPanel % 3];
      nextUpPanel.loadPanel(jsonData);
      oldestPanel = (oldestPanel + 1) % 3;
    }
  }
}

function createThreeup(jsonData, skipHistorical) {

  const threeupsHistoryClone = JSON.parse(JSON.stringify(threeupsHistory));

  // get the hero from jsonData to make sure we're not duplicating in the grid.
  // remove from clone of threeups if duplicate.
  for (const threeup in threeupsHistoryClone) {
    if (threeupsHistoryClone[threeup].chromelessPath === jsonData.chromelessPath) {
      threeupsHistoryClone.splice(threeup, 1);
    }
  }

  if (!skipHistorical) {
    threeupsHistory.push(jsonData);
  }

  if (threeups.length < 9) {
    oldestThreeup = (threeups.length + 1);
    if (typeof jsonData !== 'undefined') {
      const newThreeup = new Threeup(jsonData.chromelessPath);
      threeups.push(newThreeup);
      newThreeup.manifest();
    }
  } else {
    const nextUpThreeup = threeups[oldestThreeup % 9];
    threeups.forEach((threeup) => {
      if (nextUpThreeup === threeup) {
        threeup.newImage(jsonData.chromelessPath);
        oldestThreeup = (oldestThreeup + 1) % 9;
      } else {
        const num = Math.floor((threeupsHistoryClone.length - 1) * Math.random());
        const path = threeupsHistoryClone[num].chromelessPath;
        setTimeout(() => {
          threeup.newImage(path, true);
        }, 1000);
        threeupsHistoryClone.splice(num, 1);
      }
    });
  }
}

function refreshHistorical() {
  // Pass in 0 as the second option to skip re-storing this image in the history
  newImage(threeupsHistory[Math.floor(threeupsHistory.length * Math.random())], 0, 0);
}

function setRefreshTimeout() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refreshHistorical, refreshTiming);
}

newImage = function newImage(data, delay, index) {
  const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
  // Zero would mean that it's a historical refresh, not a new image to load.
  if (delay === 0) {
    refreshTiming = refreshInitTiming;
    setRefreshTimeout();
    createThreeup(jsonData, true);
  } else if (!showGrid || index === 0) {
    refreshTiming = refreshPostTiming;
    setRefreshTimeout();
    setTimeout(() => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const imageExists = Number(xhr.getResponseHeader('Content-Length')) > 0;
          if (imageExists) {
            // create new panel
            if (!showGrid) {
              createPanel(jsonData);
            } else {
              createThreeup(jsonData);
            }
          }
        }
      };
      xhr.open('GET', jsonData.origPath, true);
      xhr.send();
    }, delay);
  }
};

window.newImage = newImage;

function showSection(sectionName = null) {
  if (!sectionName) {
    return;
  }

  const mainElt = document.getElementById('main');

  if (sectionName === 'latest') {
    mainElt.classList.remove('show-historical');
    mainElt.classList.add('show-latest');
  } else {
    mainElt.classList.remove('show-latest');
    mainElt.classList.add('show-historical');
  }
}

// in the case of single images, 'descriptor' is the number of emotions in the json file;
// for multiple, it's also the filename.
function addNewImage(debugName, descriptor = -1) {
  const jsonData =  {
    id: debugName,
    origPath: `out-debug/${ debugName }-${ descriptor }-orig.jpg`,
    chromelessPath: `out-debug/${ debugName }-${ descriptor }-final.jpg`,
    reqPath: `out-debug/${ debugName }-${ descriptor }-req.json`,
    respPath: `out-debug/${ debugName }-${ descriptor }-resp.json`
  };
  createPanel(jsonData);
}

function loadStatesAndTimes() {
  if (timingsType === 'fast') {
    window.states = require(`./timing/${ eventName }/_timings-fast.js`);
  } else if (timingsType === 'finalOnly') {
    window.states = require(`./timing/${ eventName }/_timings-finalOnly.js`);
  } else if (timingsType === 'noFace') {
    window.states = require(`./timing/${ eventName }/_timings-noFace.js`);
  } else if (timingsType === 'noAura') {
    window.states = require(`./timing/${ eventName }/_timings-noAura.js`);
  } else if (timingsType === 'noChrome') {
    window.states = require(`./timing/${ eventName }/_timings-noChrome.js`);
  } else if (timingsType === 'finalOnlyNoChrome') {
    window.states = require(`./timing/${ eventName }/_timings-finalOnlyNoChrome.js`);
  } else {
    window.states = require(`./timing/${ eventName }/_timings.js`);
  }
}

function setValuesBasedOnQueryStrings() {
  zoom = window.location.href.includes('zoom');
  controls = window.location.href.includes('controls');
  showGrid = window.location.href.includes('showgrid');
  eventName = !window.location.href.includes('event') ? 'horizon' : window.location.href.split('event=')[1].split('&')[0].split('?')[0];
  timingsType = !window.location.href.includes('timing') ? 'normal' : window.location.href.split('timing=')[1].split('&')[0];
  dontPrint = window.location.href.includes('dontprint');

  // If dontPrint is true, send it to server.js
  if (dontPrint) {
    window.console.log('dont print')
    socket.emit('dontprint', {});
  }

  if (timingsType === 'noChrome' && window.location.pathname.includes('single')) {
    timingsType = 'finalOnlyNoChrome';
  }

  prepopulate = window.location.href.includes('prepopulate');

  loadStatesAndTimes();
}



window.onload = () => {
  setValuesBasedOnQueryStrings();

  if (showGrid) {
    showSection('historical');
  } else {
    showSection('latest');
  }

  if (controls) {
    const controlsElt = new Controls();

    controlsElt.addNewSingleImageButtons((val) => {
      addNewImage('debug-single', val);
    });

    controlsElt.addNewGroupImageButtons((val) => {
      addNewImage('debug-multi', val);
    });
  }

  if (prepopulate) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.responseText !== ('null' || null)) {
          JSON.parse(xhr.responseText).forEach((sessionString) => {
            const session = JSON.parse(sessionString);
            const image = session[session.highestScoredKey];
            if (!image.deleted) {
              const newThreeup = new Threeup(image.chromelessPath);
              threeups.push(newThreeup);
              newThreeup.manifest();
              threeupsHistory.push(image);
            }
          });
        }

        for (let i = threeupsHistory.length || 1; i < 10; i++) {
          const newThreeup = new Threeup(`out-debug/prepopulate${ i }.jpg`);
          threeups.push(newThreeup);
          newThreeup.manifest();
          threeupsHistory.push({
            chromelessPath: `out-debug/prepopulate${ i }.jpg`,
            origPath: `out-debug/prepopulate${ i }.jpg`
          });
        }

      }
    };
    xhr.open('GET', '/history-data', true);
    xhr.send();
  }

  if (zoom) {
    calcZoomLevel();
    window.onresize = () => {
      calcZoomLevel();
    };
  }

  refreshTimer = setTimeout(refreshHistorical, refreshTiming);

  socket.on('remove', function(data) {
    for (const key in data) {
      if (Boolean(data[key]) && typeof data[key] === 'object') {
        if (data[key].finalPath) {
          const index = threeupsHistory.findIndex((x) => {
            x.finalPath === data[key].finalPath
          });
          if (index !== -1) {
            threeupsHistory.splice(index, 1);
          }
        }
      }
    }
    setRefreshTimeout();
    refreshHistorical();
  });
};
