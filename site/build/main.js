/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// this file is just an entry point -- include files here, but don't actually write anything.
	
	__webpack_require__(1);
	
	__webpack_require__(2);
	
	__webpack_require__(61);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	if (!Array.prototype.includes) {
	  Array.prototype.includes = function (searchElement) {
	    var O = Object(this);
	    var len = parseInt(O.length) || 0;
	    if (len === 0) {
	      return false;
	    }
	    var n = parseInt(arguments[1]) || 0;
	    var k = void 0;
	    if (n >= 0) {
	      k = n;
	    } else {
	      k = len + n;
	      if (k < 0) {
	        k = 0;
	      }
	    }
	    var currentElement = void 0;
	    while (k < len) {
	      currentElement = O[k];
	      if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
	        // NaN !== NaN
	        return true;
	      }
	      k++;
	    }
	    return false;
	  };
	}
	
	if (!String.prototype.includes) {
	  String.prototype.includes = function (search, start) {
	    if (typeof start !== 'number') {
	      start = 0;
	    }
	
	    if (start + search.length > this.length) {
	      return false;
	    }
	    return this.indexOf(search, start) !== -1;
	  };
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global window, document, setTimeout, clearTimeout, XMLHttpRequest, require, socket */
	
	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _panel = __webpack_require__(3);
	
	var _panel2 = _interopRequireDefault(_panel);
	
	var _threeup = __webpack_require__(38);
	
	var _threeup2 = _interopRequireDefault(_threeup);
	
	var _controls = __webpack_require__(39);
	
	var _controls2 = _interopRequireDefault(_controls);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var zoom = false;
	var controls = false;
	var showGrid = false;
	var prepopulate = false;
	var dontPrint = false;
	
	var panels = [];
	var oldestPanel = null;
	
	var threeups = [];
	var threeupsHistory = [];
	var oldestThreeup = null;
	var timingsType = 'normal';
	window.states = null;
	var newImage = null;
	var eventName = null;
	
	var refreshTimer = null;
	// faster timing for when images have not been processed for a while
	var refreshInitTiming = 20000;
	// time to wait for inactivity before switching to refreshInitTiming
	var refreshPostTiming = 120000;
	var refreshTiming = refreshInitTiming;
	
	var latestSessionId = -1;
	
	function calcZoomLevel() {
	  var pageWidth = window.innerWidth;
	  var docWidth = document.getElementById('main').clientWidth;
	
	  var zoomLevel = pageWidth / docWidth;
	  document.getElementById('main').style.transform = 'scale(' + zoomLevel + ')';
	}
	
	function createPanel(jsonData) {
	  if (panels.length < 3) {
	    oldestPanel = panels.length + 1;
	
	    var newPanel = new _panel2.default(jsonData, eventName);
	    panels.push(newPanel);
	  } else {
	    if (jsonData.sessionId !== latestSessionId) {
	      latestSessionId = jsonData.sessionId;
	      var nextUpPanel = panels[0];
	      nextUpPanel.loadPanel(jsonData);
	      oldestPanel = 1;
	    } else {
	      var _nextUpPanel = panels[oldestPanel % 3];
	      _nextUpPanel.loadPanel(jsonData);
	      oldestPanel = (oldestPanel + 1) % 3;
	    }
	  }
	}
	
	function createThreeup(jsonData, skipHistorical) {
	
	  var threeupsHistoryClone = JSON.parse(JSON.stringify(threeupsHistory));
	
	  // get the hero from jsonData to make sure we're not duplicating in the grid.
	  // remove from clone of threeups if duplicate.
	  for (var threeup in threeupsHistoryClone) {
	    if (threeupsHistoryClone[threeup].chromelessPath === jsonData.chromelessPath) {
	      threeupsHistoryClone.splice(threeup, 1);
	    }
	  }
	
	  if (!skipHistorical) {
	    threeupsHistory.push(jsonData);
	  }
	
	  if (threeups.length < 9) {
	    oldestThreeup = threeups.length + 1;
	    if (typeof jsonData !== 'undefined') {
	      var newThreeup = new _threeup2.default(jsonData.chromelessPath);
	      threeups.push(newThreeup);
	      newThreeup.manifest();
	    }
	  } else {
	    (function () {
	      var nextUpThreeup = threeups[oldestThreeup % 9];
	      threeups.forEach(function (threeup) {
	        if (nextUpThreeup === threeup) {
	          threeup.newImage(jsonData.chromelessPath);
	          oldestThreeup = (oldestThreeup + 1) % 9;
	        } else {
	          (function () {
	            var num = Math.floor((threeupsHistoryClone.length - 1) * Math.random());
	            var path = threeupsHistoryClone[num].chromelessPath;
	            setTimeout(function () {
	              threeup.newImage(path, true);
	            }, 1000);
	            threeupsHistoryClone.splice(num, 1);
	          })();
	        }
	      });
	    })();
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
	  var jsonData = typeof data === 'string' ? JSON.parse(data) : data;
	  // Zero would mean that it's a historical refresh, not a new image to load.
	  if (delay === 0) {
	    refreshTiming = refreshInitTiming;
	    setRefreshTimeout();
	    createThreeup(jsonData, true);
	  } else if (!showGrid || index === 0) {
	    refreshTiming = refreshPostTiming;
	    setRefreshTimeout();
	    setTimeout(function () {
	      var xhr = new XMLHttpRequest();
	      xhr.onreadystatechange = function () {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	          var imageExists = Number(xhr.getResponseHeader('Content-Length')) > 0;
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
	
	function showSection() {
	  var sectionName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	  if (!sectionName) {
	    return;
	  }
	
	  var mainElt = document.getElementById('main');
	
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
	function addNewImage(debugName) {
	  var descriptor = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
	
	  var jsonData = {
	    id: debugName,
	    origPath: 'out-debug/' + debugName + '-' + descriptor + '-orig.jpg',
	    chromelessPath: 'out-debug/' + debugName + '-' + descriptor + '-final.jpg',
	    reqPath: 'out-debug/' + debugName + '-' + descriptor + '-req.json',
	    respPath: 'out-debug/' + debugName + '-' + descriptor + '-resp.json'
	  };
	  createPanel(jsonData);
	}
	
	function loadStatesAndTimes() {
	  if (timingsType === 'fast') {
	    window.states = __webpack_require__(40)("./" + eventName + '/_timings-fast.js');
	  } else if (timingsType === 'finalOnly') {
	    window.states = __webpack_require__(43)("./" + eventName + '/_timings-finalOnly.js');
	  } else if (timingsType === 'noFace') {
	    window.states = __webpack_require__(46)("./" + eventName + '/_timings-noFace.js');
	  } else if (timingsType === 'noAura') {
	    window.states = __webpack_require__(49)("./" + eventName + '/_timings-noAura.js');
	  } else if (timingsType === 'noChrome') {
	    window.states = __webpack_require__(52)("./" + eventName + '/_timings-noChrome.js');
	  } else if (timingsType === 'finalOnlyNoChrome') {
	    window.states = __webpack_require__(55)("./" + eventName + '/_timings-finalOnlyNoChrome.js');
	  } else {
	    window.states = __webpack_require__(58)("./" + eventName + '/_timings.js');
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
	    window.console.log('dont print');
	    socket.emit('dontprint', {});
	  }
	
	  if (timingsType === 'noChrome' && window.location.pathname.includes('single')) {
	    timingsType = 'finalOnlyNoChrome';
	  }
	
	  prepopulate = window.location.href.includes('prepopulate');
	
	  loadStatesAndTimes();
	}
	
	window.onload = function () {
	  setValuesBasedOnQueryStrings();
	
	  if (showGrid) {
	    showSection('historical');
	  } else {
	    showSection('latest');
	  }
	
	  if (controls) {
	    var controlsElt = new _controls2.default();
	
	    controlsElt.addNewSingleImageButtons(function (val) {
	      addNewImage('debug-single', val);
	    });
	
	    controlsElt.addNewGroupImageButtons(function (val) {
	      addNewImage('debug-multi', val);
	    });
	  }
	
	  if (prepopulate) {
	    (function () {
	      var xhr = new XMLHttpRequest();
	      xhr.onreadystatechange = function () {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	          if (xhr.responseText !== ('null' || null)) {
	            JSON.parse(xhr.responseText).forEach(function (sessionString) {
	              var session = JSON.parse(sessionString);
	              var image = session[session.highestScoredKey];
	              if (!image.deleted) {
	                var newThreeup = new _threeup2.default(image.chromelessPath);
	                threeups.push(newThreeup);
	                newThreeup.manifest();
	                threeupsHistory.push(image);
	              }
	            });
	          }
	
	          for (var i = threeupsHistory.length || 1; i < 10; i++) {
	            var newThreeup = new _threeup2.default('out-debug/prepopulate' + i + '.jpg');
	            threeups.push(newThreeup);
	            newThreeup.manifest();
	            threeupsHistory.push({
	              chromelessPath: 'out-debug/prepopulate' + i + '.jpg',
	              origPath: 'out-debug/prepopulate' + i + '.jpg'
	            });
	          }
	        }
	      };
	      xhr.open('GET', '/history-data', true);
	      xhr.send();
	    })();
	  }
	
	  if (zoom) {
	    calcZoomLevel();
	    window.onresize = function () {
	      calcZoomLevel();
	    };
	  }
	
	  refreshTimer = setTimeout(refreshHistorical, refreshTiming);
	
	  socket.on('remove', function (data) {
	    var _loop = function _loop(key) {
	      if (Boolean(data[key]) && _typeof(data[key]) === 'object') {
	        if (data[key].finalPath) {
	          var index = threeupsHistory.findIndex(function (x) {
	            x.finalPath === data[key].finalPath;
	          });
	          if (index !== -1) {
	            threeupsHistory.splice(index, 1);
	          }
	        }
	      }
	    };
	
	    for (var key in data) {
	      _loop(key);
	    }
	    setRefreshTimeout();
	    refreshHistorical();
	  });
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* global document, single, XMLHttpRequest */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _imageElementNext = __webpack_require__(4);
	
	var _imageElementNext2 = _interopRequireDefault(_imageElementNext);
	
	var _imageElementHorizon = __webpack_require__(30);
	
	var _imageElementHorizon2 = _interopRequireDefault(_imageElementHorizon);
	
	var _jsonElement = __webpack_require__(37);
	
	var _jsonElement2 = _interopRequireDefault(_jsonElement);
	
	var _imageConst = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Panel = function () {
	  function Panel(jsonData, eventName) {
	    _classCallCheck(this, Panel);
	
	    this.imagePath = jsonData.origPath;
	    this.reqPath = jsonData.reqPath;
	    this.respPath = jsonData.respPath;
	
	    this.element = null;
	    this.image = null;
	    this.jsonElement = null;
	
	    this.eventName = eventName;
	
	    this.init();
	  }
	
	  _createClass(Panel, [{
	    key: 'init',
	    value: function init() {
	      var _this = this;
	
	      if (this.eventName === _imageConst.EVENT_NAME_NEXT) {
	        this.image = new _imageElementNext2.default(this.imagePath, this.respPath, function () {
	          _this.imageIsReady();
	        });
	      } else if (this.eventName === _imageConst.EVENT_NAME_HORIZON) {
	        this.image = new _imageElementHorizon2.default(this.imagePath, this.respPath, function () {
	          _this.imageIsReady();
	        });
	      }
	
	      this.jsonElement = new _jsonElement2.default(this.reqPath, this.respPath);
	      this.sequenceTimeouts = [];
	      this.loadPanel();
	    }
	  }, {
	    key: 'manifest',
	    value: function manifest() {
	      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      var third = document.createElement('section');
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
	  }, {
	    key: 'newImage',
	    value: function newImage() {
	      var newOrigImgPath = arguments.length <= 0 || arguments[0] === undefined ? this.imagePath : arguments[0];
	      var newReqPath = arguments.length <= 1 || arguments[1] === undefined ? this.reqPath : arguments[1];
	      var newRespPath = arguments.length <= 2 || arguments[2] === undefined ? this.respPath : arguments[2];
	
	      this.imagePath = newOrigImgPath;
	      this.reqPath = newReqPath;
	      this.respPath = newRespPath;
	
	      this.image.imagePath = this.imagePath;
	      this.image.jsonPath = this.respPath;
	
	      this.jsonElement.reqPath = this.reqPath;
	      this.jsonElement.respPath = this.respPath;
	    }
	  }, {
	    key: 'imageIsReady',
	    value: function imageIsReady() {
	      var _this2 = this;
	
	      if (!this.element) {
	        this.manifest(function () {
	          // manifest panel & start animations
	          _this2.image.startAnimations();
	          _this2.jsonElement.startAnimations();
	        });
	      } else {
	        // we've already manifested
	        this.image.startAnimations();
	        this.jsonElement.startAnimations();
	      }
	    }
	  }, {
	    key: 'loadRespPath',
	    value: function loadRespPath() {
	      var _this3 = this;
	
	      var xhr = new XMLHttpRequest();
	      xhr.onreadystatechange = function () {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	          var respJson = JSON.parse(xhr.responseText);
	
	          _this3.loadReqPath(respJson);
	        }
	      };
	      xhr.open('GET', this.respPath, true);
	      xhr.send();
	    }
	  }, {
	    key: 'loadReqPath',
	    value: function loadReqPath(respJson) {
	      var _this4 = this;
	
	      var xhr = new XMLHttpRequest();
	      xhr.onreadystatechange = function () {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	          var reqJson = JSON.parse(xhr.responseText);
	          _this4.image.loadImage(respJson, _this4.imagePath);
	          if (_this4.jsonElement) {
	            _this4.jsonElement.loadJSON(reqJson, respJson);
	          }
	        }
	      };
	      xhr.open('GET', this.reqPath, true);
	      xhr.send();
	    }
	  }, {
	    key: 'loadPanel',
	    value: function loadPanel(jsonData) {
	      if (jsonData) {
	        this.origPath = jsonData.origPath;
	        this.reqPath = jsonData.reqPath;
	        this.respPath = jsonData.respPath;
	        this.imagePath = jsonData.origPath;
	      }
	      this.loadRespPath();
	    }
	  }, {
	    key: 'injectContent',
	    value: function injectContent(content) {
	      this.element.appendChild(content);
	    }
	  }, {
	    key: 'injectBefore',
	    value: function injectBefore(content) {
	      this.element.insertBefore(content, this.element.children[0]);
	    }
	  }, {
	    key: 'tearDown',
	    value: function tearDown() {
	      document.body.removeChild(this.element);
	    }
	  }]);
	
	  return Panel;
	}();
	
	exports.default = Panel;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single, document, states, requestAnimationFrame */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _panelComponent = __webpack_require__(5);
	
	var _panelComponent2 = _interopRequireDefault(_panelComponent);
	
	var _flashStep = __webpack_require__(16);
	
	var _flashStep2 = _interopRequireDefault(_flashStep);
	
	var _zoomStep = __webpack_require__(20);
	
	var _zoomStep2 = _interopRequireDefault(_zoomStep);
	
	var _faceStep = __webpack_require__(22);
	
	var _faceStep2 = _interopRequireDefault(_faceStep);
	
	var _emotionStep = __webpack_require__(23);
	
	var _emotionStep2 = _interopRequireDefault(_emotionStep);
	
	var _multiAuraStep = __webpack_require__(24);
	
	var _multiAuraStep2 = _interopRequireDefault(_multiAuraStep);
	
	var _backgroundStep = __webpack_require__(25);
	
	var _backgroundStep2 = _interopRequireDefault(_backgroundStep);
	
	var _vignetteStep = __webpack_require__(26);
	
	var _vignetteStep2 = _interopRequireDefault(_vignetteStep);
	
	var _haloStep = __webpack_require__(27);
	
	var _haloStep2 = _interopRequireDefault(_haloStep);
	
	var _chromeStep = __webpack_require__(28);
	
	var _chromeStep2 = _interopRequireDefault(_chromeStep);
	
	var _faceUtils = __webpack_require__(6);
	
	var faceUtils = _interopRequireWildcard(_faceUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _imageConst = __webpack_require__(11);
	
	var imageConst = _interopRequireWildcard(_imageConst);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Timeline = __webpack_require__(14);
	
	var ImageElement = function (_PanelComponent) {
	  _inherits(ImageElement, _PanelComponent);
	
	  function ImageElement() {
	    var imgPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	    var jsonPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	    var readyCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	    _classCallCheck(this, ImageElement);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageElement).call(this));
	
	    _this.canvasWidth = single ? imageConst.BACKEND_CANVAS_WIDTH : imageConst.CANVAS_WIDTH;
	    _this.canvasHeight = single ? imageConst.BACKEND_CANVAS_HEIGHT : imageConst.CANVAS_HEIGHT;
	
	    _this.canvas = null;
	    _this.context = null;
	
	    _this.width = 0;
	    _this.height = 0;
	
	    _this.imageElement = null;
	
	    _this.scrimAlpha = 0;
	
	    _this.eyeMidpoints = [];
	    _this.eyesMidpoint = new geometryUtils.Point();
	    _this.allEyesCenter = new geometryUtils.Point();
	
	    _this.canvasSnapshot = null;
	
	    _this.offsetX = 0;
	    _this.offsetY = 0;
	
	    _this.image = null;
	
	    _this.resizedImageOffset = null;
	    _this.subRect = {};
	
	    _this.imageScale = 1;
	
	    _this.faceBounds = null;
	
	    _this.facesAndEmotions = [];
	    _this.curFace = [];
	    _this.hexR = 1;
	
	    _this.tweens = [];
	    _this.timelines = [];
	
	    _this.treatments = {};
	
	    _this.resizedImageScale = 0;
	
	    _this.isDrawing = false;
	    _this.auraAnimations = null;
	    _this.readyCallback = readyCallback;
	
	    _this.hexVertices = [];
	
	    _this.init();
	    return _this;
	  }
	
	  _createClass(ImageElement, [{
	    key: 'init',
	    value: function init() {
	      if (this.imageElement) {
	        return;
	      }
	
	      this.imageElement = document.createElement('div');
	      this.imageElement.classList.add('image');
	
	      this.canvasUtils = new _canvasUtils2.default(this);
	
	      this.canvas = this.canvasUtils.createHiDPICanvas(this.canvasWidth, this.canvasHeight, 4);
	      this.canvas.classList.add('image-canvas');
	      this.canvas.width = this.canvasWidth;
	      this.canvas.height = this.canvasHeight;
	
	      this.imageElement.appendChild(this.canvas);
	
	      this.context = this.canvas.getContext('2d');
	
	      this.faceStep = new _faceStep2.default(this, this.canvas, this.context);
	      this.zoomStep = new _zoomStep2.default(this, this.canvas, this.context);
	
	      animationUtils.setSmoothing(this.context);
	    }
	  }, {
	    key: 'loadImage',
	    value: function loadImage(json, imgPath) {
	      this.canvasUtils.loadImage(json, imgPath);
	    }
	  }, {
	    key: 'startAnimations',
	    value: function startAnimations() {
	      var _this2 = this;
	
	      if (single) {
	        this.zoom(0, true);
	        this.startAuraAnimations();
	      } else {
	        _get(Object.getPrototypeOf(ImageElement.prototype), 'startAnimations', this).call(this, function () {
	          _this2.startAuraAnimations();
	        });
	      }
	    }
	  }, {
	    key: 'startAuraAnimations',
	    value: function startAuraAnimations() {
	      var _this3 = this;
	
	      this.auraAnimations = new Timeline({
	        onComplete: function onComplete() {
	          _get(Object.getPrototypeOf(ImageElement.prototype), 'killTimeline', _this3).call(_this3, _this3.auraAnimations);
	        }
	      });
	
	      var auraAnimStates = this.faces.length === 1 ? states.STATES_AURA_SINGLE : states.STATES_AURA_MULTIPLE;
	
	      auraAnimStates.forEach(function (state) {
	        _this3.auraAnimations.to(_this3, Math.max(state.DURATION, animationUtils.MIN_DURATION), {
	          onStart: function onStart() {
	            if (_this3[state.NAME]) {
	              _this3[state.NAME](state.DURATION);
	            } else {
	              _this3.pause(state.DURATION);
	            }
	          }
	        });
	      });
	
	      this.timelines.push(this.auraAnimations);
	    }
	  }, {
	    key: 'reinitFaces',
	    value: function reinitFaces(json) {
	      var _this4 = this;
	
	      _get(Object.getPrototypeOf(ImageElement.prototype), 'reinitFaces', this).call(this, json, function () {
	        var stepsToKill = [_this4.flashStep, _this4.faceStep, _this4.zoomStep, _this4.emotionStep, _this4.backgroundStep, _this4.mutliAuraStep, _this4.vignetteStep, _this4.haloStep, _this4.chromeStep];
	        stepsToKill.forEach(function (step) {
	          if (step) {
	            step.kill();
	            step = null;
	          }
	        });
	
	        _this4.faceStep = new _faceStep2.default(_this4, _this4.canvas, _this4.context);
	        _this4.zoomStep = new _zoomStep2.default(_this4, _this4.canvas, _this4.context);
	
	        _this4.backgroundFill = 'blue';
	        _this4.totalEmotions = 0;
	        _this4.imageScale = 1;
	        _this4.hexVertices = [];
	        _this4.facesAndEmotions = faceUtils.generateFacesAndEmotions(_this4.faces);
	        _this4.facesAndStrongestEmotions = faceUtils.generateFacesAndEmotions(_this4.faces, true);
	        _this4.treatments = animationUtils.generateTreatments(_this4.facesAndStrongestEmotions);
	        _this4.eyeMidpoints = faceUtils.generateEyeMidpoints(_this4.faces);
	        _this4.faceBounds = faceUtils.generateFaceBounds(_this4.faces);
	        _this4.allEyesCenter = faceUtils.generateAllEyesCenter(_this4.faces);
	        var totalEmotions = 0;
	        _this4.facesAndEmotions.forEach(function (face) {
	          totalEmotions += Object.keys(face).length;
	        });
	        _this4.noEmotions = totalEmotions === 0;
	        _this4.totalEmotions = totalEmotions;
	        _this4.scrimAlpha = 0;
	        _this4.fills = [];
	        _this4.vignettePattern = null;
	        _this4.resizedImageOffset = null;
	        _this4.resizedImageScale = 0;
	        _this4.auraAnimations = null;
	        _this4.offsetX = 0;
	        _this4.offsetY = 0;
	      });
	    }
	  }, {
	    key: 'ifNotDrawing',
	    value: function ifNotDrawing(callback) {
	      var _this5 = this;
	
	      requestAnimationFrame(function () {
	        if (_this5.isDrawing) {
	          _this5.imageElement.ifNotDrawing(callback);
	        } else {
	          callback();
	        }
	      });
	    }
	
	    //
	
	  }, {
	    key: 'flash',
	    value: function flash() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.flashStep = new _flashStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'zoom',
	    value: function zoom() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.zoomStep.zoom(duration, false);
	    }
	  }, {
	    key: 'face',
	    value: function face() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.face(duration);
	    }
	  }, {
	    key: 'forehead',
	    value: function forehead() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.forehead(duration);
	    }
	  }, {
	    key: 'eyes',
	    value: function eyes() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.eyes(duration);
	    }
	  }, {
	    key: 'ears',
	    value: function ears() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.ears(duration);
	    }
	  }, {
	    key: 'nose',
	    value: function nose() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.nose(duration);
	    }
	  }, {
	    key: 'mouth',
	    value: function mouth() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.mouth(duration);
	    }
	  }, {
	    key: 'chin',
	    value: function chin() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.chin(duration);
	    }
	  }, {
	    key: 'allFeatures',
	    value: function allFeatures() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.allFeatures(duration);
	    }
	  }, {
	    key: 'zoomOut',
	    value: function zoomOut() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.zoomStep.zoom(duration, true);
	    }
	  }, {
	    key: 'emotion',
	    value: function emotion() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.emotionStep = new _emotionStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'animateInBackground',
	    value: function animateInBackground() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.backgroundStep = new _backgroundStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'animateInMultiAura',
	    value: function animateInMultiAura() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.mutliAuraStep = new _multiAuraStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'animateInVignette',
	    value: function animateInVignette() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.vignetteStep = new _vignetteStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'animateInHalo',
	    value: function animateInHalo() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.haloStep = new _haloStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'chrome',
	    value: function chrome() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.chromeStep = new _chromeStep2.default(this, this.canvas, this.context, duration);
	    }
	  }]);
	
	  return ImageElement;
	}(_panelComponent2.default);
	
	exports.default = ImageElement;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, states, single */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _faceUtils = __webpack_require__(6);
	
	var faceUtils = _interopRequireWildcard(_faceUtils);
	
	var _emotionUtils = __webpack_require__(7);
	
	var emotionUtils = _interopRequireWildcard(_emotionUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	__webpack_require__(12);
	var Timeline = __webpack_require__(14);
	
	var PanelComponent = function () {
	  function PanelComponent() {
	    _classCallCheck(this, PanelComponent);
	
	    this.faces = [];
	    this.currFace = 0;
	
	    this.timeFactor = 1;
	    this.tweens = [];
	    this.timelines = [];
	
	    this.animations = null;
	  }
	
	  _createClass(PanelComponent, [{
	    key: 'pause',
	    value: function pause() {}
	  }, {
	    key: 'reinitFaces',
	    value: function reinitFaces(json) {
	      var _this = this;
	
	      var callback = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	
	      this.currFace = 0;
	      var faces = [];
	      var newJSON = [];
	
	      this.tweens = [];
	      this.timelines = [];
	
	      this.animations = null;
	
	      if (json.responses[0].faceAnnotations) {
	        json.responses[0].faceAnnotations.forEach(function (item, index) {
	          faces.push(item);
	          if (index === json.responses[0].faceAnnotations.length - 1) {
	            _this.faces = faceUtils.sortFaces(faces);
	            _this.faces.forEach(function (face) {
	              newJSON.push(face);
	            });
	            _this.json = newJSON;
	            if (callback) {
	              callback();
	            }
	          }
	        });
	      } else if (single) {
	        if (callback) {
	          callback();
	        }
	      }
	    }
	  }, {
	    key: 'getFaceInfo',
	    value: function getFaceInfo() {
	      var _this2 = this;
	
	      var json = {};
	      faceUtils.FACE_SECTIONS.forEach(function (section) {
	        json[section] = _this2.json[_this2.currFace][section];
	      });
	      return json;
	    }
	  }, {
	    key: 'getEmotionInfo',
	    value: function getEmotionInfo() {
	      var _this3 = this;
	
	      var face = arguments.length <= 0 || arguments[0] === undefined ? this.currFace : arguments[0];
	
	      var json = {};
	      emotionUtils.EMOTION_LIKELIHOODS.forEach(function (section) {
	        json[section] = _this3.json[face][section];
	      });
	      return json;
	    }
	  }, {
	    key: 'filterLandmarks',
	    value: function filterLandmarks(types) {
	      return this.json[this.currFace].landmarks.filter(function (mark) {
	        return types.indexOf(mark.type) !== -1;
	      });
	    }
	
	    // sort faces, left to right, based on their left edges.
	
	  }, {
	    key: 'sortFaces',
	    value: function sortFaces() {
	      this.faces.sort(function (a, b) {
	        return a.boundingPoly.vertices[0].x - b.boundingPoly.vertices[0].x;
	      });
	    }
	
	    // empty out every timeline; kill every tween.
	
	  }, {
	    key: 'killAnimations',
	    value: function killAnimations() {
	      var _this4 = this;
	
	      this.timelines.forEach(function (timeline) {
	        _this4.killTimeline(timeline);
	      });
	
	      this.tweens.forEach(function (tween) {
	        _this4.killTween(tween);
	      });
	
	      this.timelines = [];
	      this.tweens = [];
	    }
	  }, {
	    key: 'killTimeline',
	    value: function killTimeline() {
	      var timeline = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      if (!timeline) {
	        return;
	      }
	
	      timeline.pause();
	      timeline.clear();
	      timeline.eventCallback('onStart', null);
	      timeline.eventCallback('onUpdate', null);
	      timeline.eventCallback('onComplete', null);
	
	      this.timelines.splice(this.timelines.indexOf(timeline), 1);
	    }
	  }, {
	    key: 'killTween',
	    value: function killTween() {
	      var tween = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      if (!tween) {
	        return;
	      }
	
	      tween.pause();
	      tween.kill();
	      this.tweens.splice(this.tweens.indexOf(tween), 1);
	    }
	  }, {
	    key: 'startAnimations',
	    value: function startAnimations() {
	      var _this5 = this;
	
	      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      this.animations = new Timeline({
	        onComplete: function onComplete() {
	          if (++_this5.currFace < _this5.faces.length) {
	            _this5.startAnimations(callback);
	          } else {
	            _this5.currFace = 0;
	            _this5.killTimeline(_this5.animations);
	            if (callback) {
	              callback();
	            }
	          }
	        }
	      });
	
	      var animStates = this.faces.length > 1 ? states.STATES_MULTIPLE_FACES : states.STATES_SINGLE_FACE;
	      if (this.currFace === 0 && states.STATES_MULTIPLE_FACES.length > 0) {
	        animStates = states.STATES_INIT_FACE.concat(animStates);
	      }
	
	      if (this.currFace === this.faces.length - 1 || states.STATES_MULTIPLE_FACES.length === 0) {
	        animStates = animStates.concat(states.STATES_FINAL_FACE);
	      }
	
	      animStates.forEach(function (state) {
	        _this5.animations.to(_this5, Math.max(state.DURATION / _this5.timeFactor, animationUtils.MIN_DURATION), {
	          onStart: function onStart() {
	            if (_this5[state.NAME]) {
	              _this5[state.NAME](state.DURATION / _this5.timeFactor);
	            } else {
	              _this5.pause(state.DURATION);
	            }
	          }
	        });
	      });
	
	      this.timelines.push(this.animations);
	    }
	  }]);
	
	  return PanelComponent;
	}();
	
	exports.default = PanelComponent;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.FACE_SECTIONS = exports.LANDMARK_SECTIONS = undefined;
	exports.sortFaces = sortFaces;
	exports.generateFacesAndEmotions = generateFacesAndEmotions;
	exports.generateAllEyesCenter = generateAllEyesCenter;
	exports.generateFaceBounds = generateFaceBounds;
	exports.generateEyeMidpoints = generateEyeMidpoints;
	
	var _emotionUtils = __webpack_require__(7);
	
	var emotionUtils = _interopRequireWildcard(_emotionUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var LANDMARK_SECTIONS = exports.LANDMARK_SECTIONS = {
	  EARS: ['LEFT_EAR_TRAGION', 'RIGHT_EAR_TRAGION'],
	  FOREHEAD: ['LEFT_OF_LEFT_EYEBROW', 'RIGHT_OF_LEFT_EYEBROW', 'LEFT_OF_RIGHT_EYEBROW', 'RIGHT_OF_RIGHT_EYEBROW', 'LEFT_EYEBROW_UPPER_MIDPOINT', 'RIGHT_EYEBROW_UPPER_MIDPOINT', 'FOREHEAD_GLABELLA'],
	  EYES: ['LEFT_EYE', 'RIGHT_EYE', 'MIDPOINT_BETWEEN_EYES', 'LEFT_EYE_TOP_BOUNDARY', 'LEFT_EYE_RIGHT_CORNER', 'LEFT_EYE_BOTTOM_BOUNDARY', 'LEFT_EYE_LEFT_CORNER', 'LEFT_EYE_PUPIL', 'RIGHT_EYE_TOP_BOUNDARY', 'RIGHT_EYE_RIGHT_CORNER', 'RIGHT_EYE_BOTTOM_BOUNDARY', 'RIGHT_EYE_LEFT_CORNER', 'RIGHT_EYE_PUPIL'],
	  NOSE: ['NOSE_TIP', 'NOSE_BOTTOM_RIGHT', 'NOSE_BOTTOM_LEFT', 'NOSE_BOTTOM_CENTER'],
	  MOUTH: ['UPPER_LIP', 'LOWER_LIP', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'MOUTH_CENTER'],
	  CHIN: ['CHIN_GNATHION', 'CHIN_LEFT_GONION', 'CHIN_RIGHT_GONION'],
	  FULL: ['LEFT_EAR_TRAGION', 'RIGHT_EAR_TRAGION', 'LEFT_OF_LEFT_EYEBROW', 'RIGHT_OF_LEFT_EYEBROW', 'LEFT_OF_RIGHT_EYEBROW', 'RIGHT_OF_RIGHT_EYEBROW', 'LEFT_EYEBROW_UPPER_MIDPOINT', 'RIGHT_EYEBROW_UPPER_MIDPOINT', 'FOREHEAD_GLABELLA', 'LEFT_EYE', 'RIGHT_EYE', 'MIDPOINT_BETWEEN_EYES', 'LEFT_EYE_TOP_BOUNDARY', 'LEFT_EYE_RIGHT_CORNER', 'LEFT_EYE_BOTTOM_BOUNDARY', 'LEFT_EYE_LEFT_CORNER', 'LEFT_EYE_PUPIL', 'RIGHT_EYE_TOP_BOUNDARY', 'RIGHT_EYE_RIGHT_CORNER', 'RIGHT_EYE_BOTTOM_BOUNDARY', 'RIGHT_EYE_LEFT_CORNER', 'RIGHT_EYE_PUPIL', 'NOSE_TIP', 'NOSE_BOTTOM_RIGHT', 'NOSE_BOTTOM_LEFT', 'NOSE_BOTTOM_CENTER', 'UPPER_LIP', 'LOWER_LIP', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'MOUTH_CENTER', 'CHIN_GNATHION', 'CHIN_LEFT_GONION', 'CHIN_RIGHT_GONION']
	};
	
	var FACE_SECTIONS = exports.FACE_SECTIONS = ['boundingPoly', 'fdboundingPoly', 'rollAngle', 'panAngle', 'tiltAngle', 'detectionConfidence', 'landmarkingConfidence'];
	
	// sort faces, left to right, based on their left edges.
	function sortFaces() {
	  var faces = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	
	  faces.sort(function (a, b) {
	    return a.boundingPoly.vertices[0].x - b.boundingPoly.vertices[0].x;
	  });
	  return faces;
	}
	
	function generateFacesAndEmotions() {
	  var faces = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	  var strongestOnly = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	
	  var facesAndEmotions = [];
	
	  faces.forEach(function (face) {
	    var emotions = {};
	    if (face.angerLikelihood !== 'VERY_UNLIKELY') {
	      emotions.ANGER = face.angerLikelihood;
	    }
	    if (face.joyLikelihood !== 'VERY_UNLIKELY') {
	      emotions.JOY = face.joyLikelihood;
	    }
	    if (face.sorrowLikelihood !== 'VERY_UNLIKELY') {
	      emotions.SORROW = face.sorrowLikelihood;
	    }
	    if (face.surpriseLikelihood !== 'VERY_UNLIKELY') {
	      emotions.SURPRISE = face.surpriseLikelihood;
	    }
	    if (!strongestOnly) {
	      facesAndEmotions.push(emotions);
	    } else {
	      facesAndEmotions.push(emotionUtils.getStrongestEmotions(emotions));
	    }
	  });
	  return facesAndEmotions;
	}
	
	function generateAllEyesCenter(faces) {
	  var center = new geometryUtils.Point();
	
	  var minX = 10000000;
	  var maxX = 0;
	  var avgY = 0;
	
	  faces.forEach(function (face) {
	    if (face.boundingPoly.vertices[0].x < minX) {
	      minX = face.boundingPoly.vertices[0].x;
	    }
	
	    if (face.boundingPoly.vertices[1].x > maxX) {
	      maxX = face.boundingPoly.vertices[1].x;
	    }
	
	    var eyesYAvg = (face.landmarks[0].position.y + face.landmarks[1].position.y) / 2;
	
	    avgY += eyesYAvg;
	  });
	
	  var centerX = (minX + maxX) / 2;
	  var centerY = avgY / faces.length;
	
	  center.x = centerX;
	  center.y = centerY;
	
	  return center;
	}
	
	function generateFaceBounds(faces) {
	  var minX = 10000000;
	  var maxX = 0;
	  var minY = 10000000;
	  var maxY = 0;
	
	  faces.forEach(function (face) {
	    if (face.boundingPoly.vertices[0].x < minX) {
	      minX = face.boundingPoly.vertices[0].x;
	    }
	
	    if (face.boundingPoly.vertices[1].x > maxX) {
	      maxX = face.boundingPoly.vertices[1].x;
	    }
	
	    if (face.boundingPoly.vertices[0].y < minY) {
	      minY = face.boundingPoly.vertices[0].y;
	    }
	
	    if (face.boundingPoly.vertices[2].y > maxY) {
	      maxY = face.boundingPoly.vertices[2].y;
	    }
	  });
	
	  return {
	    left: minX,
	    right: maxX,
	    top: minY,
	    bottom: maxY
	  };
	}
	
	function generateEyeMidpoints(faces) {
	  var eyeMidpoints = [];
	
	  faces.forEach(function (face) {
	    eyeMidpoints.push(new geometryUtils.midpointFromCoords(face.landmarks[0].position.x, face.landmarks[1].position.x, face.landmarks[0].position.y, face.landmarks[1].position.y));
	  });
	
	  return eyeMidpoints;
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getStrongestEmotions = getStrongestEmotions;
	exports.getDominantEmotion = getDominantEmotion;
	var EMOTION_LIKELIHOODS = exports.EMOTION_LIKELIHOODS = ['joyLikelihood', 'sorrowLikelihood', 'angerLikelihood', 'surpriseLikelihood'];
	
	var EMOTION_STATES = exports.EMOTION_STATES = {
	  VERY_UNLIKELY: 'VERY_UNLIKELY',
	  UNLIKELY: 'UNLIKELY',
	  POSSIBLE: 'POSSIBLE',
	  LIKELY: 'LIKELY',
	  VERY_LIKELY: 'VERY_LIKELY'
	};
	
	var EMOTION_STRENGTHS = exports.EMOTION_STRENGTHS = {
	  VERY_LIKELY: 4,
	  LIKELY: 3,
	  POSSIBLE: 2,
	  UNLIKELY: 1,
	  VERY_UNLIKELY: 0
	};
	
	function getStrongestEmotions(emotionsRaw) {
	  var numToChoose = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];
	
	  var emotionTiers = [];
	  for (var i = 0; i < Object.keys(EMOTION_STRENGTHS).length; i++) {
	    emotionTiers.push([]);
	  }
	
	  var emotions = Object.keys(emotionsRaw);
	  emotions.forEach(function (emotion) {
	    var index = EMOTION_STRENGTHS[emotionsRaw[emotion]];
	    emotionTiers[index].push(emotion);
	  });
	
	  emotionTiers.reverse();
	
	  var outputEmotions = [];
	  var maxOutputEmotions = numToChoose;
	
	  emotionTiers.forEach(function (tier) {
	    // if we can get all the emotions from this tier into the output, do so
	    if (outputEmotions.length + tier.length <= maxOutputEmotions) {
	      tier.forEach(function (emotion) {
	        outputEmotions.push(emotion);
	      });
	    } else {
	      // if we can't, choose them from this tier, randomly, one at a time.
	      var chosenIndices = [];
	
	      while (Object.keys(outputEmotions).length < maxOutputEmotions) {
	        var nextIndex = Math.floor(Math.random() * tier.length);
	        if (!chosenIndices.includes(nextIndex)) {
	          outputEmotions.push(tier[nextIndex]);
	          chosenIndices.push(nextIndex);
	        }
	      }
	    }
	  });
	
	  var outputEmotionsObj = {};
	  outputEmotions.forEach(function (emotion) {
	    outputEmotionsObj[emotion] = emotionsRaw[emotion];
	  });
	
	  return outputEmotionsObj;
	}
	
	function getDominantEmotion(person) {
	  var emotions = Object.keys(person);
	  emotions.sort(function (a, b) {
	    return EMOTION_STRENGTHS[person[b]] - EMOTION_STRENGTHS[person[a]];
	  });
	
	  return emotions[0];
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BoundingRect = exports.Point = undefined;
	exports.createPadding = createPadding;
	exports.createHexagon = createHexagon;
	exports.createRoundedHexagon = createRoundedHexagon;
	exports.midpointFromPoints = midpointFromPoints;
	exports.midpointFromCoords = midpointFromCoords;
	exports.distanceFromCoords = distanceFromCoords;
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Point = exports.Point = function Point() {
	  var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	  _classCallCheck(this, Point);
	
	  this.x = x;
	  this.y = y;
	};
	
	var BoundingRect = exports.BoundingRect = function BoundingRect() {
	  var pointTopLeft = arguments.length <= 0 || arguments[0] === undefined ? new Point() : arguments[0];
	  var pointTopRight = arguments.length <= 1 || arguments[1] === undefined ? new Point() : arguments[1];
	  var pointBottomRight = arguments.length <= 2 || arguments[2] === undefined ? new Point() : arguments[2];
	  var pointBottomLeft = arguments.length <= 3 || arguments[3] === undefined ? new Point() : arguments[3];
	
	  _classCallCheck(this, BoundingRect);
	
	  this.pointTopLeft = pointTopLeft;
	  this.pointTopRight = pointTopRight;
	  this.pointBottomRight = pointBottomRight;
	  this.pointBottomLeft = pointBottomLeft;
	};
	
	function createPadding(val) {
	  var paddingFactor = 0;
	
	  return val * paddingFactor * 2;
	}
	
	function createHexagon() {
	  var r = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	  var vertices = [];
	
	  var k = Math.PI * 2 / -6;
	
	  for (var i = 1; i < 6; i++) {
	    var nextX = r * Math.cos(i * k);
	    var nextY = r * Math.sin(i * k);
	    vertices.push(new Point(nextX, nextY));
	  }
	
	  return vertices;
	}
	
	function createRoundedHexagon() {
	  var r = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	  var cornerRadius = arguments.length <= 1 || arguments[1] === undefined ? animationUtils.HEXAGON_CORNER_RADIUS : arguments[1];
	
	  var vertices = [];
	
	  var k = Math.PI * 2 / -6;
	  var degDiff = k * cornerRadius / r;
	  for (var i = 0; i < 6; i++) {
	    var firstX = r * Math.cos(i * k - degDiff);
	    var firstY = r * Math.sin(i * k - degDiff);
	    vertices.push(new Point(firstX, firstY));
	    var secondX = r * Math.cos(i * k + degDiff);
	    var secondY = r * Math.sin(i * k + degDiff);
	    vertices.push(new Point(secondX, secondY));
	  }
	
	  return vertices;
	}
	
	function midpointFromPoints() {
	  var point1 = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var point2 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	
	  if (!point1 || !point2) {
	    return new Point(0, 0);
	  }
	  var newX = (point1.x + point2.x) / 2;
	  var newY = (point1.y + point2.y) / 2;
	  return new Point(newX, newY);
	}
	
	function midpointFromCoords() {
	  var x1 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var x2 = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var y1 = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	  var y2 = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	
	  var newX = (x1 + x2) / 2;
	  var newY = (y1 + y2) / 2;
	  return new Point(newX, newY);
	}
	
	function distanceFromCoords() {
	  var point1 = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var point2 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	
	  if (!point1 || !point2) {
	    return 0;
	  }
	
	  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.CERTAINTY_HALO_RADII = exports.POINTS_FADE_DURATION = exports.MIN_DURATION = exports.EMOTION_HEX_FADE_DURATION = exports.CORNER_SHADOW_HIDE_RADIUS = exports.SHADOW_HIDE_FEATHER = exports.SIDE_SHADOW_HIDE_WIDTH = exports.MAX_HEX_DIFF = exports.MAX_HEX_RADIUS = exports.MIN_HEX_RADIUS = exports.JSON_PATHS = exports.CHROME_TALL_HEIGHT = exports.CHROME_SHORT_HEIGHT = exports.CHROME_SPACE_BETWEEN_LINES = exports.CHROME_SINGLE_LINE_HEIGHT = exports.BACKEND_CHROME_ITEM_WIDTH = exports.CHROME_ITEM_WIDTH = exports.CHROME_VERTICAL_PADDING = exports.CHROME_HORIZONTAL_PADDING = exports.CHROME_HEX_RADIUS = exports.CHROME_MAX_ITEMS = exports.CHROME_MAX_ROWS = exports.HALO_BLEND = exports.HALO_ALPHA = exports.HALO_INNER_COLOR_RANDOM = exports.HALO_OUTER_COLOR = exports.VIGNETTE_BLEND = exports.VIGNETTE_ALPHA = exports.VIGNETTE_RADIUS = exports.VIGNETTE_OUTER_COLOR_RANDOM = exports.VIGNETTE_CENTER_COLOR = exports.BG_ALPHA = exports.BLEND_NORMAL = exports.HEXAGON_CORNER_RADIUS = exports.HEX_MIN_BOTTOM_EYES_MARGIN = exports.HEX_MIN_BOTTOM_VERTICAL_MARGIN = exports.HEX_UPPER_MIN_VERTICAL_MARGIN = exports.HEX_LOWER_MIN_VERTICAL_MARGIN = undefined;
	exports.getStrongestColor = getStrongestColor;
	exports.generateSinglePersonTreatment = generateSinglePersonTreatment;
	exports.generatePersonalAuraColors = generatePersonalAuraColors;
	exports.generateGroupAuraColors = generateGroupAuraColors;
	exports.generateTreatments = generateTreatments;
	exports.setSmoothing = setSmoothing;
	exports.getSquareColorSample = getSquareColorSample;
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _emotionUtils = __webpack_require__(7);
	
	var emotionUtils = _interopRequireWildcard(_emotionUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _imageConst = __webpack_require__(11);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var HEX_LOWER_MIN_VERTICAL_MARGIN = exports.HEX_LOWER_MIN_VERTICAL_MARGIN = 10;
	var HEX_UPPER_MIN_VERTICAL_MARGIN = exports.HEX_UPPER_MIN_VERTICAL_MARGIN = 30;
	var HEX_MIN_BOTTOM_VERTICAL_MARGIN = exports.HEX_MIN_BOTTOM_VERTICAL_MARGIN = 180;
	
	var HEX_MIN_BOTTOM_EYES_MARGIN = exports.HEX_MIN_BOTTOM_EYES_MARGIN = 0.5;
	
	var HEXAGON_CORNER_RADIUS = exports.HEXAGON_CORNER_RADIUS = 10;
	
	var BLEND_NORMAL = exports.BLEND_NORMAL = 'source-over';
	
	var BG_ALPHA = exports.BG_ALPHA = 0.35;
	
	var VIGNETTE_CENTER_COLOR = exports.VIGNETTE_CENTER_COLOR = colorUtils.TRANSPARENT;
	var VIGNETTE_OUTER_COLOR_RANDOM = exports.VIGNETTE_OUTER_COLOR_RANDOM = true;
	var VIGNETTE_RADIUS = exports.VIGNETTE_RADIUS = 0.75;
	var VIGNETTE_ALPHA = exports.VIGNETTE_ALPHA = 1;
	var VIGNETTE_BLEND = exports.VIGNETTE_BLEND = 'overlay';
	
	var HALO_OUTER_COLOR = exports.HALO_OUTER_COLOR = colorUtils.TRANSPARENT;
	var HALO_INNER_COLOR_RANDOM = exports.HALO_INNER_COLOR_RANDOM = true;
	var HALO_ALPHA = exports.HALO_ALPHA = 1;
	var HALO_BLEND = exports.HALO_BLEND = 'screen';
	
	var CHROME_MAX_ROWS = exports.CHROME_MAX_ROWS = 2;
	var CHROME_MAX_ITEMS = exports.CHROME_MAX_ITEMS = 10;
	var CHROME_HEX_RADIUS = exports.CHROME_HEX_RADIUS = 12.5;
	var CHROME_HORIZONTAL_PADDING = exports.CHROME_HORIZONTAL_PADDING = 40;
	var CHROME_VERTICAL_PADDING = exports.CHROME_VERTICAL_PADDING = 25;
	var CHROME_ITEM_WIDTH = exports.CHROME_ITEM_WIDTH = (_imageConst.CANVAS_WIDTH - CHROME_HORIZONTAL_PADDING * 2) / 5;
	var BACKEND_CHROME_ITEM_WIDTH = exports.BACKEND_CHROME_ITEM_WIDTH = (_imageConst.BACKEND_CANVAS_WIDTH - CHROME_HORIZONTAL_PADDING * 2) / 10;
	var CHROME_SINGLE_LINE_HEIGHT = exports.CHROME_SINGLE_LINE_HEIGHT = 75 - CHROME_VERTICAL_PADDING * 2;
	var CHROME_SPACE_BETWEEN_LINES = exports.CHROME_SPACE_BETWEEN_LINES = 12.5;
	var CHROME_SHORT_HEIGHT = exports.CHROME_SHORT_HEIGHT = CHROME_SINGLE_LINE_HEIGHT + CHROME_VERTICAL_PADDING * 2;
	var CHROME_TALL_HEIGHT = exports.CHROME_TALL_HEIGHT = CHROME_SINGLE_LINE_HEIGHT * 2 + CHROME_VERTICAL_PADDING * 2 + CHROME_SPACE_BETWEEN_LINES;
	
	var JSON_PATHS = exports.JSON_PATHS = {
	  REQ: 'req',
	  RES: 'resp'
	};
	
	// relative to canvas height
	var MIN_HEX_RADIUS = exports.MIN_HEX_RADIUS = 0.2;
	var MAX_HEX_RADIUS = exports.MAX_HEX_RADIUS = 0.3;
	var MAX_HEX_DIFF = exports.MAX_HEX_DIFF = 0.25;
	
	var SIDE_SHADOW_HIDE_WIDTH = exports.SIDE_SHADOW_HIDE_WIDTH = 60;
	var SHADOW_HIDE_FEATHER = exports.SHADOW_HIDE_FEATHER = SIDE_SHADOW_HIDE_WIDTH * 5;
	var CORNER_SHADOW_HIDE_RADIUS = exports.CORNER_SHADOW_HIDE_RADIUS = 300;
	
	var EMOTION_HEX_FADE_DURATION = exports.EMOTION_HEX_FADE_DURATION = 0.6;
	
	// to trick timelines into "playing" things that we still want to be instant.
	var MIN_DURATION = exports.MIN_DURATION = 1 / 60;
	var POINTS_FADE_DURATION = exports.POINTS_FADE_DURATION = 0.2;
	
	var CERTAINTY_HALO_RADII = exports.CERTAINTY_HALO_RADII = {
	  UNLIKELY: 12,
	  POSSIBLE: 8,
	  LIKELY: 1,
	  VERY_LIKELY: 1.5
	};
	
	function getStrongestColor(imageElement) {
	  var emo = imageElement.facesAndStrongestEmotions;
	  var emotionStrengths = [];
	  var returnColors = [];
	
	  function compareStrength(a, b) {
	    if (a.strength < b.strength) return 1;
	    if (a.strength > b.strength) return -1;
	    return 0;
	  }
	
	  emo.forEach(function (emotions, index) {
	    var strength = _emotionUtils.EMOTION_STRENGTHS[emo[index][Object.keys(emo[index])[0]]];
	    if (!strength) strength = 0;
	    var emoObj = { index: index, strength: strength };
	    emotionStrengths.push(emoObj);
	  });
	
	  // Sort people by strength of emotion
	  emotionStrengths.sort(compareStrength);
	
	  emotionStrengths.forEach(function (item, index) {
	    var personIndex = emotionStrengths[index].index;
	    var color = imageElement.treatments.personalAuraColors[personIndex][0];
	    if (color !== colorUtils.NEUTRAL) {
	      returnColors.push(imageElement.treatments.personalAuraColors[personIndex][0]);
	    }
	  });
	
	  return returnColors;
	
	  // This was so if a person had 2 emotions, and the other had none, it would use the first persons strongest emotion
	  // returnColor = imageElement.treatments.personalAuraColors[strongestEmotion][0];
	  // if(returnColor === 'rgba(34, 45, 51, 1)') {
	  //   const changeTo = (strongestEmotion === 1) ? 0 : 1;
	  //   returnColor = imageElement.treatments.personalAuraColors[changeTo][0];
	  // }
	  // return returnColor;
	}
	
	function generateSinglePersonTreatment(person) {
	  var emotions = Object.keys(person);
	  if (emotions.length === 0) {
	    return {
	      noEmotionScrim: true
	    };
	  }
	  var backgroundIndex = 0;
	  var vignetteOuterIndex = 0;
	  var vignetteInnerIndex = 0;
	  var haloInnerIndex = 0;
	  var haloOuterIndex = 0;
	
	  var haloRadius = 1;
	
	  var backgroundColor = colorUtils.generateColorFromIndex(backgroundIndex, emotions);
	
	  var vignetteInnerColor = null;
	  var vignetteOuterColor = null;
	
	  var haloInnerColor = null;
	  var haloOuterColor = null;
	
	  if (emotions.length > 1) {
	    var dominantEmotion = emotionUtils.getDominantEmotion(person);
	
	    backgroundIndex = emotions.indexOf(dominantEmotion);
	    vignetteInnerIndex = 1 - backgroundIndex;
	    vignetteOuterIndex = backgroundIndex;
	    haloInnerIndex = 1 - backgroundIndex;
	    haloOuterIndex = backgroundIndex;
	
	    vignetteInnerColor = colorUtils.generateColorFromIndex(vignetteInnerIndex, emotions);
	    vignetteOuterColor = colorUtils.generateColorFromIndex(vignetteOuterIndex, emotions);
	
	    haloInnerColor = colorUtils.generateColorFromIndex(haloInnerIndex, emotions);
	    haloOuterColor = colorUtils.generateColorFromIndex(haloOuterIndex, emotions);
	  } else {
	    // in one-emotion treatments, make sure we don't keep picking the same color.
	    vignetteInnerColor = colorUtils.generateColorFromIndex(vignetteInnerIndex, emotions);
	    vignetteOuterColor = vignetteInnerColor;
	    while (vignetteOuterColor === vignetteInnerColor) {
	      vignetteOuterColor = colorUtils.generateColorFromIndex(vignetteOuterIndex, emotions);
	    }
	
	    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[backgroundIndex]]] < 2) {
	    //   backgroundColor = colorUtils.subAlpha(backgroundColor, 0.3);
	    // }
	
	    haloInnerColor = colorUtils.generateColorFromIndex(haloInnerIndex, emotions);
	    haloOuterColor = haloInnerColor;
	    while (haloOuterColor === haloInnerColor) {
	      haloOuterColor = colorUtils.generateColorFromIndex(haloOuterIndex, emotions);
	    }
	
	    haloInnerColor = colorUtils.subAlpha(haloInnerColor, 0.75);
	
	    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[haloInnerIndex]]] < 3) {
	    //   haloInnerColor = colorUtils.TRANSPARENT;
	    // }
	    // if (emotionUtils.EMOTION_STRENGTHS[person[emotions[haloOuterIndex]]] < 4) {
	    //   haloOuterColor = colorUtils.TRANSPARENT;
	    // } else {
	    haloOuterColor = colorUtils.subAlpha(haloOuterColor, 0.75);
	    // }
	  }
	
	  haloRadius = CERTAINTY_HALO_RADII[person[emotions[haloInnerIndex]]];
	
	  return {
	    background: backgroundColor,
	    vignette: {
	      innerColor: vignetteInnerColor,
	      outerColor: vignetteOuterColor,
	      alpha: colorUtils.CERTAINTY_ALPHAS[person[emotions[vignetteOuterIndex]]] / 100.00
	    },
	    halo: {
	      innerColor: haloInnerColor,
	      outerColor: haloOuterColor,
	      radius: haloRadius,
	      alpha: colorUtils.CERTAINTY_ALPHAS[person[emotions[haloInnerIndex]]] / 100.00
	    }
	  };
	}
	
	function generatePersonalAuraColors(people) {
	  var peopleOutput = [];
	
	  people.forEach(function (emotions) {
	    var person = [];
	    if (Object.keys(emotions).length === 0) {
	      person.push(colorUtils.subAlpha(colorUtils.NEUTRAL, colorUtils.BG_ALPHA));
	    } else if (Object.keys(emotions).length === 1) {
	      person.push(colorUtils.getRandomColorWithAlpha(null, Object.keys(emotions)[0], 100));
	      person.push(colorUtils.TRANSPARENT);
	    } else {
	      var first = Object.keys(emotions)[0];
	      var second = Object.keys(emotions)[1];
	      person.push(colorUtils.getRandomColorWithAlpha({}, first, 100));
	      person.push(colorUtils.getRandomColorWithAlpha({}, second, 100));
	    }
	    peopleOutput.push(person);
	  });
	
	  return peopleOutput;
	}
	
	function generateGroupAuraColors(people) {
	  var gradientColors = [];
	
	  people.forEach(function (person) {
	    var emotions = Object.keys(person);
	    emotions.forEach(function (emotion) {
	      gradientColors.push(colorUtils.getRandomColorWithAlpha(null, emotion, person[emotion]));
	    });
	  });
	
	  return gradientColors;
	}
	
	function generateTreatments() {
	  var facesAndEmotions = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	
	  var treatments = {};
	
	  // store different colors & return different objects
	  // if one person vs. multiple people
	  if (facesAndEmotions.length === 1) {
	    treatments.treatment = generateSinglePersonTreatment(facesAndEmotions[0]);
	  } else {
	    treatments.personalAuraColors = generatePersonalAuraColors(facesAndEmotions);
	    treatments.groupAuraColors = generateGroupAuraColors(facesAndEmotions);
	  }
	
	  return treatments;
	}
	
	function setSmoothing() {
	  var context = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	  if (!context) {
	    return;
	  }
	  context.imageSmoothingEnabled = true;
	  context.imageSmoothingQuality = 'high';
	}
	
	function getSquareColorSample() {
	  var canvas = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var dim = arguments.length <= 1 || arguments[1] === undefined ? 3 : arguments[1];
	  var topLeftPoint = arguments.length <= 2 || arguments[2] === undefined ? new geometryUtils.Point() : arguments[2];
	
	  if (!canvas || !dim) {
	    return;
	  }
	
	  var context = canvas.getContext('2d');
	  setSmoothing(context);
	
	  var totalR = 0;
	  var totalG = 0;
	  var totalB = 0;
	  var totalPixels = 0;
	
	  for (var i = 0; i < dim; i++) {
	    for (var j = 0; j < dim; j++) {
	      totalPixels++;
	      var pixelData = context.getImageData(topLeftPoint.x + j, topLeftPoint.y + i, 1, 1);
	      totalR += pixelData.data[0];
	      totalG += pixelData.data[1];
	      totalB += pixelData.data[2];
	    }
	  }
	
	  totalR /= totalPixels;
	  totalR = totalR.toFixed(0);
	
	  totalG /= totalPixels;
	  totalG = totalG.toFixed(0);
	
	  totalB /= totalPixels;
	  totalB = totalB.toFixed(0);
	
	  return 'rgba(' + totalR + ', ' + totalG + ', ' + totalB + ', 1)';
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.subAlpha = subAlpha;
	exports.splitRGBA = splitRGBA;
	exports.chooseRandomColorFromEmotion = chooseRandomColorFromEmotion;
	exports.shadeRGBColor = shadeRGBColor;
	exports.getRandomColorWithAlpha = getRandomColorWithAlpha;
	exports.generateColorFromIndex = generateColorFromIndex;
	exports.getEmotionForColor = getEmotionForColor;
	var ANGER = exports.ANGER = ['rgba(255, 87, 34, 1)', 'rgba(244, 67, 54, 1)', 'rgba(233, 30, 99, 1)'];
	var JOY = exports.JOY = ['rgba(255, 235, 59, 1)', 'rgba(255, 193, 7, 1)', 'rgba(255, 152, 0, 1)'];
	var SORROW = exports.SORROW = ['rgba(33, 150, 243, 1)', 'rgba(3, 196, 244, 1)', 'rgba(0, 188, 212, 1)'];
	var SURPRISE = exports.SURPRISE = ['rgba(156, 39, 176, 1)', 'rgba(103, 58, 183, 1)', 'rgba(63, 81, 181, 1)'];
	
	var CANONICAL = exports.CANONICAL = {
	  ANGER: 'rgba(255, 81, 0, 1)',
	  JOY: 'rgba(255, 214, 0, 1)',
	  SORROW: 'rgba(33, 150, 243, 1)',
	  SURPRISE: 'rgba(171, 71, 188, 1)'
	};
	
	var SCRIM = exports.SCRIM = 'rgb(0, 0, 0, 1)';
	var SCRIM_MAX_ALPHA = exports.SCRIM_MAX_ALPHA = 0.3;
	
	var NEUTRAL = exports.NEUTRAL = 'rgba(34, 45, 51, 1)';
	var NEUTRAL_WHITE = exports.NEUTRAL_WHITE = 'rgba(255, 255, 255, 1)';
	var TRANSPARENT = exports.TRANSPARENT = 'rgba(255, 255, 255, 0)';
	var WHITE = exports.WHITE = 'rgba(255, 255, 255, 1)';
	var BLACK = exports.BLACK = 'rgba(0, 0, 0, 1)';
	
	var CERTAINTY_ALPHAS = exports.CERTAINTY_ALPHAS = {
	  // VERY_UNLIKELY: 0,
	  // UNLIKELY: 50,
	  // POSSIBLE: 70,
	  // LIKELY: 90,
	  VERY_UNLIKELY: 100,
	  UNLIKELY: 100,
	  POSSIBLE: 100,
	  LIKELY: 100,
	  VERY_LIKELY: 100
	};
	
	function subAlpha(color) {
	  var alpha = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	
	  return color.split(color.split(',')[3])[0] + ' ' + alpha + ')';
	}
	
	function splitRGBA() {
	  var color = arguments.length <= 0 || arguments[0] === undefined ? 'rgba(255, 255, 255, 1)' : arguments[0];
	
	  var split = {
	    r: 0,
	    g: 0,
	    b: 0,
	    a: 0
	  };
	
	  split.r = Number(color.split('(')[1].split(',')[0]);
	  split.g = Number(color.split(', ')[1].split(',')[0]);
	  split.b = Number(color.split(', ')[2].split(',')[0]);
	  split.a = Number(color.split(', ')[3].split(')')[0]);
	
	  return split;
	}
	
	function chooseRandomColorFromEmotion() {
	  var emotion = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	  var color = null;
	
	  switch (emotion) {
	    case 'ANGER':
	      color = ANGER[Math.floor(Math.random() * ANGER.length)];
	      break;
	    case 'JOY':
	      color = JOY[Math.floor(Math.random() * JOY.length)];
	      break;
	    case 'SORROW':
	      color = SORROW[Math.floor(Math.random() * SORROW.length)];
	      break;
	    case 'SURPRISE':
	      color = SURPRISE[Math.floor(Math.random() * SURPRISE.length)];
	      break;
	    default:
	      color = WHITE;
	      break;
	  }
	
	  return color;
	}
	
	function shadeRGBColor(color, percent) {
	  var f = color.split(",");
	  var sliceCount = f[0].includes('rgba') === true ? 5 : 4;
	  var t = percent < 0 ? 0 : 255;
	  var p = percent < 0 ? percent * -1 : percent;
	  var R = parseInt(f[0].slice(sliceCount));
	  var G = parseInt(f[1]);
	  var B = parseInt(f[2]);
	  var returnVal = 'rgba(' + (Math.round((t - R) * p) + R) + ',' + (Math.round((t - G) * p) + G) + ', ' + (Math.round((t - B) * p) + B) + ', 1)';
	  if (sliceCount === 4) {
	    returnVal = 'rgb(' + (Math.round((t - R) * p) + R) + ',' + (Math.round((t - G) * p) + G) + ', ' + (Math.round((t - B) * p) + B) + ')';
	  }
	  return returnVal;
	}
	
	function getRandomColorWithAlpha() {
	  var keyVal = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var key = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	  var val = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	
	  var keyToUse = key ? key : Object.keys(keyVal)[0];
	  var valToUse = val ? val : keyVal[keyToUse];
	  if (typeof valToUse !== 'number') {
	    valToUse = CERTAINTY_ALPHAS[valToUse];
	  }
	
	  return subAlpha(chooseRandomColorFromEmotion(keyToUse), valToUse / 100);
	}
	
	function generateColorFromIndex() {
	  var index = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];
	  var emotions = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
	
	  if (emotions.length === 0 || index < 0) {
	    return TRANSPARENT;
	  }
	
	  var emotion = emotions[index];
	  return getRandomColorWithAlpha(null, emotion, 100);
	}
	
	function getEmotionForColor() {
	  var color = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	  if (!color) {
	    return null;
	  }
	
	  var newColor = subAlpha(color, 1);
	  if (ANGER.includes(newColor)) {
	    return 'ANGER';
	  } else if (JOY.includes(newColor)) {
	    return 'JOY';
	  } else if (SORROW.includes(newColor)) {
	    return 'SORROW';
	  } else if (SURPRISE.includes(newColor)) {
	    return 'SURPRISE';
	  }
	
	  return null;
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var CANVAS_WIDTH = exports.CANVAS_WIDTH = 1080;
	var CANVAS_HEIGHT = exports.CANVAS_HEIGHT = 640;
	
	var BACKEND_CANVAS_WIDTH = exports.BACKEND_CANVAS_WIDTH = CANVAS_WIDTH * 2 - 112;
	var BACKEND_CANVAS_HEIGHT = exports.BACKEND_CANVAS_HEIGHT = CANVAS_HEIGHT * 2;
	
	var LOGO_TOP = exports.LOGO_TOP = 40;
	var LOGO_LEFT = exports.LOGO_LEFT = 40;
	var LOGO_WIDTH = exports.LOGO_WIDTH = 110;
	var LOGO_HEIGHT = exports.LOGO_HEIGHT = 43;
	
	var EVENT_NAME_NEXT = exports.EVENT_NAME_NEXT = 'next';
	var EVENT_NAME_HORIZON = exports.EVENT_NAME_HORIZON = 'horizon';
	
	var TOTAL_CIRCLE_FRAMES = exports.TOTAL_CIRCLE_FRAMES = 75;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * VERSION: 1.18.2
	 * DATE: 2015-12-22
	 * UPDATES AND DOCS AT: http://greensock.com
	 * 
	 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
	 *
	 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
	 * This work is subject to the terms at http://greensock.com/standard-license or for
	 * Club GreenSock members, the software agreement that was issued with your membership.
	 * 
	 * @author: Jack Doyle, jack@greensock.com
	 **/
	var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TweenMax",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},e=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},f=function(a,b,d){c.call(this,a,b,d),this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._dirty=!0,this.render=f.prototype.render},g=1e-10,h=c._internals,i=h.isSelector,j=h.isArray,k=f.prototype=c.to({},.1,{}),l=[];f.version="1.18.2",k.constructor=f,k.kill()._gc=!1,f.killTweensOf=f.killDelayedCallsTo=c.killTweensOf,f.getTweensOf=c.getTweensOf,f.lagSmoothing=c.lagSmoothing,f.ticker=c.ticker,f.render=c.render,k.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),c.prototype.invalidate.call(this)},k.updateTo=function(a,b){var d,e=this.ratio,f=this.vars.immediateRender||a.immediateRender;b&&this._startTime<this._timeline._time&&(this._startTime=this._timeline._time,this._uncache(!1),this._gc?this._enabled(!0,!1):this._timeline.insert(this,this._startTime-this._delay));for(d in a)this.vars[d]=a[d];if(this._initted||f)if(b)this._initted=!1,f&&this.render(0,!0,!0);else if(this._gc&&this._enabled(!0,!1),this._notifyPluginsOfEnabled&&this._firstPT&&c._onPluginEvent("_onDisable",this),this._time/this._duration>.998){var g=this._totalTime;this.render(0,!0,!1),this._initted=!1,this.render(g,!0,!1)}else if(this._initted=!1,this._init(),this._time>0||f)for(var h,i=1/(1-e),j=this._firstPT;j;)h=j.s+j.c,j.c*=i,j.s=h-j.c,j=j._next;return this},k.render=function(a,b,c){this._initted||0===this._duration&&this.vars.repeat&&this.invalidate();var d,e,f,i,j,k,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._totalTime,q=this._cycle,r=this._duration,s=this._rawPrevTime;if(a>=n-1e-7?(this._totalTime=n,this._cycle=this._repeat,this._yoyo&&0!==(1&this._cycle)?(this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0):(this._time=r,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1),this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===r&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>s||0>=a&&a>=-1e-7||s===g&&"isPause"!==this.data)&&s!==a&&(c=!0,s>g&&(e="onReverseComplete")),this._rawPrevTime=m=!b||a||s===a?a:g)):1e-7>a?(this._totalTime=this._time=this._cycle=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==p||0===r&&s>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===r&&(this._initted||!this.vars.lazy||c)&&(s>=0&&(c=!0),this._rawPrevTime=m=!b||a||s===a?a:g)),this._initted||(c=!0)):(this._totalTime=this._time=a,0!==this._repeat&&(i=r+this._repeatDelay,this._cycle=this._totalTime/i>>0,0!==this._cycle&&this._cycle===this._totalTime/i&&this._cycle--,this._time=this._totalTime-this._cycle*i,this._yoyo&&0!==(1&this._cycle)&&(this._time=r-this._time),this._time>r?this._time=r:this._time<0&&(this._time=0)),this._easeType?(j=this._time/r,k=this._easeType,l=this._easePower,(1===k||3===k&&j>=.5)&&(j=1-j),3===k&&(j*=2),1===l?j*=j:2===l?j*=j*j:3===l?j*=j*j*j:4===l&&(j*=j*j*j*j),1===k?this.ratio=1-j:2===k?this.ratio=j:this._time/r<.5?this.ratio=j/2:this.ratio=1-j/2):this.ratio=this._ease.getRatio(this._time/r)),o===this._time&&!c&&q===this._cycle)return void(p!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=o,this._totalTime=p,this._rawPrevTime=s,this._cycle=q,h.lazyTweens.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/r):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&a>=0&&(this._active=!0),0===p&&(2===this._initted&&a>0&&this._init(),this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._totalTime||0===r)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&this._startTime&&this._startAt.render(a,b,c),b||(this._totalTime!==p||d)&&this._callback("onUpdate")),this._cycle!==q&&(b||this._gc||this.vars.onRepeat&&this._callback("onRepeat")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===r&&this._rawPrevTime===g&&m!==g&&(this._rawPrevTime=0))},f.to=function(a,b,c){return new f(a,b,c)},f.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new f(a,b,c)},f.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new f(a,b,d)},f.staggerTo=f.allTo=function(a,b,g,h,k,m,n){h=h||0;var o,p,q,r,s=0,t=[],u=function(){g.onComplete&&g.onComplete.apply(g.onCompleteScope||this,arguments),k.apply(n||g.callbackScope||this,m||l)},v=g.cycle,w=g.startAt&&g.startAt.cycle;for(j(a)||("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a))),a=a||[],0>h&&(a=d(a),a.reverse(),h*=-1),o=a.length-1,q=0;o>=q;q++){p={};for(r in g)p[r]=g[r];if(v&&e(p,a,q),w){w=p.startAt={};for(r in g.startAt)w[r]=g.startAt[r];e(p.startAt,a,q)}p.delay=s+(p.delay||0),q===o&&k&&(p.onComplete=u),t[q]=new f(a[q],b,p),s+=h}return t},f.staggerFrom=f.allFrom=function(a,b,c,d,e,g,h){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,f.staggerTo(a,b,c,d,e,g,h)},f.staggerFromTo=f.allFromTo=function(a,b,c,d,e,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,f.staggerTo(a,b,d,e,g,h,i)},f.delayedCall=function(a,b,c,d,e){return new f(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,useFrames:e,overwrite:0})},f.set=function(a,b){return new f(a,0,b)},f.isTweening=function(a){return c.getTweensOf(a,!0).length>0};var m=function(a,b){for(var d=[],e=0,f=a._first;f;)f instanceof c?d[e++]=f:(b&&(d[e++]=f),d=d.concat(m(f,b)),e=d.length),f=f._next;return d},n=f.getAllTweens=function(b){return m(a._rootTimeline,b).concat(m(a._rootFramesTimeline,b))};f.killAll=function(a,c,d,e){null==c&&(c=!0),null==d&&(d=!0);var f,g,h,i=n(0!=e),j=i.length,k=c&&d&&e;for(h=0;j>h;h++)g=i[h],(k||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&(a?g.totalTime(g._reversed?0:g.totalDuration()):g._enabled(!1,!1))},f.killChildTweensOf=function(a,b){if(null!=a){var e,g,k,l,m,n=h.tweenLookup;if("string"==typeof a&&(a=c.selector(a)||a),i(a)&&(a=d(a)),j(a))for(l=a.length;--l>-1;)f.killChildTweensOf(a[l],b);else{e=[];for(k in n)for(g=n[k].target.parentNode;g;)g===a&&(e=e.concat(n[k].tweens)),g=g.parentNode;for(m=e.length,l=0;m>l;l++)b&&e[l].totalTime(e[l].totalDuration()),e[l]._enabled(!1,!1)}}};var o=function(a,c,d,e){c=c!==!1,d=d!==!1,e=e!==!1;for(var f,g,h=n(e),i=c&&d&&e,j=h.length;--j>-1;)g=h[j],(i||g instanceof b||(f=g.target===g.vars.onComplete)&&d||c&&!f)&&g.paused(a)};return f.pauseAll=function(a,b,c){o(!0,a,b,c)},f.resumeAll=function(a,b,c){o(!1,a,b,c)},f.globalTimeScale=function(b){var d=a._rootTimeline,e=c.ticker.time;return arguments.length?(b=b||g,d._startTime=e-(e-d._startTime)*d._timeScale/b,d=a._rootFramesTimeline,e=c.ticker.frame,d._startTime=e-(e-d._startTime)*d._timeScale/b,d._timeScale=a._rootTimeline._timeScale=b,b):d._timeScale},k.progress=function(a){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),!1):this._time/this.duration()},k.totalProgress=function(a){return arguments.length?this.totalTime(this.totalDuration()*a,!1):this._totalTime/this.totalDuration()},k.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},k.duration=function(b){return arguments.length?a.prototype.duration.call(this,b):this._duration},k.totalDuration=function(a){return arguments.length?-1===this._repeat?this:this.duration((a-this._repeat*this._repeatDelay)/(this._repeat+1)):(this._dirty&&(this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat,this._dirty=!1),this._totalDuration)},k.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},k.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},k.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},f},!0),_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){b.call(this,a),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var c,d,e=this.vars;for(d in e)c=e[d],i(c)&&-1!==c.join("").indexOf("{self}")&&(e[d]=this._swapSelfInParams(c));i(e.tweens)&&this.add(e.tweens,0,e.align,e.stagger)},e=1e-10,f=c._internals,g=d._internals={},h=f.isSelector,i=f.isArray,j=f.lazyTweens,k=f.lazyRender,l=_gsScope._gsDefine.globals,m=function(a){var b,c={};for(b in a)c[b]=a[b];return c},n=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},o=g.pauseCallback=function(){},p=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},q=d.prototype=new b;return d.version="1.18.2",q.constructor=d,q.kill()._gc=q._forcingPlayhead=q._hasPause=!1,q.to=function(a,b,d,e){var f=d.repeat&&l.TweenMax||c;return b?this.add(new f(a,b,d),e):this.set(a,d,e)},q.from=function(a,b,d,e){return this.add((d.repeat&&l.TweenMax||c).from(a,b,d),e)},q.fromTo=function(a,b,d,e,f){var g=e.repeat&&l.TweenMax||c;return b?this.add(g.fromTo(a,b,d,e),f):this.set(a,e,f)},q.staggerTo=function(a,b,e,f,g,i,j,k){var l,o,q=new d({onComplete:i,onCompleteParams:j,callbackScope:k,smoothChildTiming:this.smoothChildTiming}),r=e.cycle;for("string"==typeof a&&(a=c.selector(a)||a),a=a||[],h(a)&&(a=p(a)),f=f||0,0>f&&(a=p(a),a.reverse(),f*=-1),o=0;o<a.length;o++)l=m(e),l.startAt&&(l.startAt=m(l.startAt),l.startAt.cycle&&n(l.startAt,a,o)),r&&n(l,a,o),q.to(a[o],b,l,o*f);return this.add(q,g)},q.staggerFrom=function(a,b,c,d,e,f,g,h){return c.immediateRender=0!=c.immediateRender,c.runBackwards=!0,this.staggerTo(a,b,c,d,e,f,g,h)},q.staggerFromTo=function(a,b,c,d,e,f,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,this.staggerTo(a,b,d,e,f,g,h,i)},q.call=function(a,b,d,e){return this.add(c.delayedCall(0,a,b,d),e)},q.set=function(a,b,d){return d=this._parseTimeOrLabel(d,0,!0),null==b.immediateRender&&(b.immediateRender=d===this._time&&!this._paused),this.add(new c(a,0,b),d)},d.exportRoot=function(a,b){a=a||{},null==a.smoothChildTiming&&(a.smoothChildTiming=!0);var e,f,g=new d(a),h=g._timeline;for(null==b&&(b=!0),h._remove(g,!0),g._startTime=0,g._rawPrevTime=g._time=g._totalTime=h._time,e=h._first;e;)f=e._next,b&&e instanceof c&&e.target===e.vars.onComplete||g.add(e,e._startTime-e._delay),e=f;return h.add(g,0),g},q.add=function(e,f,g,h){var j,k,l,m,n,o;if("number"!=typeof f&&(f=this._parseTimeOrLabel(f,0,!0,e)),!(e instanceof a)){if(e instanceof Array||e&&e.push&&i(e)){for(g=g||"normal",h=h||0,j=f,k=e.length,l=0;k>l;l++)i(m=e[l])&&(m=new d({tweens:m})),this.add(m,j),"string"!=typeof m&&"function"!=typeof m&&("sequence"===g?j=m._startTime+m.totalDuration()/m._timeScale:"start"===g&&(m._startTime-=m.delay())),j+=h;return this._uncache(!0)}if("string"==typeof e)return this.addLabel(e,f);if("function"!=typeof e)throw"Cannot add "+e+" into the timeline; it is not a tween, timeline, function, or string.";e=c.delayedCall(0,e)}if(b.prototype.add.call(this,e,f),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(n=this,o=n.rawTime()>e._startTime;n._timeline;)o&&n._timeline.smoothChildTiming?n.totalTime(n._totalTime,!0):n._gc&&n._enabled(!0,!1),n=n._timeline;return this},q.remove=function(b){if(b instanceof a){this._remove(b,!1);var c=b._timeline=b.vars.useFrames?a._rootFramesTimeline:a._rootTimeline;return b._startTime=(b._paused?b._pauseTime:c._time)-(b._reversed?b.totalDuration()-b._totalTime:b._totalTime)/b._timeScale,this}if(b instanceof Array||b&&b.push&&i(b)){for(var d=b.length;--d>-1;)this.remove(b[d]);return this}return"string"==typeof b?this.removeLabel(b):this.kill(null,b)},q._remove=function(a,c){b.prototype._remove.call(this,a,c);var d=this._last;return d?this._time>d._startTime+d._totalDuration/d._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},q.append=function(a,b){return this.add(a,this._parseTimeOrLabel(null,b,!0,a))},q.insert=q.insertMultiple=function(a,b,c,d){return this.add(a,b||0,c,d)},q.appendMultiple=function(a,b,c,d){return this.add(a,this._parseTimeOrLabel(null,b,!0,a),c,d)},q.addLabel=function(a,b){return this._labels[a]=this._parseTimeOrLabel(b),this},q.addPause=function(a,b,d,e){var f=c.delayedCall(0,o,d,e||this);return f.vars.onComplete=f.vars.onReverseComplete=b,f.data="isPause",this._hasPause=!0,this.add(f,a)},q.removeLabel=function(a){return delete this._labels[a],this},q.getLabelTime=function(a){return null!=this._labels[a]?this._labels[a]:-1},q._parseTimeOrLabel=function(b,c,d,e){var f;if(e instanceof a&&e.timeline===this)this.remove(e);else if(e&&(e instanceof Array||e.push&&i(e)))for(f=e.length;--f>-1;)e[f]instanceof a&&e[f].timeline===this&&this.remove(e[f]);if("string"==typeof c)return this._parseTimeOrLabel(c,d&&"number"==typeof b&&null==this._labels[c]?b-this.duration():0,d);if(c=c||0,"string"!=typeof b||!isNaN(b)&&null==this._labels[b])null==b&&(b=this.duration());else{if(f=b.indexOf("="),-1===f)return null==this._labels[b]?d?this._labels[b]=this.duration()+c:c:this._labels[b]+c;c=parseInt(b.charAt(f-1)+"1",10)*Number(b.substr(f+1)),b=f>1?this._parseTimeOrLabel(b.substr(0,f-1),0,d):this.duration()}return Number(b)+c},q.seek=function(a,b){return this.totalTime("number"==typeof a?a:this._parseTimeOrLabel(a),b!==!1)},q.stop=function(){return this.paused(!0)},q.gotoAndPlay=function(a,b){return this.play(a,b)},q.gotoAndStop=function(a,b){return this.pause(a,b)},q.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,g,h,i,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._startTime,q=this._timeScale,r=this._paused;if(a>=n-1e-7)this._totalTime=this._time=n,this._reversed||this._hasPausedChild()||(f=!0,h="onComplete",i=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||this._rawPrevTime<0||this._rawPrevTime===e)&&this._rawPrevTime!==a&&this._first&&(i=!0,this._rawPrevTime>e&&(h="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,a=n+1e-4;else if(1e-7>a)if(this._totalTime=this._time=0,(0!==o||0===this._duration&&this._rawPrevTime!==e&&(this._rawPrevTime>0||0>a&&this._rawPrevTime>=0))&&(h="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(i=f=!0,h="onReverseComplete"):this._rawPrevTime>=0&&this._first&&(i=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(i=!0)}else{if(this._hasPause&&!this._forcingPlayhead&&!b){if(a>=o)for(d=this._first;d&&d._startTime<=a&&!l;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(l=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!l;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(l=d),d=d._prev;l&&(this._time=a=l._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}this._totalTime=this._time=this._rawPrevTime=a}if(this._time!==o&&this._first||c||i||l){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==o&&a>0&&(this._active=!0),0===o&&this.vars.onStart&&0!==this._time&&(b||this._callback("onStart")),m=this._time,m>=o)for(d=this._first;d&&(g=d._next,m===this._time&&(!this._paused||r));)(d._active||d._startTime<=m&&!d._paused&&!d._gc)&&(l===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=g;else for(d=this._last;d&&(g=d._prev,m===this._time&&(!this._paused||r));){if(d._active||d._startTime<=o&&!d._paused&&!d._gc){if(l===d){for(l=d._prev;l&&l.endTime()>this._time;)l.render(l._reversed?l.totalDuration()-(a-l._startTime)*l._timeScale:(a-l._startTime)*l._timeScale,b,c),l=l._prev;l=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=g}this._onUpdate&&(b||(j.length&&k(),this._callback("onUpdate"))),h&&(this._gc||(p===this._startTime||q!==this._timeScale)&&(0===this._time||n>=this.totalDuration())&&(f&&(j.length&&k(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[h]&&this._callback(h)))}},q._hasPausedChild=function(){for(var a=this._first;a;){if(a._paused||a instanceof d&&a._hasPausedChild())return!0;a=a._next}return!1},q.getChildren=function(a,b,d,e){e=e||-9999999999;for(var f=[],g=this._first,h=0;g;)g._startTime<e||(g instanceof c?b!==!1&&(f[h++]=g):(d!==!1&&(f[h++]=g),a!==!1&&(f=f.concat(g.getChildren(!0,b,d)),h=f.length))),g=g._next;return f},q.getTweensOf=function(a,b){var d,e,f=this._gc,g=[],h=0;for(f&&this._enabled(!0,!0),d=c.getTweensOf(a),e=d.length;--e>-1;)(d[e].timeline===this||b&&this._contains(d[e]))&&(g[h++]=d[e]);return f&&this._enabled(!1,!0),g},q.recent=function(){return this._recent},q._contains=function(a){for(var b=a.timeline;b;){if(b===this)return!0;b=b.timeline}return!1},q.shiftChildren=function(a,b,c){c=c||0;for(var d,e=this._first,f=this._labels;e;)e._startTime>=c&&(e._startTime+=a),e=e._next;if(b)for(d in f)f[d]>=c&&(f[d]+=a);return this._uncache(!0)},q._kill=function(a,b){if(!a&&!b)return this._enabled(!1,!1);for(var c=b?this.getTweensOf(b):this.getChildren(!0,!0,!1),d=c.length,e=!1;--d>-1;)c[d]._kill(a,b)&&(e=!0);return e},q.clear=function(a){var b=this.getChildren(!1,!0,!0),c=b.length;for(this._time=this._totalTime=0;--c>-1;)b[c]._enabled(!1,!1);return a!==!1&&(this._labels={}),this._uncache(!0)},q.invalidate=function(){for(var b=this._first;b;)b.invalidate(),b=b._next;return a.prototype.invalidate.call(this)},q._enabled=function(a,c){if(a===this._gc)for(var d=this._first;d;)d._enabled(a,!0),d=d._next;return b.prototype._enabled.call(this,a,c)},q.totalTime=function(b,c,d){this._forcingPlayhead=!0;var e=a.prototype.totalTime.apply(this,arguments);return this._forcingPlayhead=!1,e},q.duration=function(a){return arguments.length?(0!==this.duration()&&0!==a&&this.timeScale(this._duration/a),this):(this._dirty&&this.totalDuration(),this._duration)},q.totalDuration=function(a){if(!arguments.length){if(this._dirty){for(var b,c,d=0,e=this._last,f=999999999999;e;)b=e._prev,e._dirty&&e.totalDuration(),e._startTime>f&&this._sortChildren&&!e._paused?this.add(e,e._startTime-e._delay):f=e._startTime,e._startTime<0&&!e._paused&&(d-=e._startTime,this._timeline.smoothChildTiming&&(this._startTime+=e._startTime/this._timeScale),this.shiftChildren(-e._startTime,!1,-9999999999),f=0),c=e._startTime+e._totalDuration/e._timeScale,c>d&&(d=c),e=b;this._duration=this._totalDuration=d,this._dirty=!1}return this._totalDuration}return a&&this.totalDuration()?this.timeScale(this._totalDuration/a):this},q.paused=function(b){if(!b)for(var c=this._first,d=this._time;c;)c._startTime===d&&"isPause"===c.data&&(c._rawPrevTime=0),c=c._next;return a.prototype.paused.apply(this,arguments)},q.usesFrames=function(){for(var b=this._timeline;b._timeline;)b=b._timeline;return b===a._rootFramesTimeline},q.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},d},!0),_gsScope._gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(a,b,c){var d=function(b){a.call(this,b),this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._dirty=!0},e=1e-10,f=b._internals,g=f.lazyTweens,h=f.lazyRender,i=new c(null,null,1,0),j=d.prototype=new a;return j.constructor=d,j.kill()._gc=!1,d.version="1.18.2",j.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),a.prototype.invalidate.call(this)},j.addCallback=function(a,c,d,e){return this.add(b.delayedCall(0,a,d,e),c)},j.removeCallback=function(a,b){if(a)if(null==b)this._kill(null,a);else for(var c=this.getTweensOf(a,!1),d=c.length,e=this._parseTimeOrLabel(b);--d>-1;)c[d]._startTime===e&&c[d]._enabled(!1,!1);return this},j.removePause=function(b){return this.removeCallback(a._internals.pauseCallback,b)},j.tweenTo=function(a,c){c=c||{};var d,e,f,g={ease:i,useFrames:this.usesFrames(),immediateRender:!1};for(e in c)g[e]=c[e];return g.time=this._parseTimeOrLabel(a),d=Math.abs(Number(g.time)-this._time)/this._timeScale||.001,f=new b(this,d,g),g.onStart=function(){f.target.paused(!0),f.vars.time!==f.target.time()&&d===f.duration()&&f.duration(Math.abs(f.vars.time-f.target.time())/f.target._timeScale),c.onStart&&f._callback("onStart")},f},j.tweenFromTo=function(a,b,c){c=c||{},a=this._parseTimeOrLabel(a),c.startAt={onComplete:this.seek,onCompleteParams:[a],callbackScope:this},c.immediateRender=c.immediateRender!==!1;var d=this.tweenTo(b,c);return d.duration(Math.abs(d.vars.time-a)/this._timeScale||.001)},j.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,i,j,k,l,m,n,o=this._dirty?this.totalDuration():this._totalDuration,p=this._duration,q=this._time,r=this._totalTime,s=this._startTime,t=this._timeScale,u=this._rawPrevTime,v=this._paused,w=this._cycle;if(a>=o-1e-7)this._locked||(this._totalTime=o,this._cycle=this._repeat),this._reversed||this._hasPausedChild()||(f=!0,j="onComplete",k=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||0>u||u===e)&&u!==a&&this._first&&(k=!0,u>e&&(j="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,this._yoyo&&0!==(1&this._cycle)?this._time=a=0:(this._time=p,a=p+1e-4);else if(1e-7>a)if(this._locked||(this._totalTime=this._cycle=0),this._time=0,(0!==q||0===p&&u!==e&&(u>0||0>a&&u>=0)&&!this._locked)&&(j="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(k=f=!0,j="onReverseComplete"):u>=0&&this._first&&(k=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=p||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(k=!0)}else if(0===p&&0>u&&(k=!0),this._time=this._rawPrevTime=a,this._locked||(this._totalTime=a,0!==this._repeat&&(l=p+this._repeatDelay,this._cycle=this._totalTime/l>>0,0!==this._cycle&&this._cycle===this._totalTime/l&&this._cycle--,this._time=this._totalTime-this._cycle*l,this._yoyo&&0!==(1&this._cycle)&&(this._time=p-this._time),this._time>p?(this._time=p,a=p+1e-4):this._time<0?this._time=a=0:a=this._time)),this._hasPause&&!this._forcingPlayhead&&!b){if(a=this._time,a>=q)for(d=this._first;d&&d._startTime<=a&&!m;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(m=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!m;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(m=d),d=d._prev;m&&(this._time=a=m._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}if(this._cycle!==w&&!this._locked){var x=this._yoyo&&0!==(1&w),y=x===(this._yoyo&&0!==(1&this._cycle)),z=this._totalTime,A=this._cycle,B=this._rawPrevTime,C=this._time;if(this._totalTime=w*p,this._cycle<w?x=!x:this._totalTime+=p,this._time=q,this._rawPrevTime=0===p?u-1e-4:u,this._cycle=w,this._locked=!0,q=x?0:p,this.render(q,b,0===p),b||this._gc||this.vars.onRepeat&&this._callback("onRepeat"),q!==this._time)return;if(y&&(q=x?p+1e-4:-1e-4,this.render(q,!0,!1)),this._locked=!1,this._paused&&!v)return;this._time=C,this._totalTime=z,this._cycle=A,this._rawPrevTime=B}if(!(this._time!==q&&this._first||c||k||m))return void(r!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(this._initted||(this._initted=!0),this._active||!this._paused&&this._totalTime!==r&&a>0&&(this._active=!0),0===r&&this.vars.onStart&&0!==this._totalTime&&(b||this._callback("onStart")),n=this._time,n>=q)for(d=this._first;d&&(i=d._next,n===this._time&&(!this._paused||v));)(d._active||d._startTime<=this._time&&!d._paused&&!d._gc)&&(m===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=i;else for(d=this._last;d&&(i=d._prev,n===this._time&&(!this._paused||v));){if(d._active||d._startTime<=q&&!d._paused&&!d._gc){if(m===d){for(m=d._prev;m&&m.endTime()>this._time;)m.render(m._reversed?m.totalDuration()-(a-m._startTime)*m._timeScale:(a-m._startTime)*m._timeScale,b,c),m=m._prev;m=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=i}this._onUpdate&&(b||(g.length&&h(),this._callback("onUpdate"))),j&&(this._locked||this._gc||(s===this._startTime||t!==this._timeScale)&&(0===this._time||o>=this.totalDuration())&&(f&&(g.length&&h(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[j]&&this._callback(j)))},j.getActive=function(a,b,c){null==a&&(a=!0),null==b&&(b=!0),null==c&&(c=!1);var d,e,f=[],g=this.getChildren(a,b,c),h=0,i=g.length;for(d=0;i>d;d++)e=g[d],e.isActive()&&(f[h++]=e);return f},j.getLabelAfter=function(a){a||0!==a&&(a=this._time);var b,c=this.getLabelsArray(),d=c.length;for(b=0;d>b;b++)if(c[b].time>a)return c[b].name;return null},j.getLabelBefore=function(a){null==a&&(a=this._time);for(var b=this.getLabelsArray(),c=b.length;--c>-1;)if(b[c].time<a)return b[c].name;return null},j.getLabelsArray=function(){var a,b=[],c=0;for(a in this._labels)b[c++]={time:this._labels[a],name:a};return b.sort(function(a,b){return a.time-b.time}),b},j.progress=function(a,b){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),b):this._time/this.duration()},j.totalProgress=function(a,b){return arguments.length?this.totalTime(this.totalDuration()*a,b):this._totalTime/this.totalDuration()},j.totalDuration=function(b){return arguments.length?-1!==this._repeat&&b?this.timeScale(this.totalDuration()/b):this:(this._dirty&&(a.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration)},j.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},j.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},j.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},j.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},j.currentLabel=function(a){return arguments.length?this.seek(a,!0):this.getLabelBefore(this._time+1e-8)},d},!0),function(){var a=180/Math.PI,b=[],c=[],d=[],e={},f=_gsScope._gsDefine.globals,g=function(a,b,c,d){this.a=a,this.b=b,this.c=c,this.d=d,this.da=d-a,this.ca=c-a,this.ba=b-a},h=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",i=function(a,b,c,d){var e={a:a},f={},g={},h={c:d},i=(a+b)/2,j=(b+c)/2,k=(c+d)/2,l=(i+j)/2,m=(j+k)/2,n=(m-l)/8;return e.b=i+(a-i)/4,f.b=l+n,e.c=f.a=(e.b+f.b)/2,f.c=g.a=(l+m)/2,g.b=m-n,h.b=k+(d-k)/4,g.c=h.a=(g.b+h.b)/2,[e,f,g,h]},j=function(a,e,f,g,h){var j,k,l,m,n,o,p,q,r,s,t,u,v,w=a.length-1,x=0,y=a[0].a;for(j=0;w>j;j++)n=a[x],k=n.a,l=n.d,m=a[x+1].d,h?(t=b[j],u=c[j],v=(u+t)*e*.25/(g?.5:d[j]||.5),o=l-(l-k)*(g?.5*e:0!==t?v/t:0),p=l+(m-l)*(g?.5*e:0!==u?v/u:0),q=l-(o+((p-o)*(3*t/(t+u)+.5)/4||0))):(o=l-(l-k)*e*.5,p=l+(m-l)*e*.5,q=l-(o+p)/2),o+=q,p+=q,n.c=r=o,0!==j?n.b=y:n.b=y=n.a+.6*(n.c-n.a),n.da=l-k,n.ca=r-k,n.ba=y-k,f?(s=i(k,y,r,l),a.splice(x,1,s[0],s[1],s[2],s[3]),x+=4):x++,y=p;n=a[x],n.b=y,n.c=y+.4*(n.d-y),n.da=n.d-n.a,n.ca=n.c-n.a,n.ba=y-n.a,f&&(s=i(n.a,y,n.c,n.d),a.splice(x,1,s[0],s[1],s[2],s[3]))},k=function(a,d,e,f){var h,i,j,k,l,m,n=[];if(f)for(a=[f].concat(a),i=a.length;--i>-1;)"string"==typeof(m=a[i][d])&&"="===m.charAt(1)&&(a[i][d]=f[d]+Number(m.charAt(0)+m.substr(2)));if(h=a.length-2,0>h)return n[0]=new g(a[0][d],0,0,a[-1>h?0:1][d]),n;for(i=0;h>i;i++)j=a[i][d],k=a[i+1][d],n[i]=new g(j,0,0,k),e&&(l=a[i+2][d],b[i]=(b[i]||0)+(k-j)*(k-j),c[i]=(c[i]||0)+(l-k)*(l-k));return n[i]=new g(a[i][d],0,0,a[i+1][d]),n},l=function(a,f,g,i,l,m){var n,o,p,q,r,s,t,u,v={},w=[],x=m||a[0];l="string"==typeof l?","+l+",":h,null==f&&(f=1);for(o in a[0])w.push(o);if(a.length>1){for(u=a[a.length-1],t=!0,n=w.length;--n>-1;)if(o=w[n],Math.abs(x[o]-u[o])>.05){t=!1;break}t&&(a=a.concat(),m&&a.unshift(m),a.push(a[1]),m=a[a.length-3])}for(b.length=c.length=d.length=0,n=w.length;--n>-1;)o=w[n],e[o]=-1!==l.indexOf(","+o+","),v[o]=k(a,o,e[o],m);for(n=b.length;--n>-1;)b[n]=Math.sqrt(b[n]),c[n]=Math.sqrt(c[n]);if(!i){for(n=w.length;--n>-1;)if(e[o])for(p=v[w[n]],s=p.length-1,q=0;s>q;q++)r=p[q+1].da/c[q]+p[q].da/b[q],d[q]=(d[q]||0)+r*r;for(n=d.length;--n>-1;)d[n]=Math.sqrt(d[n])}for(n=w.length,q=g?4:1;--n>-1;)o=w[n],p=v[o],j(p,f,g,i,e[o]),t&&(p.splice(0,q),p.splice(p.length-q,q));return v},m=function(a,b,c){b=b||"soft";var d,e,f,h,i,j,k,l,m,n,o,p={},q="cubic"===b?3:2,r="soft"===b,s=[];if(r&&c&&(a=[c].concat(a)),null==a||a.length<q+1)throw"invalid Bezier data";for(m in a[0])s.push(m);for(j=s.length;--j>-1;){for(m=s[j],p[m]=i=[],n=0,l=a.length,k=0;l>k;k++)d=null==c?a[k][m]:"string"==typeof(o=a[k][m])&&"="===o.charAt(1)?c[m]+Number(o.charAt(0)+o.substr(2)):Number(o),r&&k>1&&l-1>k&&(i[n++]=(d+i[n-2])/2),i[n++]=d;for(l=n-q+1,n=0,k=0;l>k;k+=q)d=i[k],e=i[k+1],f=i[k+2],h=2===q?0:i[k+3],i[n++]=o=3===q?new g(d,e,f,h):new g(d,(2*e+d)/3,(2*e+f)/3,f);i.length=n}return p},n=function(a,b,c){for(var d,e,f,g,h,i,j,k,l,m,n,o=1/c,p=a.length;--p>-1;)for(m=a[p],f=m.a,g=m.d-f,h=m.c-f,i=m.b-f,d=e=0,k=1;c>=k;k++)j=o*k,l=1-j,d=e-(e=(j*j*g+3*l*(j*h+l*i))*j),n=p*c+k-1,b[n]=(b[n]||0)+d*d},o=function(a,b){b=b>>0||6;var c,d,e,f,g=[],h=[],i=0,j=0,k=b-1,l=[],m=[];for(c in a)n(a[c],g,b);for(e=g.length,d=0;e>d;d++)i+=Math.sqrt(g[d]),f=d%b,m[f]=i,f===k&&(j+=i,f=d/b>>0,l[f]=m,h[f]=j,i=0,m=[]);return{length:j,lengths:h,segments:l}},p=_gsScope._gsDefine.plugin({propName:"bezier",priority:-1,version:"1.3.4",API:2,global:!0,init:function(a,b,c){this._target=a,b instanceof Array&&(b={values:b}),this._func={},this._round={},this._props=[],this._timeRes=null==b.timeResolution?6:parseInt(b.timeResolution,10);
	var d,e,f,g,h,i=b.values||[],j={},k=i[0],n=b.autoRotate||c.vars.orientToBezier;this._autoRotate=n?n instanceof Array?n:[["x","y","rotation",n===!0?0:Number(n)||0]]:null;for(d in k)this._props.push(d);for(f=this._props.length;--f>-1;)d=this._props[f],this._overwriteProps.push(d),e=this._func[d]="function"==typeof a[d],j[d]=e?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]():parseFloat(a[d]),h||j[d]!==i[0][d]&&(h=j);if(this._beziers="cubic"!==b.type&&"quadratic"!==b.type&&"soft"!==b.type?l(i,isNaN(b.curviness)?1:b.curviness,!1,"thruBasic"===b.type,b.correlate,h):m(i,b.type,j),this._segCount=this._beziers[d].length,this._timeRes){var p=o(this._beziers,this._timeRes);this._length=p.length,this._lengths=p.lengths,this._segments=p.segments,this._l1=this._li=this._s1=this._si=0,this._l2=this._lengths[0],this._curSeg=this._segments[0],this._s2=this._curSeg[0],this._prec=1/this._curSeg.length}if(n=this._autoRotate)for(this._initialRotations=[],n[0]instanceof Array||(this._autoRotate=n=[n]),f=n.length;--f>-1;){for(g=0;3>g;g++)d=n[f][g],this._func[d]="function"==typeof a[d]?a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]:!1;d=n[f][2],this._initialRotations[f]=this._func[d]?this._func[d].call(this._target):this._target[d]}return this._startRatio=c.vars.runBackwards?1:0,!0},set:function(b){var c,d,e,f,g,h,i,j,k,l,m=this._segCount,n=this._func,o=this._target,p=b!==this._startRatio;if(this._timeRes){if(k=this._lengths,l=this._curSeg,b*=this._length,e=this._li,b>this._l2&&m-1>e){for(j=m-1;j>e&&(this._l2=k[++e])<=b;);this._l1=k[e-1],this._li=e,this._curSeg=l=this._segments[e],this._s2=l[this._s1=this._si=0]}else if(b<this._l1&&e>0){for(;e>0&&(this._l1=k[--e])>=b;);0===e&&b<this._l1?this._l1=0:e++,this._l2=k[e],this._li=e,this._curSeg=l=this._segments[e],this._s1=l[(this._si=l.length-1)-1]||0,this._s2=l[this._si]}if(c=e,b-=this._l1,e=this._si,b>this._s2&&e<l.length-1){for(j=l.length-1;j>e&&(this._s2=l[++e])<=b;);this._s1=l[e-1],this._si=e}else if(b<this._s1&&e>0){for(;e>0&&(this._s1=l[--e])>=b;);0===e&&b<this._s1?this._s1=0:e++,this._s2=l[e],this._si=e}h=(e+(b-this._s1)/(this._s2-this._s1))*this._prec}else c=0>b?0:b>=1?m-1:m*b>>0,h=(b-c*(1/m))*m;for(d=1-h,e=this._props.length;--e>-1;)f=this._props[e],g=this._beziers[f][c],i=(h*h*g.da+3*d*(h*g.ca+d*g.ba))*h+g.a,this._round[f]&&(i=Math.round(i)),n[f]?o[f](i):o[f]=i;if(this._autoRotate){var q,r,s,t,u,v,w,x=this._autoRotate;for(e=x.length;--e>-1;)f=x[e][2],v=x[e][3]||0,w=x[e][4]===!0?1:a,g=this._beziers[x[e][0]],q=this._beziers[x[e][1]],g&&q&&(g=g[c],q=q[c],r=g.a+(g.b-g.a)*h,t=g.b+(g.c-g.b)*h,r+=(t-r)*h,t+=(g.c+(g.d-g.c)*h-t)*h,s=q.a+(q.b-q.a)*h,u=q.b+(q.c-q.b)*h,s+=(u-s)*h,u+=(q.c+(q.d-q.c)*h-u)*h,i=p?Math.atan2(u-s,t-r)*w+v:this._initialRotations[e],n[f]?o[f](i):o[f]=i)}}}),q=p.prototype;p.bezierThrough=l,p.cubicToQuadratic=i,p._autoCSS=!0,p.quadraticToCubic=function(a,b,c){return new g(a,(2*b+a)/3,(2*b+c)/3,c)},p._cssRegister=function(){var a=f.CSSPlugin;if(a){var b=a._internals,c=b._parseToProxy,d=b._setPluginRatio,e=b.CSSPropTween;b._registerComplexSpecialProp("bezier",{parser:function(a,b,f,g,h,i){b instanceof Array&&(b={values:b}),i=new p;var j,k,l,m=b.values,n=m.length-1,o=[],q={};if(0>n)return h;for(j=0;n>=j;j++)l=c(a,m[j],g,h,i,n!==j),o[j]=l.end;for(k in b)q[k]=b[k];return q.values=o,h=new e(a,"bezier",0,0,l.pt,2),h.data=l,h.plugin=i,h.setRatio=d,0===q.autoRotate&&(q.autoRotate=!0),!q.autoRotate||q.autoRotate instanceof Array||(j=q.autoRotate===!0?0:Number(q.autoRotate),q.autoRotate=null!=l.end.left?[["left","top","rotation",j,!1]]:null!=l.end.x?[["x","y","rotation",j,!1]]:!1),q.autoRotate&&(g._transform||g._enableTransforms(!1),l.autoRotate=g._target._gsTransform),i._onInitTween(l.proxy,q,g._tween),h}})}},q._roundProps=function(a,b){for(var c=this._overwriteProps,d=c.length;--d>-1;)(a[c[d]]||a.bezier||a.bezierThrough)&&(this._round[c[d]]=b)},q._kill=function(a){var b,c,d=this._props;for(b in this._beziers)if(b in a)for(delete this._beziers[b],delete this._func[b],c=d.length;--c>-1;)d[c]===b&&d.splice(c,1);return this._super._kill.call(this,a)}}(),_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(a,b){var c,d,e,f,g=function(){a.call(this,"css"),this._overwriteProps.length=0,this.setRatio=g.prototype.setRatio},h=_gsScope._gsDefine.globals,i={},j=g.prototype=new a("css");j.constructor=g,g.version="1.18.2",g.API=2,g.defaultTransformPerspective=0,g.defaultSkewType="compensated",g.defaultSmoothOrigin=!0,j="px",g.suffixMap={top:j,right:j,bottom:j,left:j,width:j,height:j,fontSize:j,padding:j,margin:j,perspective:j,lineHeight:""};var k,l,m,n,o,p,q=/(?:\d|\-\d|\.\d|\-\.\d)+/g,r=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,s=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,t=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,u=/(?:\d|\-|\+|=|#|\.)*/g,v=/opacity *= *([^)]*)/i,w=/opacity:([^;]*)/i,x=/alpha\(opacity *=.+?\)/i,y=/^(rgb|hsl)/,z=/([A-Z])/g,A=/-([a-z])/gi,B=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,C=function(a,b){return b.toUpperCase()},D=/(?:Left|Right|Width)/i,E=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,F=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,G=/,(?=[^\)]*(?:\(|$))/gi,H=Math.PI/180,I=180/Math.PI,J={},K=document,L=function(a){return K.createElementNS?K.createElementNS("http://www.w3.org/1999/xhtml",a):K.createElement(a)},M=L("div"),N=L("img"),O=g._internals={_specialProps:i},P=navigator.userAgent,Q=function(){var a=P.indexOf("Android"),b=L("a");return m=-1!==P.indexOf("Safari")&&-1===P.indexOf("Chrome")&&(-1===a||Number(P.substr(a+8,1))>3),o=m&&Number(P.substr(P.indexOf("Version/")+8,1))<6,n=-1!==P.indexOf("Firefox"),(/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(P)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(P))&&(p=parseFloat(RegExp.$1)),b?(b.style.cssText="top:1px;opacity:.55;",/^0.55/.test(b.style.opacity)):!1}(),R=function(a){return v.test("string"==typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100:1},S=function(a){window.console&&console.log(a)},T="",U="",V=function(a,b){b=b||M;var c,d,e=b.style;if(void 0!==e[a])return a;for(a=a.charAt(0).toUpperCase()+a.substr(1),c=["O","Moz","ms","Ms","Webkit"],d=5;--d>-1&&void 0===e[c[d]+a];);return d>=0?(U=3===d?"ms":c[d],T="-"+U.toLowerCase()+"-",U+a):null},W=K.defaultView?K.defaultView.getComputedStyle:function(){},X=g.getStyle=function(a,b,c,d,e){var f;return Q||"opacity"!==b?(!d&&a.style[b]?f=a.style[b]:(c=c||W(a))?f=c[b]||c.getPropertyValue(b)||c.getPropertyValue(b.replace(z,"-$1").toLowerCase()):a.currentStyle&&(f=a.currentStyle[b]),null==e||f&&"none"!==f&&"auto"!==f&&"auto auto"!==f?f:e):R(a)},Y=O.convertToPixels=function(a,c,d,e,f){if("px"===e||!e)return d;if("auto"===e||!d)return 0;var h,i,j,k=D.test(c),l=a,m=M.style,n=0>d;if(n&&(d=-d),"%"===e&&-1!==c.indexOf("border"))h=d/100*(k?a.clientWidth:a.clientHeight);else{if(m.cssText="border:0 solid red;position:"+X(a,"position")+";line-height:0;","%"!==e&&l.appendChild&&"v"!==e.charAt(0)&&"rem"!==e)m[k?"borderLeftWidth":"borderTopWidth"]=d+e;else{if(l=a.parentNode||K.body,i=l._gsCache,j=b.ticker.frame,i&&k&&i.time===j)return i.width*d/100;m[k?"width":"height"]=d+e}l.appendChild(M),h=parseFloat(M[k?"offsetWidth":"offsetHeight"]),l.removeChild(M),k&&"%"===e&&g.cacheWidths!==!1&&(i=l._gsCache=l._gsCache||{},i.time=j,i.width=h/d*100),0!==h||f||(h=Y(a,c,d,e,!0))}return n?-h:h},Z=O.calculateOffset=function(a,b,c){if("absolute"!==X(a,"position",c))return 0;var d="left"===b?"Left":"Top",e=X(a,"margin"+d,c);return a["offset"+d]-(Y(a,b,parseFloat(e),e.replace(u,""))||0)},$=function(a,b){var c,d,e,f={};if(b=b||W(a,null))if(c=b.length)for(;--c>-1;)e=b[c],(-1===e.indexOf("-transform")||za===e)&&(f[e.replace(A,C)]=b.getPropertyValue(e));else for(c in b)(-1===c.indexOf("Transform")||ya===c)&&(f[c]=b[c]);else if(b=a.currentStyle||a.style)for(c in b)"string"==typeof c&&void 0===f[c]&&(f[c.replace(A,C)]=b[c]);return Q||(f.opacity=R(a)),d=La(a,b,!1),f.rotation=d.rotation,f.skewX=d.skewX,f.scaleX=d.scaleX,f.scaleY=d.scaleY,f.x=d.x,f.y=d.y,Ba&&(f.z=d.z,f.rotationX=d.rotationX,f.rotationY=d.rotationY,f.scaleZ=d.scaleZ),f.filters&&delete f.filters,f},_=function(a,b,c,d,e){var f,g,h,i={},j=a.style;for(g in c)"cssText"!==g&&"length"!==g&&isNaN(g)&&(b[g]!==(f=c[g])||e&&e[g])&&-1===g.indexOf("Origin")&&("number"==typeof f||"string"==typeof f)&&(i[g]="auto"!==f||"left"!==g&&"top"!==g?""!==f&&"auto"!==f&&"none"!==f||"string"!=typeof b[g]||""===b[g].replace(t,"")?f:0:Z(a,g),void 0!==j[g]&&(h=new oa(j,g,j[g],h)));if(d)for(g in d)"className"!==g&&(i[g]=d[g]);return{difs:i,firstMPT:h}},aa={width:["Left","Right"],height:["Top","Bottom"]},ba=["marginLeft","marginRight","marginTop","marginBottom"],ca=function(a,b,c){var d=parseFloat("width"===b?a.offsetWidth:a.offsetHeight),e=aa[b],f=e.length;for(c=c||W(a,null);--f>-1;)d-=parseFloat(X(a,"padding"+e[f],c,!0))||0,d-=parseFloat(X(a,"border"+e[f]+"Width",c,!0))||0;return d},da=function(a,b){if("contain"===a||"auto"===a||"auto auto"===a)return a+" ";(null==a||""===a)&&(a="0 0");var c=a.split(" "),d=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":c[0],e=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":c[1];return null==e?e="center"===d?"50%":"0":"center"===e&&(e="50%"),("center"===d||isNaN(parseFloat(d))&&-1===(d+"").indexOf("="))&&(d="50%"),a=d+" "+e+(c.length>2?" "+c[2]:""),b&&(b.oxp=-1!==d.indexOf("%"),b.oyp=-1!==e.indexOf("%"),b.oxr="="===d.charAt(1),b.oyr="="===e.charAt(1),b.ox=parseFloat(d.replace(t,"")),b.oy=parseFloat(e.replace(t,"")),b.v=a),b||a},ea=function(a,b){return"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(b)},fa=function(a,b){return null==a?b:"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2))+b:parseFloat(a)},ga=function(a,b,c,d){var e,f,g,h,i,j=1e-6;return null==a?h=b:"number"==typeof a?h=a:(e=360,f=a.split("_"),i="="===a.charAt(1),g=(i?parseInt(a.charAt(0)+"1",10)*parseFloat(f[0].substr(2)):parseFloat(f[0]))*(-1===a.indexOf("rad")?1:I)-(i?0:b),f.length&&(d&&(d[c]=b+g),-1!==a.indexOf("short")&&(g%=e,g!==g%(e/2)&&(g=0>g?g+e:g-e)),-1!==a.indexOf("_cw")&&0>g?g=(g+9999999999*e)%e-(g/e|0)*e:-1!==a.indexOf("ccw")&&g>0&&(g=(g-9999999999*e)%e-(g/e|0)*e)),h=b+g),j>h&&h>-j&&(h=0),h},ha={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ia=function(a,b,c){return a=0>a?a+1:a>1?a-1:a,255*(1>6*a?b+(c-b)*a*6:.5>a?c:2>3*a?b+(c-b)*(2/3-a)*6:b)+.5|0},ja=g.parseColor=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;if(a)if("number"==typeof a)c=[a>>16,a>>8&255,255&a];else{if(","===a.charAt(a.length-1)&&(a=a.substr(0,a.length-1)),ha[a])c=ha[a];else if("#"===a.charAt(0))4===a.length&&(d=a.charAt(1),e=a.charAt(2),f=a.charAt(3),a="#"+d+d+e+e+f+f),a=parseInt(a.substr(1),16),c=[a>>16,a>>8&255,255&a];else if("hsl"===a.substr(0,3))if(c=m=a.match(q),b){if(-1!==a.indexOf("="))return a.match(r)}else g=Number(c[0])%360/360,h=Number(c[1])/100,i=Number(c[2])/100,e=.5>=i?i*(h+1):i+h-i*h,d=2*i-e,c.length>3&&(c[3]=Number(a[3])),c[0]=ia(g+1/3,d,e),c[1]=ia(g,d,e),c[2]=ia(g-1/3,d,e);else c=a.match(q)||ha.transparent;c[0]=Number(c[0]),c[1]=Number(c[1]),c[2]=Number(c[2]),c.length>3&&(c[3]=Number(c[3]))}else c=ha.black;return b&&!m&&(d=c[0]/255,e=c[1]/255,f=c[2]/255,j=Math.max(d,e,f),k=Math.min(d,e,f),i=(j+k)/2,j===k?g=h=0:(l=j-k,h=i>.5?l/(2-j-k):l/(j+k),g=j===d?(e-f)/l+(f>e?6:0):j===e?(f-d)/l+2:(d-e)/l+4,g*=60),c[0]=g+.5|0,c[1]=100*h+.5|0,c[2]=100*i+.5|0),c},ka=function(a,b){var c,d,e,f=a.match(la)||[],g=0,h=f.length?"":a;for(c=0;c<f.length;c++)d=f[c],e=a.substr(g,a.indexOf(d,g)-g),g+=e.length+d.length,d=ja(d,b),3===d.length&&d.push(1),h+=e+(b?"hsla("+d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:"rgba("+d.join(","))+")";return h},la="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";for(j in ha)la+="|"+j+"\\b";la=new RegExp(la+")","gi"),g.colorStringFilter=function(a){var b,c=a[0]+a[1];la.lastIndex=0,la.test(c)&&(b=-1!==c.indexOf("hsl(")||-1!==c.indexOf("hsla("),a[0]=ka(a[0],b),a[1]=ka(a[1],b))},b.defaultStringFilter||(b.defaultStringFilter=g.colorStringFilter);var ma=function(a,b,c,d){if(null==a)return function(a){return a};var e,f=b?(a.match(la)||[""])[0]:"",g=a.split(f).join("").match(s)||[],h=a.substr(0,a.indexOf(g[0])),i=")"===a.charAt(a.length-1)?")":"",j=-1!==a.indexOf(" ")?" ":",",k=g.length,l=k>0?g[0].replace(q,""):"";return k?e=b?function(a){var b,m,n,o;if("number"==typeof a)a+=l;else if(d&&G.test(a)){for(o=a.replace(G,"|").split("|"),n=0;n<o.length;n++)o[n]=e(o[n]);return o.join(",")}if(b=(a.match(la)||[f])[0],m=a.split(b).join("").match(s)||[],n=m.length,k>n--)for(;++n<k;)m[n]=c?m[(n-1)/2|0]:g[n];return h+m.join(j)+j+b+i+(-1!==a.indexOf("inset")?" inset":"")}:function(a){var b,f,m;if("number"==typeof a)a+=l;else if(d&&G.test(a)){for(f=a.replace(G,"|").split("|"),m=0;m<f.length;m++)f[m]=e(f[m]);return f.join(",")}if(b=a.match(s)||[],m=b.length,k>m--)for(;++m<k;)b[m]=c?b[(m-1)/2|0]:g[m];return h+b.join(j)+i}:function(a){return a}},na=function(a){return a=a.split(","),function(b,c,d,e,f,g,h){var i,j=(c+"").split(" ");for(h={},i=0;4>i;i++)h[a[i]]=j[i]=j[i]||j[(i-1)/2>>0];return e.parse(b,h,f,g)}},oa=(O._setPluginRatio=function(a){this.plugin.setRatio(a);for(var b,c,d,e,f,g=this.data,h=g.proxy,i=g.firstMPT,j=1e-6;i;)b=h[i.v],i.r?b=Math.round(b):j>b&&b>-j&&(b=0),i.t[i.p]=b,i=i._next;if(g.autoRotate&&(g.autoRotate.rotation=h.rotation),1===a||0===a)for(i=g.firstMPT,f=1===a?"e":"b";i;){if(c=i.t,c.type){if(1===c.type){for(e=c.xs0+c.s+c.xs1,d=1;d<c.l;d++)e+=c["xn"+d]+c["xs"+(d+1)];c[f]=e}}else c[f]=c.s+c.xs0;i=i._next}},function(a,b,c,d,e){this.t=a,this.p=b,this.v=c,this.r=e,d&&(d._prev=this,this._next=d)}),pa=(O._parseToProxy=function(a,b,c,d,e,f){var g,h,i,j,k,l=d,m={},n={},o=c._transform,p=J;for(c._transform=null,J=b,d=k=c.parse(a,b,d,e),J=p,f&&(c._transform=o,l&&(l._prev=null,l._prev&&(l._prev._next=null)));d&&d!==l;){if(d.type<=1&&(h=d.p,n[h]=d.s+d.c,m[h]=d.s,f||(j=new oa(d,"s",h,j,d.r),d.c=0),1===d.type))for(g=d.l;--g>0;)i="xn"+g,h=d.p+"_"+i,n[h]=d.data[i],m[h]=d[i],f||(j=new oa(d,i,h,j,d.rxp[i]));d=d._next}return{proxy:m,end:n,firstMPT:j,pt:k}},O.CSSPropTween=function(a,b,d,e,g,h,i,j,k,l,m){this.t=a,this.p=b,this.s=d,this.c=e,this.n=i||b,a instanceof pa||f.push(this.n),this.r=j,this.type=h||0,k&&(this.pr=k,c=!0),this.b=void 0===l?d:l,this.e=void 0===m?d+e:m,g&&(this._next=g,g._prev=this)}),qa=function(a,b,c,d,e,f){var g=new pa(a,b,c,d-c,e,-1,f);return g.b=c,g.e=g.xs0=d,g},ra=g.parseComplex=function(a,b,c,d,e,f,g,h,i,j){c=c||f||"",g=new pa(a,b,0,0,g,j?2:1,null,!1,h,c,d),d+="";var l,m,n,o,p,s,t,u,v,w,x,y,z,A=c.split(", ").join(",").split(" "),B=d.split(", ").join(",").split(" "),C=A.length,D=k!==!1;for((-1!==d.indexOf(",")||-1!==c.indexOf(","))&&(A=A.join(" ").replace(G,", ").split(" "),B=B.join(" ").replace(G,", ").split(" "),C=A.length),C!==B.length&&(A=(f||"").split(" "),C=A.length),g.plugin=i,g.setRatio=j,la.lastIndex=0,l=0;C>l;l++)if(o=A[l],p=B[l],u=parseFloat(o),u||0===u)g.appendXtra("",u,ea(p,u),p.replace(r,""),D&&-1!==p.indexOf("px"),!0);else if(e&&la.test(o))y=","===p.charAt(p.length-1)?"),":")",z=-1!==p.indexOf("hsl")&&Q,o=ja(o,z),p=ja(p,z),v=o.length+p.length>6,v&&!Q&&0===p[3]?(g["xs"+g.l]+=g.l?" transparent":"transparent",g.e=g.e.split(B[l]).join("transparent")):(Q||(v=!1),z?g.appendXtra(v?"hsla(":"hsl(",o[0],ea(p[0],o[0]),",",!1,!0).appendXtra("",o[1],ea(p[1],o[1]),"%,",!1).appendXtra("",o[2],ea(p[2],o[2]),v?"%,":"%"+y,!1):g.appendXtra(v?"rgba(":"rgb(",o[0],p[0]-o[0],",",!0,!0).appendXtra("",o[1],p[1]-o[1],",",!0).appendXtra("",o[2],p[2]-o[2],v?",":y,!0),v&&(o=o.length<4?1:o[3],g.appendXtra("",o,(p.length<4?1:p[3])-o,y,!1))),la.lastIndex=0;else if(s=o.match(q)){if(t=p.match(r),!t||t.length!==s.length)return g;for(n=0,m=0;m<s.length;m++)x=s[m],w=o.indexOf(x,n),g.appendXtra(o.substr(n,w-n),Number(x),ea(t[m],x),"",D&&"px"===o.substr(w+x.length,2),0===m),n=w+x.length;g["xs"+g.l]+=o.substr(n)}else g["xs"+g.l]+=g.l?" "+p:p;if(-1!==d.indexOf("=")&&g.data){for(y=g.xs0+g.data.s,l=1;l<g.l;l++)y+=g["xs"+l]+g.data["xn"+l];g.e=y+g["xs"+l]}return g.l||(g.type=-1,g.xs0=g.e),g.xfirst||g},sa=9;for(j=pa.prototype,j.l=j.pr=0;--sa>0;)j["xn"+sa]=0,j["xs"+sa]="";j.xs0="",j._next=j._prev=j.xfirst=j.data=j.plugin=j.setRatio=j.rxp=null,j.appendXtra=function(a,b,c,d,e,f){var g=this,h=g.l;return g["xs"+h]+=f&&h?" "+a:a||"",c||0===h||g.plugin?(g.l++,g.type=g.setRatio?2:1,g["xs"+g.l]=d||"",h>0?(g.data["xn"+h]=b+c,g.rxp["xn"+h]=e,g["xn"+h]=b,g.plugin||(g.xfirst=new pa(g,"xn"+h,b,c,g.xfirst||g,0,g.n,e,g.pr),g.xfirst.xs0=0),g):(g.data={s:b+c},g.rxp={},g.s=b,g.c=c,g.r=e,g)):(g["xs"+h]+=b+(d||""),g)};var ta=function(a,b){b=b||{},this.p=b.prefix?V(a)||a:a,i[a]=i[this.p]=this,this.format=b.formatter||ma(b.defaultValue,b.color,b.collapsible,b.multi),b.parser&&(this.parse=b.parser),this.clrs=b.color,this.multi=b.multi,this.keyword=b.keyword,this.dflt=b.defaultValue,this.pr=b.priority||0},ua=O._registerComplexSpecialProp=function(a,b,c){"object"!=typeof b&&(b={parser:c});var d,e,f=a.split(","),g=b.defaultValue;for(c=c||[g],d=0;d<f.length;d++)b.prefix=0===d&&b.prefix,b.defaultValue=c[d]||g,e=new ta(f[d],b)},va=function(a){if(!i[a]){var b=a.charAt(0).toUpperCase()+a.substr(1)+"Plugin";ua(a,{parser:function(a,c,d,e,f,g,j){var k=h.com.greensock.plugins[b];return k?(k._cssRegister(),i[d].parse(a,c,d,e,f,g,j)):(S("Error: "+b+" js file not loaded."),f)}})}};j=ta.prototype,j.parseComplex=function(a,b,c,d,e,f){var g,h,i,j,k,l,m=this.keyword;if(this.multi&&(G.test(c)||G.test(b)?(h=b.replace(G,"|").split("|"),i=c.replace(G,"|").split("|")):m&&(h=[b],i=[c])),i){for(j=i.length>h.length?i.length:h.length,g=0;j>g;g++)b=h[g]=h[g]||this.dflt,c=i[g]=i[g]||this.dflt,m&&(k=b.indexOf(m),l=c.indexOf(m),k!==l&&(-1===l?h[g]=h[g].split(m).join(""):-1===k&&(h[g]+=" "+m)));b=h.join(", "),c=i.join(", ")}return ra(a,this.p,b,c,this.clrs,this.dflt,d,this.pr,e,f)},j.parse=function(a,b,c,d,f,g,h){return this.parseComplex(a.style,this.format(X(a,this.p,e,!1,this.dflt)),this.format(b),f,g)},g.registerSpecialProp=function(a,b,c){ua(a,{parser:function(a,d,e,f,g,h,i){var j=new pa(a,e,0,0,g,2,e,!1,c);return j.plugin=h,j.setRatio=b(a,d,f._tween,e),j},priority:c})},g.useSVGTransformAttr=m||n;var wa,xa="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),ya=V("transform"),za=T+"transform",Aa=V("transformOrigin"),Ba=null!==V("perspective"),Ca=O.Transform=function(){this.perspective=parseFloat(g.defaultTransformPerspective)||0,this.force3D=g.defaultForce3D!==!1&&Ba?g.defaultForce3D||"auto":!1},Da=window.SVGElement,Ea=function(a,b,c){var d,e=K.createElementNS("http://www.w3.org/2000/svg",a),f=/([a-z])([A-Z])/g;for(d in c)e.setAttributeNS(null,d.replace(f,"$1-$2").toLowerCase(),c[d]);return b.appendChild(e),e},Fa=K.documentElement,Ga=function(){var a,b,c,d=p||/Android/i.test(P)&&!window.chrome;return K.createElementNS&&!d&&(a=Ea("svg",Fa),b=Ea("rect",a,{width:100,height:50,x:100}),c=b.getBoundingClientRect().width,b.style[Aa]="50% 50%",b.style[ya]="scaleX(0.5)",d=c===b.getBoundingClientRect().width&&!(n&&Ba),Fa.removeChild(a)),d}(),Ha=function(a,b,c,d,e){var f,h,i,j,k,l,m,n,o,p,q,r,s,t,u=a._gsTransform,v=Ka(a,!0);u&&(s=u.xOrigin,t=u.yOrigin),(!d||(f=d.split(" ")).length<2)&&(m=a.getBBox(),b=da(b).split(" "),f=[(-1!==b[0].indexOf("%")?parseFloat(b[0])/100*m.width:parseFloat(b[0]))+m.x,(-1!==b[1].indexOf("%")?parseFloat(b[1])/100*m.height:parseFloat(b[1]))+m.y]),c.xOrigin=j=parseFloat(f[0]),c.yOrigin=k=parseFloat(f[1]),d&&v!==Ja&&(l=v[0],m=v[1],n=v[2],o=v[3],p=v[4],q=v[5],r=l*o-m*n,h=j*(o/r)+k*(-n/r)+(n*q-o*p)/r,i=j*(-m/r)+k*(l/r)-(l*q-m*p)/r,j=c.xOrigin=f[0]=h,k=c.yOrigin=f[1]=i),u&&(e||e!==!1&&g.defaultSmoothOrigin!==!1?(h=j-s,i=k-t,u.xOffset+=h*v[0]+i*v[2]-h,u.yOffset+=h*v[1]+i*v[3]-i):u.xOffset=u.yOffset=0),a.setAttribute("data-svg-origin",f.join(" "))},Ia=function(a){return!!(Da&&"function"==typeof a.getBBox&&a.getCTM&&(!a.parentNode||a.parentNode.getBBox&&a.parentNode.getCTM))},Ja=[1,0,0,1,0,0],Ka=function(a,b){var c,d,e,f,g,h=a._gsTransform||new Ca,i=1e5;if(ya?d=X(a,za,null,!0):a.currentStyle&&(d=a.currentStyle.filter.match(E),d=d&&4===d.length?[d[0].substr(4),Number(d[2].substr(4)),Number(d[1].substr(4)),d[3].substr(4),h.x||0,h.y||0].join(","):""),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,(h.svg||a.getBBox&&Ia(a))&&(c&&-1!==(a.style[ya]+"").indexOf("matrix")&&(d=a.style[ya],c=0),e=a.getAttribute("transform"),c&&e&&(-1!==e.indexOf("matrix")?(d=e,c=0):-1!==e.indexOf("translate")&&(d="matrix(1,0,0,1,"+e.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",")+")",c=0))),c)return Ja;for(e=(d||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[],sa=e.length;--sa>-1;)f=Number(e[sa]),e[sa]=(g=f-(f|=0))?(g*i+(0>g?-.5:.5)|0)/i+f:f;return b&&e.length>6?[e[0],e[1],e[4],e[5],e[12],e[13]]:e},La=O.getTransform=function(a,c,d,f){if(a._gsTransform&&d&&!f)return a._gsTransform;var h,i,j,k,l,m,n=d?a._gsTransform||new Ca:new Ca,o=n.scaleX<0,p=2e-5,q=1e5,r=Ba?parseFloat(X(a,Aa,c,!1,"0 0 0").split(" ")[2])||n.zOrigin||0:0,s=parseFloat(g.defaultTransformPerspective)||0;if(n.svg=!(!a.getBBox||!Ia(a)),n.svg&&(Ha(a,X(a,Aa,e,!1,"50% 50%")+"",n,a.getAttribute("data-svg-origin")),wa=g.useSVGTransformAttr||Ga),h=Ka(a),h!==Ja){if(16===h.length){var t,u,v,w,x,y=h[0],z=h[1],A=h[2],B=h[3],C=h[4],D=h[5],E=h[6],F=h[7],G=h[8],H=h[9],J=h[10],K=h[12],L=h[13],M=h[14],N=h[11],O=Math.atan2(E,J);n.zOrigin&&(M=-n.zOrigin,K=G*M-h[12],L=H*M-h[13],M=J*M+n.zOrigin-h[14]),n.rotationX=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),t=C*w+G*x,u=D*w+H*x,v=E*w+J*x,G=C*-x+G*w,H=D*-x+H*w,J=E*-x+J*w,N=F*-x+N*w,C=t,D=u,E=v),O=Math.atan2(-A,J),n.rotationY=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),t=y*w-G*x,u=z*w-H*x,v=A*w-J*x,H=z*x+H*w,J=A*x+J*w,N=B*x+N*w,y=t,z=u,A=v),O=Math.atan2(z,y),n.rotation=O*I,O&&(w=Math.cos(-O),x=Math.sin(-O),y=y*w+C*x,u=z*w+D*x,D=z*-x+D*w,E=A*-x+E*w,z=u),n.rotationX&&Math.abs(n.rotationX)+Math.abs(n.rotation)>359.9&&(n.rotationX=n.rotation=0,n.rotationY=180-n.rotationY),n.scaleX=(Math.sqrt(y*y+z*z)*q+.5|0)/q,n.scaleY=(Math.sqrt(D*D+H*H)*q+.5|0)/q,n.scaleZ=(Math.sqrt(E*E+J*J)*q+.5|0)/q,n.skewX=0,n.perspective=N?1/(0>N?-N:N):0,n.x=K,n.y=L,n.z=M,n.svg&&(n.x-=n.xOrigin-(n.xOrigin*y-n.yOrigin*C),n.y-=n.yOrigin-(n.yOrigin*z-n.xOrigin*D))}else if((!Ba||f||!h.length||n.x!==h[4]||n.y!==h[5]||!n.rotationX&&!n.rotationY)&&(void 0===n.x||"none"!==X(a,"display",c))){var P=h.length>=6,Q=P?h[0]:1,R=h[1]||0,S=h[2]||0,T=P?h[3]:1;n.x=h[4]||0,n.y=h[5]||0,j=Math.sqrt(Q*Q+R*R),k=Math.sqrt(T*T+S*S),l=Q||R?Math.atan2(R,Q)*I:n.rotation||0,m=S||T?Math.atan2(S,T)*I+l:n.skewX||0,Math.abs(m)>90&&Math.abs(m)<270&&(o?(j*=-1,m+=0>=l?180:-180,l+=0>=l?180:-180):(k*=-1,m+=0>=m?180:-180)),n.scaleX=j,n.scaleY=k,n.rotation=l,n.skewX=m,Ba&&(n.rotationX=n.rotationY=n.z=0,n.perspective=s,n.scaleZ=1),n.svg&&(n.x-=n.xOrigin-(n.xOrigin*Q+n.yOrigin*S),n.y-=n.yOrigin-(n.xOrigin*R+n.yOrigin*T))}n.zOrigin=r;for(i in n)n[i]<p&&n[i]>-p&&(n[i]=0)}return d&&(a._gsTransform=n,n.svg&&(wa&&a.style[ya]?b.delayedCall(.001,function(){Pa(a.style,ya)}):!wa&&a.getAttribute("transform")&&b.delayedCall(.001,function(){a.removeAttribute("transform")}))),n},Ma=function(a){var b,c,d=this.data,e=-d.rotation*H,f=e+d.skewX*H,g=1e5,h=(Math.cos(e)*d.scaleX*g|0)/g,i=(Math.sin(e)*d.scaleX*g|0)/g,j=(Math.sin(f)*-d.scaleY*g|0)/g,k=(Math.cos(f)*d.scaleY*g|0)/g,l=this.t.style,m=this.t.currentStyle;if(m){c=i,i=-j,j=-c,b=m.filter,l.filter="";var n,o,q=this.t.offsetWidth,r=this.t.offsetHeight,s="absolute"!==m.position,t="progid:DXImageTransform.Microsoft.Matrix(M11="+h+", M12="+i+", M21="+j+", M22="+k,w=d.x+q*d.xPercent/100,x=d.y+r*d.yPercent/100;if(null!=d.ox&&(n=(d.oxp?q*d.ox*.01:d.ox)-q/2,o=(d.oyp?r*d.oy*.01:d.oy)-r/2,w+=n-(n*h+o*i),x+=o-(n*j+o*k)),s?(n=q/2,o=r/2,t+=", Dx="+(n-(n*h+o*i)+w)+", Dy="+(o-(n*j+o*k)+x)+")"):t+=", sizingMethod='auto expand')",-1!==b.indexOf("DXImageTransform.Microsoft.Matrix(")?l.filter=b.replace(F,t):l.filter=t+" "+b,(0===a||1===a)&&1===h&&0===i&&0===j&&1===k&&(s&&-1===t.indexOf("Dx=0, Dy=0")||v.test(b)&&100!==parseFloat(RegExp.$1)||-1===b.indexOf(b.indexOf("Alpha"))&&l.removeAttribute("filter")),!s){var y,z,A,B=8>p?1:-1;for(n=d.ieOffsetX||0,o=d.ieOffsetY||0,d.ieOffsetX=Math.round((q-((0>h?-h:h)*q+(0>i?-i:i)*r))/2+w),d.ieOffsetY=Math.round((r-((0>k?-k:k)*r+(0>j?-j:j)*q))/2+x),sa=0;4>sa;sa++)z=ba[sa],y=m[z],c=-1!==y.indexOf("px")?parseFloat(y):Y(this.t,z,parseFloat(y),y.replace(u,""))||0,A=c!==d[z]?2>sa?-d.ieOffsetX:-d.ieOffsetY:2>sa?n-d.ieOffsetX:o-d.ieOffsetY,l[z]=(d[z]=Math.round(c-A*(0===sa||2===sa?1:B)))+"px"}}},Na=O.set3DTransformRatio=O.setTransformRatio=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,o,p,q,r,s,t,u,v,w,x,y,z=this.data,A=this.t.style,B=z.rotation,C=z.rotationX,D=z.rotationY,E=z.scaleX,F=z.scaleY,G=z.scaleZ,I=z.x,J=z.y,K=z.z,L=z.svg,M=z.perspective,N=z.force3D;if(((1===a||0===a)&&"auto"===N&&(this.tween._totalTime===this.tween._totalDuration||!this.tween._totalTime)||!N)&&!K&&!M&&!D&&!C&&1===G||wa&&L||!Ba)return void(B||z.skewX||L?(B*=H,x=z.skewX*H,y=1e5,b=Math.cos(B)*E,e=Math.sin(B)*E,c=Math.sin(B-x)*-F,f=Math.cos(B-x)*F,x&&"simple"===z.skewType&&(s=Math.tan(x),s=Math.sqrt(1+s*s),c*=s,f*=s,z.skewY&&(b*=s,e*=s)),L&&(I+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,J+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset,wa&&(z.xPercent||z.yPercent)&&(p=this.t.getBBox(),I+=.01*z.xPercent*p.width,J+=.01*z.yPercent*p.height),p=1e-6,p>I&&I>-p&&(I=0),p>J&&J>-p&&(J=0)),u=(b*y|0)/y+","+(e*y|0)/y+","+(c*y|0)/y+","+(f*y|0)/y+","+I+","+J+")",L&&wa?this.t.setAttribute("transform","matrix("+u):A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+u):A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+E+",0,0,"+F+","+I+","+J+")");if(n&&(p=1e-4,p>E&&E>-p&&(E=G=2e-5),p>F&&F>-p&&(F=G=2e-5),!M||z.z||z.rotationX||z.rotationY||(M=0)),B||z.skewX)B*=H,q=b=Math.cos(B),r=e=Math.sin(B),z.skewX&&(B-=z.skewX*H,q=Math.cos(B),r=Math.sin(B),"simple"===z.skewType&&(s=Math.tan(z.skewX*H),s=Math.sqrt(1+s*s),q*=s,r*=s,z.skewY&&(b*=s,e*=s))),c=-r,f=q;else{if(!(D||C||1!==G||M||L))return void(A[ya]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) translate3d(":"translate3d(")+I+"px,"+J+"px,"+K+"px)"+(1!==E||1!==F?" scale("+E+","+F+")":""));b=f=1,c=e=0}j=1,d=g=h=i=k=l=0,m=M?-1/M:0,o=z.zOrigin,p=1e-6,v=",",w="0",B=D*H,B&&(q=Math.cos(B),r=Math.sin(B),h=-r,k=m*-r,d=b*r,g=e*r,j=q,m*=q,b*=q,e*=q),B=C*H,B&&(q=Math.cos(B),r=Math.sin(B),s=c*q+d*r,t=f*q+g*r,i=j*r,l=m*r,d=c*-r+d*q,g=f*-r+g*q,j*=q,m*=q,c=s,f=t),1!==G&&(d*=G,g*=G,j*=G,m*=G),1!==F&&(c*=F,f*=F,i*=F,l*=F),1!==E&&(b*=E,e*=E,h*=E,k*=E),(o||L)&&(o&&(I+=d*-o,J+=g*-o,K+=j*-o+o),L&&(I+=z.xOrigin-(z.xOrigin*b+z.yOrigin*c)+z.xOffset,J+=z.yOrigin-(z.xOrigin*e+z.yOrigin*f)+z.yOffset),p>I&&I>-p&&(I=w),p>J&&J>-p&&(J=w),p>K&&K>-p&&(K=0)),u=z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix3d(":"matrix3d(",u+=(p>b&&b>-p?w:b)+v+(p>e&&e>-p?w:e)+v+(p>h&&h>-p?w:h),u+=v+(p>k&&k>-p?w:k)+v+(p>c&&c>-p?w:c)+v+(p>f&&f>-p?w:f),C||D||1!==G?(u+=v+(p>i&&i>-p?w:i)+v+(p>l&&l>-p?w:l)+v+(p>d&&d>-p?w:d),u+=v+(p>g&&g>-p?w:g)+v+(p>j&&j>-p?w:j)+v+(p>m&&m>-p?w:m)+v):u+=",0,0,0,0,1,0,",u+=I+v+J+v+K+v+(M?1+-K/M:1)+")",A[ya]=u};j=Ca.prototype,j.x=j.y=j.z=j.skewX=j.skewY=j.rotation=j.rotationX=j.rotationY=j.zOrigin=j.xPercent=j.yPercent=j.xOffset=j.yOffset=0,j.scaleX=j.scaleY=j.scaleZ=1,ua("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin",{parser:function(a,b,c,d,f,h,i){if(d._lastParsedTransform===i)return f;d._lastParsedTransform=i;var j,k,l,m,n,o,p,q,r,s,t=a._gsTransform,u=a.style,v=1e-6,w=xa.length,x=i,y={},z="transformOrigin";if(i.display?(m=X(a,"display"),u.display="block",j=La(a,e,!0,i.parseTransform),u.display=m):j=La(a,e,!0,i.parseTransform),d._transform=j,"string"==typeof x.transform&&ya)m=M.style,m[ya]=x.transform,m.display="block",m.position="absolute",K.body.appendChild(M),k=La(M,null,!1),K.body.removeChild(M),k.perspective||(k.perspective=j.perspective),null!=x.xPercent&&(k.xPercent=fa(x.xPercent,j.xPercent)),null!=x.yPercent&&(k.yPercent=fa(x.yPercent,j.yPercent));else if("object"==typeof x){if(k={scaleX:fa(null!=x.scaleX?x.scaleX:x.scale,j.scaleX),scaleY:fa(null!=x.scaleY?x.scaleY:x.scale,j.scaleY),scaleZ:fa(x.scaleZ,j.scaleZ),x:fa(x.x,j.x),y:fa(x.y,j.y),z:fa(x.z,j.z),xPercent:fa(x.xPercent,j.xPercent),yPercent:fa(x.yPercent,j.yPercent),perspective:fa(x.transformPerspective,j.perspective)},q=x.directionalRotation,null!=q)if("object"==typeof q)for(m in q)x[m]=q[m];else x.rotation=q;"string"==typeof x.x&&-1!==x.x.indexOf("%")&&(k.x=0,k.xPercent=fa(x.x,j.xPercent)),"string"==typeof x.y&&-1!==x.y.indexOf("%")&&(k.y=0,k.yPercent=fa(x.y,j.yPercent)),k.rotation=ga("rotation"in x?x.rotation:"shortRotation"in x?x.shortRotation+"_short":"rotationZ"in x?x.rotationZ:j.rotation,j.rotation,"rotation",y),Ba&&(k.rotationX=ga("rotationX"in x?x.rotationX:"shortRotationX"in x?x.shortRotationX+"_short":j.rotationX||0,j.rotationX,"rotationX",y),k.rotationY=ga("rotationY"in x?x.rotationY:"shortRotationY"in x?x.shortRotationY+"_short":j.rotationY||0,j.rotationY,"rotationY",y)),k.skewX=null==x.skewX?j.skewX:ga(x.skewX,j.skewX),k.skewY=null==x.skewY?j.skewY:ga(x.skewY,j.skewY),(l=k.skewY-j.skewY)&&(k.skewX+=l,k.rotation+=l)}for(Ba&&null!=x.force3D&&(j.force3D=x.force3D,p=!0),j.skewType=x.skewType||j.skewType||g.defaultSkewType,o=j.force3D||j.z||j.rotationX||j.rotationY||k.z||k.rotationX||k.rotationY||k.perspective,o||null==x.scale||(k.scaleZ=1);--w>-1;)c=xa[w],n=k[c]-j[c],(n>v||-v>n||null!=x[c]||null!=J[c])&&(p=!0,f=new pa(j,c,j[c],n,f),c in y&&(f.e=y[c]),f.xs0=0,f.plugin=h,d._overwriteProps.push(f.n));return n=x.transformOrigin,j.svg&&(n||x.svgOrigin)&&(r=j.xOffset,s=j.yOffset,Ha(a,da(n),k,x.svgOrigin,x.smoothOrigin),f=qa(j,"xOrigin",(t?j:k).xOrigin,k.xOrigin,f,z),f=qa(j,"yOrigin",(t?j:k).yOrigin,k.yOrigin,f,z),(r!==j.xOffset||s!==j.yOffset)&&(f=qa(j,"xOffset",t?r:j.xOffset,j.xOffset,f,z),f=qa(j,"yOffset",t?s:j.yOffset,j.yOffset,f,z)),n=wa?null:"0px 0px"),(n||Ba&&o&&j.zOrigin)&&(ya?(p=!0,c=Aa,n=(n||X(a,c,e,!1,"50% 50%"))+"",f=new pa(u,c,0,0,f,-1,z),f.b=u[c],f.plugin=h,Ba?(m=j.zOrigin,n=n.split(" "),j.zOrigin=(n.length>2&&(0===m||"0px"!==n[2])?parseFloat(n[2]):m)||0,f.xs0=f.e=n[0]+" "+(n[1]||"50%")+" 0px",f=new pa(j,"zOrigin",0,0,f,-1,f.n),f.b=m,f.xs0=f.e=j.zOrigin):f.xs0=f.e=n):da(n+"",j)),p&&(d._transformType=j.svg&&wa||!o&&3!==this._transformType?2:3),f},prefix:!0}),ua("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),ua("borderRadius",{defaultValue:"0px",parser:function(a,b,c,f,g,h){b=this.format(b);var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],z=a.style;for(q=parseFloat(a.offsetWidth),r=parseFloat(a.offsetHeight),i=b.split(" "),j=0;j<y.length;j++)this.p.indexOf("border")&&(y[j]=V(y[j])),m=l=X(a,y[j],e,!1,"0px"),-1!==m.indexOf(" ")&&(l=m.split(" "),m=l[0],l=l[1]),n=k=i[j],o=parseFloat(m),t=m.substr((o+"").length),u="="===n.charAt(1),u?(p=parseInt(n.charAt(0)+"1",10),n=n.substr(2),p*=parseFloat(n),s=n.substr((p+"").length-(0>p?1:0))||""):(p=parseFloat(n),s=n.substr((p+"").length)),""===s&&(s=d[c]||t),s!==t&&(v=Y(a,"borderLeft",o,t),w=Y(a,"borderTop",o,t),"%"===s?(m=v/q*100+"%",l=w/r*100+"%"):"em"===s?(x=Y(a,"borderLeft",1,"em"),m=v/x+"em",l=w/x+"em"):(m=v+"px",l=w+"px"),u&&(n=parseFloat(m)+p+s,k=parseFloat(l)+p+s)),g=ra(z,y[j],m+" "+l,n+" "+k,!1,"0px",g);return g},prefix:!0,formatter:ma("0px 0px 0px 0px",!1,!0)}),ua("backgroundPosition",{
	defaultValue:"0 0",parser:function(a,b,c,d,f,g){var h,i,j,k,l,m,n="background-position",o=e||W(a,null),q=this.format((o?p?o.getPropertyValue(n+"-x")+" "+o.getPropertyValue(n+"-y"):o.getPropertyValue(n):a.currentStyle.backgroundPositionX+" "+a.currentStyle.backgroundPositionY)||"0 0"),r=this.format(b);if(-1!==q.indexOf("%")!=(-1!==r.indexOf("%"))&&(m=X(a,"backgroundImage").replace(B,""),m&&"none"!==m)){for(h=q.split(" "),i=r.split(" "),N.setAttribute("src",m),j=2;--j>-1;)q=h[j],k=-1!==q.indexOf("%"),k!==(-1!==i[j].indexOf("%"))&&(l=0===j?a.offsetWidth-N.width:a.offsetHeight-N.height,h[j]=k?parseFloat(q)/100*l+"px":parseFloat(q)/l*100+"%");q=h.join(" ")}return this.parseComplex(a.style,q,r,f,g)},formatter:da}),ua("backgroundSize",{defaultValue:"0 0",formatter:da}),ua("perspective",{defaultValue:"0px",prefix:!0}),ua("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),ua("transformStyle",{prefix:!0}),ua("backfaceVisibility",{prefix:!0}),ua("userSelect",{prefix:!0}),ua("margin",{parser:na("marginTop,marginRight,marginBottom,marginLeft")}),ua("padding",{parser:na("paddingTop,paddingRight,paddingBottom,paddingLeft")}),ua("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(a,b,c,d,f,g){var h,i,j;return 9>p?(i=a.currentStyle,j=8>p?" ":",",h="rect("+i.clipTop+j+i.clipRight+j+i.clipBottom+j+i.clipLeft+")",b=this.format(b).split(",").join(j)):(h=this.format(X(a,this.p,e,!1,this.dflt)),b=this.format(b)),this.parseComplex(a.style,h,b,f,g)}}),ua("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),ua("autoRound,strictUnits",{parser:function(a,b,c,d,e){return e}}),ua("border",{defaultValue:"0px solid #000",parser:function(a,b,c,d,f,g){return this.parseComplex(a.style,this.format(X(a,"borderTopWidth",e,!1,"0px")+" "+X(a,"borderTopStyle",e,!1,"solid")+" "+X(a,"borderTopColor",e,!1,"#000")),this.format(b),f,g)},color:!0,formatter:function(a){var b=a.split(" ");return b[0]+" "+(b[1]||"solid")+" "+(a.match(la)||["#000"])[0]}}),ua("borderWidth",{parser:na("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),ua("float,cssFloat,styleFloat",{parser:function(a,b,c,d,e,f){var g=a.style,h="cssFloat"in g?"cssFloat":"styleFloat";return new pa(g,h,0,0,e,-1,c,!1,0,g[h],b)}});var Oa=function(a){var b,c=this.t,d=c.filter||X(this.data,"filter")||"",e=this.s+this.c*a|0;100===e&&(-1===d.indexOf("atrix(")&&-1===d.indexOf("radient(")&&-1===d.indexOf("oader(")?(c.removeAttribute("filter"),b=!X(this.data,"filter")):(c.filter=d.replace(x,""),b=!0)),b||(this.xn1&&(c.filter=d=d||"alpha(opacity="+e+")"),-1===d.indexOf("pacity")?0===e&&this.xn1||(c.filter=d+" alpha(opacity="+e+")"):c.filter=d.replace(v,"opacity="+e))};ua("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(a,b,c,d,f,g){var h=parseFloat(X(a,"opacity",e,!1,"1")),i=a.style,j="autoAlpha"===c;return"string"==typeof b&&"="===b.charAt(1)&&(b=("-"===b.charAt(0)?-1:1)*parseFloat(b.substr(2))+h),j&&1===h&&"hidden"===X(a,"visibility",e)&&0!==b&&(h=0),Q?f=new pa(i,"opacity",h,b-h,f):(f=new pa(i,"opacity",100*h,100*(b-h),f),f.xn1=j?1:0,i.zoom=1,f.type=2,f.b="alpha(opacity="+f.s+")",f.e="alpha(opacity="+(f.s+f.c)+")",f.data=a,f.plugin=g,f.setRatio=Oa),j&&(f=new pa(i,"visibility",0,0,f,-1,null,!1,0,0!==h?"inherit":"hidden",0===b?"hidden":"inherit"),f.xs0="inherit",d._overwriteProps.push(f.n),d._overwriteProps.push(c)),f}});var Pa=function(a,b){b&&(a.removeProperty?(("ms"===b.substr(0,2)||"webkit"===b.substr(0,6))&&(b="-"+b),a.removeProperty(b.replace(z,"-$1").toLowerCase())):a.removeAttribute(b))},Qa=function(a){if(this.t._gsClassPT=this,1===a||0===a){this.t.setAttribute("class",0===a?this.b:this.e);for(var b=this.data,c=this.t.style;b;)b.v?c[b.p]=b.v:Pa(c,b.p),b=b._next;1===a&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};ua("className",{parser:function(a,b,d,f,g,h,i){var j,k,l,m,n,o=a.getAttribute("class")||"",p=a.style.cssText;if(g=f._classNamePT=new pa(a,d,0,0,g,2),g.setRatio=Qa,g.pr=-11,c=!0,g.b=o,k=$(a,e),l=a._gsClassPT){for(m={},n=l.data;n;)m[n.p]=1,n=n._next;l.setRatio(1)}return a._gsClassPT=g,g.e="="!==b.charAt(1)?b:o.replace(new RegExp("\\s*\\b"+b.substr(2)+"\\b"),"")+("+"===b.charAt(0)?" "+b.substr(2):""),a.setAttribute("class",g.e),j=_(a,k,$(a),i,m),a.setAttribute("class",o),g.data=j.firstMPT,a.style.cssText=p,g=g.xfirst=f.parse(a,j.difs,g,h)}});var Ra=function(a){if((1===a||0===a)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var b,c,d,e,f,g=this.t.style,h=i.transform.parse;if("all"===this.e)g.cssText="",e=!0;else for(b=this.e.split(" ").join("").split(","),d=b.length;--d>-1;)c=b[d],i[c]&&(i[c].parse===h?e=!0:c="transformOrigin"===c?Aa:i[c].p),Pa(g,c);e&&(Pa(g,ya),f=this.t._gsTransform,f&&(f.svg&&(this.t.removeAttribute("data-svg-origin"),this.t.removeAttribute("transform")),delete this.t._gsTransform))}};for(ua("clearProps",{parser:function(a,b,d,e,f){return f=new pa(a,d,0,0,f,2),f.setRatio=Ra,f.e=b,f.pr=-10,f.data=e._tween,c=!0,f}}),j="bezier,throwProps,physicsProps,physics2D".split(","),sa=j.length;sa--;)va(j[sa]);j=g.prototype,j._firstPT=j._lastParsedTransform=j._transform=null,j._onInitTween=function(a,b,h){if(!a.nodeType)return!1;this._target=a,this._tween=h,this._vars=b,k=b.autoRound,c=!1,d=b.suffixMap||g.suffixMap,e=W(a,""),f=this._overwriteProps;var j,n,p,q,r,s,t,u,v,x=a.style;if(l&&""===x.zIndex&&(j=X(a,"zIndex",e),("auto"===j||""===j)&&this._addLazySet(x,"zIndex",0)),"string"==typeof b&&(q=x.cssText,j=$(a,e),x.cssText=q+";"+b,j=_(a,j,$(a)).difs,!Q&&w.test(b)&&(j.opacity=parseFloat(RegExp.$1)),b=j,x.cssText=q),b.className?this._firstPT=n=i.className.parse(a,b.className,"className",this,null,null,b):this._firstPT=n=this.parse(a,b,null),this._transformType){for(v=3===this._transformType,ya?m&&(l=!0,""===x.zIndex&&(t=X(a,"zIndex",e),("auto"===t||""===t)&&this._addLazySet(x,"zIndex",0)),o&&this._addLazySet(x,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(v?"visible":"hidden"))):x.zoom=1,p=n;p&&p._next;)p=p._next;u=new pa(a,"transform",0,0,null,2),this._linkCSSP(u,null,p),u.setRatio=ya?Na:Ma,u.data=this._transform||La(a,e,!0),u.tween=h,u.pr=-1,f.pop()}if(c){for(;n;){for(s=n._next,p=q;p&&p.pr>n.pr;)p=p._next;(n._prev=p?p._prev:r)?n._prev._next=n:q=n,(n._next=p)?p._prev=n:r=n,n=s}this._firstPT=q}return!0},j.parse=function(a,b,c,f){var g,h,j,l,m,n,o,p,q,r,s=a.style;for(g in b)n=b[g],h=i[g],h?c=h.parse(a,n,g,this,c,f,b):(m=X(a,g,e)+"",q="string"==typeof n,"color"===g||"fill"===g||"stroke"===g||-1!==g.indexOf("Color")||q&&y.test(n)?(q||(n=ja(n),n=(n.length>3?"rgba(":"rgb(")+n.join(",")+")"),c=ra(s,g,m,n,!0,"transparent",c,0,f)):!q||-1===n.indexOf(" ")&&-1===n.indexOf(",")?(j=parseFloat(m),o=j||0===j?m.substr((j+"").length):"",(""===m||"auto"===m)&&("width"===g||"height"===g?(j=ca(a,g,e),o="px"):"left"===g||"top"===g?(j=Z(a,g,e),o="px"):(j="opacity"!==g?0:1,o="")),r=q&&"="===n.charAt(1),r?(l=parseInt(n.charAt(0)+"1",10),n=n.substr(2),l*=parseFloat(n),p=n.replace(u,"")):(l=parseFloat(n),p=q?n.replace(u,""):""),""===p&&(p=g in d?d[g]:o),n=l||0===l?(r?l+j:l)+p:b[g],o!==p&&""!==p&&(l||0===l)&&j&&(j=Y(a,g,j,o),"%"===p?(j/=Y(a,g,100,"%")/100,b.strictUnits!==!0&&(m=j+"%")):"em"===p||"rem"===p||"vw"===p||"vh"===p?j/=Y(a,g,1,p):"px"!==p&&(l=Y(a,g,l,p),p="px"),r&&(l||0===l)&&(n=l+j+p)),r&&(l+=j),!j&&0!==j||!l&&0!==l?void 0!==s[g]&&(n||n+""!="NaN"&&null!=n)?(c=new pa(s,g,l||j||0,0,c,-1,g,!1,0,m,n),c.xs0="none"!==n||"display"!==g&&-1===g.indexOf("Style")?n:m):S("invalid "+g+" tween value: "+b[g]):(c=new pa(s,g,j,l-j,c,0,g,k!==!1&&("px"===p||"zIndex"===g),0,m,n),c.xs0=p)):c=ra(s,g,m,n,!0,null,c,0,f)),f&&c&&!c.plugin&&(c.plugin=f);return c},j.setRatio=function(a){var b,c,d,e=this._firstPT,f=1e-6;if(1!==a||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(a||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;e;){if(b=e.c*a+e.s,e.r?b=Math.round(b):f>b&&b>-f&&(b=0),e.type)if(1===e.type)if(d=e.l,2===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2;else if(3===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3;else if(4===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4;else if(5===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4+e.xn4+e.xs5;else{for(c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}else-1===e.type?e.t[e.p]=e.xs0:e.setRatio&&e.setRatio(a);else e.t[e.p]=b+e.xs0;e=e._next}else for(;e;)2!==e.type?e.t[e.p]=e.b:e.setRatio(a),e=e._next;else for(;e;){if(2!==e.type)if(e.r&&-1!==e.type)if(b=Math.round(e.s+e.c),e.type){if(1===e.type){for(d=e.l,c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}}else e.t[e.p]=b+e.xs0;else e.t[e.p]=e.e;else e.setRatio(a);e=e._next}},j._enableTransforms=function(a){this._transform=this._transform||La(this._target,e,!0),this._transformType=this._transform.svg&&wa||!a&&3!==this._transformType?2:3};var Sa=function(a){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};j._addLazySet=function(a,b,c){var d=this._firstPT=new pa(a,b,0,0,this._firstPT,2);d.e=c,d.setRatio=Sa,d.data=this},j._linkCSSP=function(a,b,c,d){return a&&(b&&(b._prev=a),a._next&&(a._next._prev=a._prev),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next,d=!0),c?c._next=a:d||null!==this._firstPT||(this._firstPT=a),a._next=b,a._prev=c),a},j._kill=function(b){var c,d,e,f=b;if(b.autoAlpha||b.alpha){f={};for(d in b)f[d]=b[d];f.opacity=1,f.autoAlpha&&(f.visibility=1)}return b.className&&(c=this._classNamePT)&&(e=c.xfirst,e&&e._prev?this._linkCSSP(e._prev,c._next,e._prev._prev):e===this._firstPT&&(this._firstPT=c._next),c._next&&this._linkCSSP(c._next,c._next._next,e._prev),this._classNamePT=null),a.prototype._kill.call(this,f)};var Ta=function(a,b,c){var d,e,f,g;if(a.slice)for(e=a.length;--e>-1;)Ta(a[e],b,c);else for(d=a.childNodes,e=d.length;--e>-1;)f=d[e],g=f.type,f.style&&(b.push($(f)),c&&c.push(f)),1!==g&&9!==g&&11!==g||!f.childNodes.length||Ta(f,b,c)};return g.cascadeTo=function(a,c,d){var e,f,g,h,i=b.to(a,c,d),j=[i],k=[],l=[],m=[],n=b._internals.reservedProps;for(a=i._targets||i.target,Ta(a,k,m),i.render(c,!0,!0),Ta(a,l),i.render(0,!0,!0),i._enabled(!0),e=m.length;--e>-1;)if(f=_(m[e],k[e],l[e]),f.firstMPT){f=f.difs;for(g in d)n[g]&&(f[g]=d[g]);h={};for(g in f)h[g]=k[e][g];j.push(b.fromTo(m[e],c,h,f))}return j},a.activate([g]),g},!0),function(){var a=_gsScope._gsDefine.plugin({propName:"roundProps",version:"1.5",priority:-1,API:2,init:function(a,b,c){return this._tween=c,!0}}),b=function(a){for(;a;)a.f||a.blob||(a.r=1),a=a._next},c=a.prototype;c._onInitAllProps=function(){for(var a,c,d,e=this._tween,f=e.vars.roundProps.join?e.vars.roundProps:e.vars.roundProps.split(","),g=f.length,h={},i=e._propLookup.roundProps;--g>-1;)h[f[g]]=1;for(g=f.length;--g>-1;)for(a=f[g],c=e._firstPT;c;)d=c._next,c.pg?c.t._roundProps(h,!0):c.n===a&&(2===c.f&&c.t?b(c.t._firstPT):(this._add(c.t,a,c.s,c.c),d&&(d._prev=c._prev),c._prev?c._prev._next=d:e._firstPT===c&&(e._firstPT=d),c._next=c._prev=null,e._propLookup[a]=i)),c=d;return!1},c._add=function(a,b,c,d){this._addTween(a,b,c,c+d,b,!0),this._overwriteProps.push(b)}}(),function(){_gsScope._gsDefine.plugin({propName:"attr",API:2,version:"0.5.0",init:function(a,b,c){var d;if("function"!=typeof a.setAttribute)return!1;for(d in b)this._addTween(a,"setAttribute",a.getAttribute(d)+"",b[d]+"",d,!1,d),this._overwriteProps.push(d);return!0}})}(),_gsScope._gsDefine.plugin({propName:"directionalRotation",version:"0.2.1",API:2,init:function(a,b,c){"object"!=typeof b&&(b={rotation:b}),this.finals={};var d,e,f,g,h,i,j=b.useRadians===!0?2*Math.PI:360,k=1e-6;for(d in b)"useRadians"!==d&&(i=(b[d]+"").split("_"),e=i[0],f=parseFloat("function"!=typeof a[d]?a[d]:a[d.indexOf("set")||"function"!=typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]()),g=this.finals[d]="string"==typeof e&&"="===e.charAt(1)?f+parseInt(e.charAt(0)+"1",10)*Number(e.substr(2)):Number(e)||0,h=g-f,i.length&&(e=i.join("_"),-1!==e.indexOf("short")&&(h%=j,h!==h%(j/2)&&(h=0>h?h+j:h-j)),-1!==e.indexOf("_cw")&&0>h?h=(h+9999999999*j)%j-(h/j|0)*j:-1!==e.indexOf("ccw")&&h>0&&(h=(h-9999999999*j)%j-(h/j|0)*j)),(h>k||-k>h)&&(this._addTween(a,d,f,f+h,d),this._overwriteProps.push(d)));return!0},set:function(a){var b;if(1!==a)this._super.setRatio.call(this,a);else for(b=this._firstPT;b;)b.f?b.t[b.p](this.finals[b.p]):b.t[b.p]=this.finals[b.p],b=b._next}})._autoCSS=!0,_gsScope._gsDefine("easing.Back",["easing.Ease"],function(a){var b,c,d,e=_gsScope.GreenSockGlobals||_gsScope,f=e.com.greensock,g=2*Math.PI,h=Math.PI/2,i=f._class,j=function(b,c){var d=i("easing."+b,function(){},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,d},k=a.register||function(){},l=function(a,b,c,d,e){var f=i("easing."+a,{easeOut:new b,easeIn:new c,easeInOut:new d},!0);return k(f,a),f},m=function(a,b,c){this.t=a,this.v=b,c&&(this.next=c,c.prev=this,this.c=c.v-b,this.gap=c.t-a)},n=function(b,c){var d=i("easing."+b,function(a){this._p1=a||0===a?a:1.70158,this._p2=1.525*this._p1},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,e.config=function(a){return new d(a)},d},o=l("Back",n("BackOut",function(a){return(a-=1)*a*((this._p1+1)*a+this._p1)+1}),n("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),n("BackInOut",function(a){return(a*=2)<1?.5*a*a*((this._p2+1)*a-this._p2):.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)})),p=i("easing.SlowMo",function(a,b,c){b=b||0===b?b:.7,null==a?a=.7:a>1&&(a=1),this._p=1!==a?b:0,this._p1=(1-a)/2,this._p2=a,this._p3=this._p1+this._p2,this._calcEnd=c===!0},!0),q=p.prototype=new a;return q.constructor=p,q.getRatio=function(a){var b=a+(.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b},p.ease=new p(.7,.7),q.config=p.config=function(a,b,c){return new p(a,b,c)},b=i("easing.SteppedEase",function(a){a=a||1,this._p1=1/a,this._p2=a+1},!0),q=b.prototype=new a,q.constructor=b,q.getRatio=function(a){return 0>a?a=0:a>=1&&(a=.999999999),(this._p2*a>>0)*this._p1},q.config=b.config=function(a){return new b(a)},c=i("easing.RoughEase",function(b){b=b||{};for(var c,d,e,f,g,h,i=b.taper||"none",j=[],k=0,l=0|(b.points||20),n=l,o=b.randomize!==!1,p=b.clamp===!0,q=b.template instanceof a?b.template:null,r="number"==typeof b.strength?.4*b.strength:.4;--n>-1;)c=o?Math.random():1/l*n,d=q?q.getRatio(c):c,"none"===i?e=r:"out"===i?(f=1-c,e=f*f*r):"in"===i?e=c*c*r:.5>c?(f=2*c,e=f*f*.5*r):(f=2*(1-c),e=f*f*.5*r),o?d+=Math.random()*e-.5*e:n%2?d+=.5*e:d-=.5*e,p&&(d>1?d=1:0>d&&(d=0)),j[k++]={x:c,y:d};for(j.sort(function(a,b){return a.x-b.x}),h=new m(1,1,null),n=l;--n>-1;)g=j[n],h=new m(g.x,g.y,h);this._prev=new m(0,0,0!==h.t?h:h.next)},!0),q=c.prototype=new a,q.constructor=c,q.getRatio=function(a){var b=this._prev;if(a>b.t){for(;b.next&&a>=b.t;)b=b.next;b=b.prev}else for(;b.prev&&a<=b.t;)b=b.prev;return this._prev=b,b.v+(a-b.t)/b.gap*b.c},q.config=function(a){return new c(a)},c.ease=new c,l("Bounce",j("BounceOut",function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375}),j("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:2/2.75>a?1-(7.5625*(a-=1.5/2.75)*a+.75):2.5/2.75>a?1-(7.5625*(a-=2.25/2.75)*a+.9375):1-(7.5625*(a-=2.625/2.75)*a+.984375)}),j("BounceInOut",function(a){var b=.5>a;return a=b?1-2*a:2*a-1,a=1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375,b?.5*(1-a):.5*a+.5})),l("Circ",j("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),j("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),j("CircInOut",function(a){return(a*=2)<1?-.5*(Math.sqrt(1-a*a)-1):.5*(Math.sqrt(1-(a-=2)*a)+1)})),d=function(b,c,d){var e=i("easing."+b,function(a,b){this._p1=a>=1?a:1,this._p2=(b||d)/(1>a?a:1),this._p3=this._p2/g*(Math.asin(1/this._p1)||0),this._p2=g/this._p2},!0),f=e.prototype=new a;return f.constructor=e,f.getRatio=c,f.config=function(a,b){return new e(a,b)},e},l("Elastic",d("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*this._p2)+1},.3),d("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2))},.3),d("ElasticInOut",function(a){return(a*=2)<1?-.5*(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2)):this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*this._p2)*.5+1},.45)),l("Expo",j("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),j("ExpoIn",function(a){return Math.pow(2,10*(a-1))-.001}),j("ExpoInOut",function(a){return(a*=2)<1?.5*Math.pow(2,10*(a-1)):.5*(2-Math.pow(2,-10*(a-1)))})),l("Sine",j("SineOut",function(a){return Math.sin(a*h)}),j("SineIn",function(a){return-Math.cos(a*h)+1}),j("SineInOut",function(a){return-.5*(Math.cos(Math.PI*a)-1)})),i("easing.EaseLookup",{find:function(b){return a.map[b]}},!0),k(e.SlowMo,"SlowMo","ease,"),k(c,"RoughEase","ease,"),k(b,"SteppedEase","ease,"),o},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(a,b){"use strict";var c=a.GreenSockGlobals=a.GreenSockGlobals||a;if(!c.TweenLite){var d,e,f,g,h,i=function(a){var b,d=a.split("."),e=c;for(b=0;b<d.length;b++)e[d[b]]=e=e[d[b]]||{};return e},j=i("com.greensock"),k=1e-10,l=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},m=function(){},n=function(){var a=Object.prototype.toString,b=a.call([]);return function(c){return null!=c&&(c instanceof Array||"object"==typeof c&&!!c.push&&a.call(c)===b)}}(),o={},p=function(d,e,f,g){this.sc=o[d]?o[d].sc:[],o[d]=this,this.gsClass=null,this.func=f;var h=[];this.check=function(j){for(var k,l,m,n,q,r=e.length,s=r;--r>-1;)(k=o[e[r]]||new p(e[r],[])).gsClass?(h[r]=k.gsClass,s--):j&&k.sc.push(this);if(0===s&&f)for(l=("com.greensock."+d).split("."),m=l.pop(),n=i(l.join("."))[m]=this.gsClass=f.apply(f,h),g&&(c[m]=n,q="undefined"!=typeof module&&module.exports,!q&&"function"=="function"&&__webpack_require__(13)?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return n}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):d===b&&q&&(module.exports=n)),r=0;r<this.sc.length;r++)this.sc[r].check()},this.check(!0)},q=a._gsDefine=function(a,b,c,d){return new p(a,b,c,d)},r=j._class=function(a,b,c){return b=b||function(){},q(a,[],function(){return b},c),b};q.globals=c;var s=[0,0,1,1],t=[],u=r("easing.Ease",function(a,b,c,d){this._func=a,this._type=c||0,this._power=d||0,this._params=b?s.concat(b):s},!0),v=u.map={},w=u.register=function(a,b,c,d){for(var e,f,g,h,i=b.split(","),k=i.length,l=(c||"easeIn,easeOut,easeInOut").split(",");--k>-1;)for(f=i[k],e=d?r("easing."+f,null,!0):j.easing[f]||{},g=l.length;--g>-1;)h=l[g],v[f+"."+h]=v[h+f]=e[h]=a.getRatio?a:a[h]||new a};for(f=u.prototype,f._calcEnd=!1,f.getRatio=function(a){if(this._func)return this._params[0]=a,this._func.apply(null,this._params);var b=this._type,c=this._power,d=1===b?1-a:2===b?a:.5>a?2*a:2*(1-a);return 1===c?d*=d:2===c?d*=d*d:3===c?d*=d*d*d:4===c&&(d*=d*d*d*d),1===b?1-d:2===b?d:.5>a?d/2:1-d/2},d=["Linear","Quad","Cubic","Quart","Quint,Strong"],e=d.length;--e>-1;)f=d[e]+",Power"+e,w(new u(null,null,1,e),f,"easeOut",!0),w(new u(null,null,2,e),f,"easeIn"+(0===e?",easeNone":"")),w(new u(null,null,3,e),f,"easeInOut");v.linear=j.easing.Linear.easeIn,v.swing=j.easing.Quad.easeInOut;var x=r("events.EventDispatcher",function(a){this._listeners={},this._eventTarget=a||this});f=x.prototype,f.addEventListener=function(a,b,c,d,e){e=e||0;var f,i,j=this._listeners[a],k=0;for(null==j&&(this._listeners[a]=j=[]),i=j.length;--i>-1;)f=j[i],f.c===b&&f.s===c?j.splice(i,1):0===k&&f.pr<e&&(k=i+1);j.splice(k,0,{c:b,s:c,up:d,pr:e}),this!==g||h||g.wake()},f.removeEventListener=function(a,b){var c,d=this._listeners[a];if(d)for(c=d.length;--c>-1;)if(d[c].c===b)return void d.splice(c,1)},f.dispatchEvent=function(a){var b,c,d,e=this._listeners[a];if(e)for(b=e.length,c=this._eventTarget;--b>-1;)d=e[b],d&&(d.up?d.c.call(d.s||c,{type:a,target:c}):d.c.call(d.s||c))};var y=a.requestAnimationFrame,z=a.cancelAnimationFrame,A=Date.now||function(){return(new Date).getTime()},B=A();for(d=["ms","moz","webkit","o"],e=d.length;--e>-1&&!y;)y=a[d[e]+"RequestAnimationFrame"],z=a[d[e]+"CancelAnimationFrame"]||a[d[e]+"CancelRequestAnimationFrame"];r("Ticker",function(a,b){var c,d,e,f,i,j=this,l=A(),n=b!==!1&&y?"auto":!1,o=500,p=33,q="tick",r=function(a){var b,g,h=A()-B;h>o&&(l+=h-p),B+=h,j.time=(B-l)/1e3,b=j.time-i,(!c||b>0||a===!0)&&(j.frame++,i+=b+(b>=f?.004:f-b),g=!0),a!==!0&&(e=d(r)),g&&j.dispatchEvent(q)};x.call(j),j.time=j.frame=0,j.tick=function(){r(!0)},j.lagSmoothing=function(a,b){o=a||1/k,p=Math.min(b,o,0)},j.sleep=function(){null!=e&&(n&&z?z(e):clearTimeout(e),d=m,e=null,j===g&&(h=!1))},j.wake=function(a){null!==e?j.sleep():a?l+=-B+(B=A()):j.frame>10&&(B=A()-o+5),d=0===c?m:n&&y?y:function(a){return setTimeout(a,1e3*(i-j.time)+1|0)},j===g&&(h=!0),r(2)},j.fps=function(a){return arguments.length?(c=a,f=1/(c||60),i=this.time+f,void j.wake()):c},j.useRAF=function(a){return arguments.length?(j.sleep(),n=a,void j.fps(c)):n},j.fps(a),setTimeout(function(){"auto"===n&&j.frame<5&&"hidden"!==document.visibilityState&&j.useRAF(!1)},1500)}),f=j.Ticker.prototype=new j.events.EventDispatcher,f.constructor=j.Ticker;var C=r("core.Animation",function(a,b){if(this.vars=b=b||{},this._duration=this._totalDuration=a||0,this._delay=Number(b.delay)||0,this._timeScale=1,this._active=b.immediateRender===!0,this.data=b.data,this._reversed=b.reversed===!0,V){h||g.wake();var c=this.vars.useFrames?U:V;c.add(this,c._time),this.vars.paused&&this.paused(!0)}});g=C.ticker=new j.Ticker,f=C.prototype,f._dirty=f._gc=f._initted=f._paused=!1,f._totalTime=f._time=0,f._rawPrevTime=-1,f._next=f._last=f._onUpdate=f._timeline=f.timeline=null,f._paused=!1;var D=function(){h&&A()-B>2e3&&g.wake(),setTimeout(D,2e3)};D(),f.play=function(a,b){return null!=a&&this.seek(a,b),this.reversed(!1).paused(!1)},f.pause=function(a,b){return null!=a&&this.seek(a,b),this.paused(!0)},f.resume=function(a,b){return null!=a&&this.seek(a,b),this.paused(!1)},f.seek=function(a,b){return this.totalTime(Number(a),b!==!1)},f.restart=function(a,b){return this.reversed(!1).paused(!1).totalTime(a?-this._delay:0,b!==!1,!0)},f.reverse=function(a,b){return null!=a&&this.seek(a||this.totalDuration(),b),this.reversed(!0).paused(!1)},f.render=function(a,b,c){},f.invalidate=function(){return this._time=this._totalTime=0,this._initted=this._gc=!1,this._rawPrevTime=-1,(this._gc||!this.timeline)&&this._enabled(!0),this},f.isActive=function(){var a,b=this._timeline,c=this._startTime;return!b||!this._gc&&!this._paused&&b.isActive()&&(a=b.rawTime())>=c&&a<c+this.totalDuration()/this._timeScale},f._enabled=function(a,b){return h||g.wake(),this._gc=!a,this._active=this.isActive(),b!==!0&&(a&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!a&&this.timeline&&this._timeline._remove(this,!0)),!1},f._kill=function(a,b){return this._enabled(!1,!1)},f.kill=function(a,b){return this._kill(a,b),this},f._uncache=function(a){for(var b=a?this:this.timeline;b;)b._dirty=!0,b=b.timeline;return this},f._swapSelfInParams=function(a){for(var b=a.length,c=a.concat();--b>-1;)"{self}"===a[b]&&(c[b]=this);return c},f._callback=function(a){var b=this.vars;b[a].apply(b[a+"Scope"]||b.callbackScope||this,b[a+"Params"]||t)},f.eventCallback=function(a,b,c,d){if("on"===(a||"").substr(0,2)){var e=this.vars;if(1===arguments.length)return e[a];null==b?delete e[a]:(e[a]=b,e[a+"Params"]=n(c)&&-1!==c.join("").indexOf("{self}")?this._swapSelfInParams(c):c,e[a+"Scope"]=d),"onUpdate"===a&&(this._onUpdate=b)}return this},f.delay=function(a){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+a-this._delay),this._delay=a,this):this._delay},f.duration=function(a){return arguments.length?(this._duration=this._totalDuration=a,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==a&&this.totalTime(this._totalTime*(a/this._duration),!0),this):(this._dirty=!1,this._duration)},f.totalDuration=function(a){return this._dirty=!1,arguments.length?this.duration(a):this._totalDuration},f.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(a>this._duration?this._duration:a,b)):this._time},f.totalTime=function(a,b,c){if(h||g.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>a&&!c&&(a+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var d=this._totalDuration,e=this._timeline;if(a>d&&!c&&(a=d),this._startTime=(this._paused?this._pauseTime:e._time)-(this._reversed?d-a:a)/this._timeScale,e._dirty||this._uncache(!1),e._timeline)for(;e._timeline;)e._timeline._time!==(e._startTime+e._totalTime)/e._timeScale&&e.totalTime(e._totalTime,!0),e=e._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==a||0===this._duration)&&(I.length&&X(),this.render(a,b,!1),I.length&&X())}return this},f.progress=f.totalProgress=function(a,b){var c=this.duration();return arguments.length?this.totalTime(c*a,b):c?this._time/c:this.ratio},f.startTime=function(a){return arguments.length?(a!==this._startTime&&(this._startTime=a,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,a-this._delay)),this):this._startTime},f.endTime=function(a){return this._startTime+(0!=a?this.totalDuration():this.duration())/this._timeScale},f.timeScale=function(a){if(!arguments.length)return this._timeScale;if(a=a||k,this._timeline&&this._timeline.smoothChildTiming){var b=this._pauseTime,c=b||0===b?b:this._timeline.totalTime();this._startTime=c-(c-this._startTime)*this._timeScale/a}return this._timeScale=a,this._uncache(!1)},f.reversed=function(a){return arguments.length?(a!=this._reversed&&(this._reversed=a,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},f.paused=function(a){if(!arguments.length)return this._paused;var b,c,d=this._timeline;return a!=this._paused&&d&&(h||a||g.wake(),b=d.rawTime(),c=b-this._pauseTime,!a&&d.smoothChildTiming&&(this._startTime+=c,this._uncache(!1)),this._pauseTime=a?b:null,this._paused=a,this._active=this.isActive(),!a&&0!==c&&this._initted&&this.duration()&&(b=d.smoothChildTiming?this._totalTime:(b-this._startTime)/this._timeScale,this.render(b,b===this._totalTime,!0))),this._gc&&!a&&this._enabled(!0,!1),this};var E=r("core.SimpleTimeline",function(a){C.call(this,0,a),this.autoRemoveChildren=this.smoothChildTiming=!0});f=E.prototype=new C,f.constructor=E,f.kill()._gc=!1,f._first=f._last=f._recent=null,f._sortChildren=!1,f.add=f.insert=function(a,b,c,d){var e,f;if(a._startTime=Number(b||0)+a._delay,a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime+(this.rawTime()-a._startTime)/a._timeScale),a.timeline&&a.timeline._remove(a,!0),a.timeline=a._timeline=this,a._gc&&a._enabled(!0,!0),e=this._last,this._sortChildren)for(f=a._startTime;e&&e._startTime>f;)e=e._prev;return e?(a._next=e._next,e._next=a):(a._next=this._first,this._first=a),a._next?a._next._prev=a:this._last=a,a._prev=e,this._recent=a,this._timeline&&this._uncache(!0),this},f._remove=function(a,b){return a.timeline===this&&(b||a._enabled(!1,!0),a._prev?a._prev._next=a._next:this._first===a&&(this._first=a._next),a._next?a._next._prev=a._prev:this._last===a&&(this._last=a._prev),a._next=a._prev=a.timeline=null,a===this._recent&&(this._recent=this._last),this._timeline&&this._uncache(!0)),this},f.render=function(a,b,c){var d,e=this._first;for(this._totalTime=this._time=this._rawPrevTime=a;e;)d=e._next,(e._active||a>=e._startTime&&!e._paused)&&(e._reversed?e.render((e._dirty?e.totalDuration():e._totalDuration)-(a-e._startTime)*e._timeScale,b,c):e.render((a-e._startTime)*e._timeScale,b,c)),e=d},f.rawTime=function(){return h||g.wake(),this._totalTime};var F=r("TweenLite",function(b,c,d){if(C.call(this,c,d),this.render=F.prototype.render,null==b)throw"Cannot tween a null target.";this.target=b="string"!=typeof b?b:F.selector(b)||b;var e,f,g,h=b.jquery||b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType),i=this.vars.overwrite;if(this._overwrite=i=null==i?T[F.defaultOverwrite]:"number"==typeof i?i>>0:T[i],(h||b instanceof Array||b.push&&n(b))&&"number"!=typeof b[0])for(this._targets=g=l(b),this._propLookup=[],this._siblings=[],e=0;e<g.length;e++)f=g[e],f?"string"!=typeof f?f.length&&f!==a&&f[0]&&(f[0]===a||f[0].nodeType&&f[0].style&&!f.nodeType)?(g.splice(e--,1),this._targets=g=g.concat(l(f))):(this._siblings[e]=Y(f,this,!1),1===i&&this._siblings[e].length>1&&$(f,this,null,1,this._siblings[e])):(f=g[e--]=F.selector(f),"string"==typeof f&&g.splice(e+1,1)):g.splice(e--,1);else this._propLookup={},this._siblings=Y(b,this,!1),1===i&&this._siblings.length>1&&$(b,this,null,1,this._siblings);(this.vars.immediateRender||0===c&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-k,this.render(-this._delay))},!0),G=function(b){return b&&b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType)},H=function(a,b){var c,d={};for(c in a)S[c]||c in b&&"transform"!==c&&"x"!==c&&"y"!==c&&"width"!==c&&"height"!==c&&"className"!==c&&"border"!==c||!(!P[c]||P[c]&&P[c]._autoCSS)||(d[c]=a[c],delete a[c]);a.css=d};f=F.prototype=new C,f.constructor=F,f.kill()._gc=!1,f.ratio=0,f._firstPT=f._targets=f._overwrittenProps=f._startAt=null,f._notifyPluginsOfEnabled=f._lazy=!1,F.version="1.18.2",F.defaultEase=f._ease=new u(null,null,1,1),F.defaultOverwrite="auto",F.ticker=g,F.autoSleep=120,F.lagSmoothing=function(a,b){g.lagSmoothing(a,b)},F.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(F.selector=c,c(b)):"undefined"==typeof document?b:document.querySelectorAll?document.querySelectorAll(b):document.getElementById("#"===b.charAt(0)?b.substr(1):b)};var I=[],J={},K=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,L=function(a){for(var b,c=this._firstPT,d=1e-6;c;)b=c.blob?a?this.join(""):this.start:c.c*a+c.s,c.r?b=Math.round(b):d>b&&b>-d&&(b=0),c.f?c.fp?c.t[c.p](c.fp,b):c.t[c.p](b):c.t[c.p]=b,c=c._next},M=function(a,b,c,d){var e,f,g,h,i,j,k,l=[a,b],m=0,n="",o=0;for(l.start=a,c&&(c(l),a=l[0],b=l[1]),l.length=0,e=a.match(K)||[],f=b.match(K)||[],d&&(d._next=null,d.blob=1,l._firstPT=d),i=f.length,h=0;i>h;h++)k=f[h],j=b.substr(m,b.indexOf(k,m)-m),n+=j||!h?j:",",m+=j.length,o?o=(o+1)%5:"rgba("===j.substr(-5)&&(o=1),k===e[h]||e.length<=h?n+=k:(n&&(l.push(n),n=""),g=parseFloat(e[h]),l.push(g),l._firstPT={_next:l._firstPT,t:l,p:l.length-1,s:g,c:("="===k.charAt(1)?parseInt(k.charAt(0)+"1",10)*parseFloat(k.substr(2)):parseFloat(k)-g)||0,f:0,r:o&&4>o}),m+=k.length;return n+=b.substr(m),n&&l.push(n),l.setRatio=L,l},N=function(a,b,c,d,e,f,g,h){var i,j,k="get"===c?a[b]:c,l=typeof a[b],m="string"==typeof d&&"="===d.charAt(1),n={t:a,p:b,s:k,f:"function"===l,pg:0,n:e||b,r:f,pr:0,c:m?parseInt(d.charAt(0)+"1",10)*parseFloat(d.substr(2)):parseFloat(d)-k||0};return"number"!==l&&("function"===l&&"get"===c&&(j=b.indexOf("set")||"function"!=typeof a["get"+b.substr(3)]?b:"get"+b.substr(3),n.s=k=g?a[j](g):a[j]()),"string"==typeof k&&(g||isNaN(k))?(n.fp=g,i=M(k,d,h||F.defaultStringFilter,n),n={t:i,p:"setRatio",s:0,c:1,f:2,pg:0,n:e||b,pr:0}):m||(n.s=parseFloat(k),n.c=parseFloat(d)-n.s||0)),n.c?((n._next=this._firstPT)&&(n._next._prev=n),this._firstPT=n,n):void 0},O=F._internals={isArray:n,isSelector:G,lazyTweens:I,blobDif:M},P=F._plugins={},Q=O.tweenLookup={},R=0,S=O.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1,onOverwrite:1,callbackScope:1,stringFilter:1},T={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},U=C._rootFramesTimeline=new E,V=C._rootTimeline=new E,W=30,X=O.lazyRender=function(){
	var a,b=I.length;for(J={};--b>-1;)a=I[b],a&&a._lazy!==!1&&(a.render(a._lazy[0],a._lazy[1],!0),a._lazy=!1);I.length=0};V._startTime=g.time,U._startTime=g.frame,V._active=U._active=!0,setTimeout(X,1),C._updateRoot=F.render=function(){var a,b,c;if(I.length&&X(),V.render((g.time-V._startTime)*V._timeScale,!1,!1),U.render((g.frame-U._startTime)*U._timeScale,!1,!1),I.length&&X(),g.frame>=W){W=g.frame+(parseInt(F.autoSleep,10)||120);for(c in Q){for(b=Q[c].tweens,a=b.length;--a>-1;)b[a]._gc&&b.splice(a,1);0===b.length&&delete Q[c]}if(c=V._first,(!c||c._paused)&&F.autoSleep&&!U._first&&1===g._listeners.tick.length){for(;c&&c._paused;)c=c._next;c||g.sleep()}}},g.addEventListener("tick",C._updateRoot);var Y=function(a,b,c){var d,e,f=a._gsTweenID;if(Q[f||(a._gsTweenID=f="t"+R++)]||(Q[f]={target:a,tweens:[]}),b&&(d=Q[f].tweens,d[e=d.length]=b,c))for(;--e>-1;)d[e]===b&&d.splice(e,1);return Q[f].tweens},Z=function(a,b,c,d){var e,f,g=a.vars.onOverwrite;return g&&(e=g(a,b,c,d)),g=F.onOverwrite,g&&(f=g(a,b,c,d)),e!==!1&&f!==!1},$=function(a,b,c,d,e){var f,g,h,i;if(1===d||d>=4){for(i=e.length,f=0;i>f;f++)if((h=e[f])!==b)h._gc||h._kill(null,a,b)&&(g=!0);else if(5===d)break;return g}var j,l=b._startTime+k,m=[],n=0,o=0===b._duration;for(f=e.length;--f>-1;)(h=e[f])===b||h._gc||h._paused||(h._timeline!==b._timeline?(j=j||_(b,0,o),0===_(h,j,o)&&(m[n++]=h)):h._startTime<=l&&h._startTime+h.totalDuration()/h._timeScale>l&&((o||!h._initted)&&l-h._startTime<=2e-10||(m[n++]=h)));for(f=n;--f>-1;)if(h=m[f],2===d&&h._kill(c,a,b)&&(g=!0),2!==d||!h._firstPT&&h._initted){if(2!==d&&!Z(h,b))continue;h._enabled(!1,!1)&&(g=!0)}return g},_=function(a,b,c){for(var d=a._timeline,e=d._timeScale,f=a._startTime;d._timeline;){if(f+=d._startTime,e*=d._timeScale,d._paused)return-100;d=d._timeline}return f/=e,f>b?f-b:c&&f===b||!a._initted&&2*k>f-b?k:(f+=a.totalDuration()/a._timeScale/e)>b+k?0:f-b-k};f._init=function(){var a,b,c,d,e,f=this.vars,g=this._overwrittenProps,h=this._duration,i=!!f.immediateRender,j=f.ease;if(f.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),e={};for(d in f.startAt)e[d]=f.startAt[d];if(e.overwrite=!1,e.immediateRender=!0,e.lazy=i&&f.lazy!==!1,e.startAt=e.delay=null,this._startAt=F.to(this.target,0,e),i)if(this._time>0)this._startAt=null;else if(0!==h)return}else if(f.runBackwards&&0!==h)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{0!==this._time&&(i=!1),c={};for(d in f)S[d]&&"autoCSS"!==d||(c[d]=f[d]);if(c.overwrite=0,c.data="isFromStart",c.lazy=i&&f.lazy!==!1,c.immediateRender=i,this._startAt=F.to(this.target,0,c),i){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1),this.vars.immediateRender&&(this._startAt=null)}if(this._ease=j=j?j instanceof u?j:"function"==typeof j?new u(j,f.easeParams):v[j]||F.defaultEase:F.defaultEase,f.easeParams instanceof Array&&j.config&&(this._ease=j.config.apply(j,f.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(a=this._targets.length;--a>-1;)this._initProps(this._targets[a],this._propLookup[a]={},this._siblings[a],g?g[a]:null)&&(b=!0);else b=this._initProps(this.target,this._propLookup,this._siblings,g);if(b&&F._onPluginEvent("_onInitAllProps",this),g&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),f.runBackwards)for(c=this._firstPT;c;)c.s+=c.c,c.c=-c.c,c=c._next;this._onUpdate=f.onUpdate,this._initted=!0},f._initProps=function(b,c,d,e){var f,g,h,i,j,k;if(null==b)return!1;J[b._gsTweenID]&&X(),this.vars.css||b.style&&b!==a&&b.nodeType&&P.css&&this.vars.autoCSS!==!1&&H(this.vars,b);for(f in this.vars)if(k=this.vars[f],S[f])k&&(k instanceof Array||k.push&&n(k))&&-1!==k.join("").indexOf("{self}")&&(this.vars[f]=k=this._swapSelfInParams(k,this));else if(P[f]&&(i=new P[f])._onInitTween(b,this.vars[f],this)){for(this._firstPT=j={_next:this._firstPT,t:i,p:"setRatio",s:0,c:1,f:1,n:f,pg:1,pr:i._priority},g=i._overwriteProps.length;--g>-1;)c[i._overwriteProps[g]]=this._firstPT;(i._priority||i._onInitAllProps)&&(h=!0),(i._onDisable||i._onEnable)&&(this._notifyPluginsOfEnabled=!0),j._next&&(j._next._prev=j)}else c[f]=N.call(this,b,f,"get",k,f,0,null,this.vars.stringFilter);return e&&this._kill(e,b)?this._initProps(b,c,d,e):this._overwrite>1&&this._firstPT&&d.length>1&&$(b,this,c,this._overwrite,d)?(this._kill(c,b),this._initProps(b,c,d,e)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(J[b._gsTweenID]=!0),h)},f.render=function(a,b,c){var d,e,f,g,h=this._time,i=this._duration,j=this._rawPrevTime;if(a>=i-1e-7)this._totalTime=this._time=i,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===i&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>j||0>=a&&a>=-1e-7||j===k&&"isPause"!==this.data)&&j!==a&&(c=!0,j>k&&(e="onReverseComplete")),this._rawPrevTime=g=!b||a||j===a?a:k);else if(1e-7>a)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==h||0===i&&j>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===i&&(this._initted||!this.vars.lazy||c)&&(j>=0&&(j!==k||"isPause"!==this.data)&&(c=!0),this._rawPrevTime=g=!b||a||j===a?a:k)),this._initted||(c=!0);else if(this._totalTime=this._time=a,this._easeType){var l=a/i,m=this._easeType,n=this._easePower;(1===m||3===m&&l>=.5)&&(l=1-l),3===m&&(l*=2),1===n?l*=l:2===n?l*=l*l:3===n?l*=l*l*l:4===n&&(l*=l*l*l*l),1===m?this.ratio=1-l:2===m?this.ratio=l:.5>a/i?this.ratio=l/2:this.ratio=1-l/2}else this.ratio=this._ease.getRatio(a/i);if(this._time!==h||c){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=h,this._rawPrevTime=j,I.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/i):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==h&&a>=0&&(this._active=!0),0===h&&(this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._time||0===i)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&a!==-1e-4&&this._startAt.render(a,b,c),b||(this._time!==h||d)&&this._callback("onUpdate")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&a!==-1e-4&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===i&&this._rawPrevTime===k&&g!==k&&(this._rawPrevTime=0))}},f._kill=function(a,b,c){if("all"===a&&(a=null),null==a&&(null==b||b===this.target))return this._lazy=!1,this._enabled(!1,!1);b="string"!=typeof b?b||this._targets||this.target:F.selector(b)||b;var d,e,f,g,h,i,j,k,l,m=c&&this._time&&c._startTime===this._startTime&&this._timeline===c._timeline;if((n(b)||G(b))&&"number"!=typeof b[0])for(d=b.length;--d>-1;)this._kill(a,b[d],c)&&(i=!0);else{if(this._targets){for(d=this._targets.length;--d>-1;)if(b===this._targets[d]){h=this._propLookup[d]||{},this._overwrittenProps=this._overwrittenProps||[],e=this._overwrittenProps[d]=a?this._overwrittenProps[d]||{}:"all";break}}else{if(b!==this.target)return!1;h=this._propLookup,e=this._overwrittenProps=a?this._overwrittenProps||{}:"all"}if(h){if(j=a||h,k=a!==e&&"all"!==e&&a!==h&&("object"!=typeof a||!a._tempKill),c&&(F.onOverwrite||this.vars.onOverwrite)){for(f in j)h[f]&&(l||(l=[]),l.push(f));if((l||!a)&&!Z(this,c,b,l))return!1}for(f in j)(g=h[f])&&(m&&(g.f?g.t[g.p](g.s):g.t[g.p]=g.s,i=!0),g.pg&&g.t._kill(j)&&(i=!0),g.pg&&0!==g.t._overwriteProps.length||(g._prev?g._prev._next=g._next:g===this._firstPT&&(this._firstPT=g._next),g._next&&(g._next._prev=g._prev),g._next=g._prev=null),delete h[f]),k&&(e[f]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return i},f.invalidate=function(){return this._notifyPluginsOfEnabled&&F._onPluginEvent("_onDisable",this),this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null,this._notifyPluginsOfEnabled=this._active=this._lazy=!1,this._propLookup=this._targets?{}:[],C.prototype.invalidate.call(this),this.vars.immediateRender&&(this._time=-k,this.render(-this._delay)),this},f._enabled=function(a,b){if(h||g.wake(),a&&this._gc){var c,d=this._targets;if(d)for(c=d.length;--c>-1;)this._siblings[c]=Y(d[c],this,!0);else this._siblings=Y(this.target,this,!0)}return C.prototype._enabled.call(this,a,b),this._notifyPluginsOfEnabled&&this._firstPT?F._onPluginEvent(a?"_onEnable":"_onDisable",this):!1},F.to=function(a,b,c){return new F(a,b,c)},F.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new F(a,b,c)},F.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new F(a,b,d)},F.delayedCall=function(a,b,c,d,e){return new F(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,lazy:!1,useFrames:e,overwrite:0})},F.set=function(a,b){return new F(a,0,b)},F.getTweensOf=function(a,b){if(null==a)return[];a="string"!=typeof a?a:F.selector(a)||a;var c,d,e,f;if((n(a)||G(a))&&"number"!=typeof a[0]){for(c=a.length,d=[];--c>-1;)d=d.concat(F.getTweensOf(a[c],b));for(c=d.length;--c>-1;)for(f=d[c],e=c;--e>-1;)f===d[e]&&d.splice(c,1)}else for(d=Y(a).concat(),c=d.length;--c>-1;)(d[c]._gc||b&&!d[c].isActive())&&d.splice(c,1);return d},F.killTweensOf=F.killDelayedCallsTo=function(a,b,c){"object"==typeof b&&(c=b,b=!1);for(var d=F.getTweensOf(a,b),e=d.length;--e>-1;)d[e]._kill(c,a)};var aa=r("plugins.TweenPlugin",function(a,b){this._overwriteProps=(a||"").split(","),this._propName=this._overwriteProps[0],this._priority=b||0,this._super=aa.prototype},!0);if(f=aa.prototype,aa.version="1.18.0",aa.API=2,f._firstPT=null,f._addTween=N,f.setRatio=L,f._kill=function(a){var b,c=this._overwriteProps,d=this._firstPT;if(null!=a[this._propName])this._overwriteProps=[];else for(b=c.length;--b>-1;)null!=a[c[b]]&&c.splice(b,1);for(;d;)null!=a[d.n]&&(d._next&&(d._next._prev=d._prev),d._prev?(d._prev._next=d._next,d._prev=null):this._firstPT===d&&(this._firstPT=d._next)),d=d._next;return!1},f._roundProps=function(a,b){for(var c=this._firstPT;c;)(a[this._propName]||null!=c.n&&a[c.n.split(this._propName+"_").join("")])&&(c.r=b),c=c._next},F._onPluginEvent=function(a,b){var c,d,e,f,g,h=b._firstPT;if("_onInitAllProps"===a){for(;h;){for(g=h._next,d=e;d&&d.pr>h.pr;)d=d._next;(h._prev=d?d._prev:f)?h._prev._next=h:e=h,(h._next=d)?d._prev=h:f=h,h=g}h=b._firstPT=e}for(;h;)h.pg&&"function"==typeof h.t[a]&&h.t[a]()&&(c=!0),h=h._next;return c},aa.activate=function(a){for(var b=a.length;--b>-1;)a[b].API===aa.API&&(P[(new a[b])._propName]=a[b]);return!0},q.plugin=function(a){if(!(a&&a.propName&&a.init&&a.API))throw"illegal plugin definition.";var b,c=a.propName,d=a.priority||0,e=a.overwriteProps,f={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_roundProps",initAll:"_onInitAllProps"},g=r("plugins."+c.charAt(0).toUpperCase()+c.substr(1)+"Plugin",function(){aa.call(this,c,d),this._overwriteProps=e||[]},a.global===!0),h=g.prototype=new aa(c);h.constructor=g,g.API=a.API;for(b in f)"function"==typeof a[b]&&(h[f[b]]=a[b]);return g.version=a.version,aa.activate([g]),g},d=a._gsQueue){for(e=0;e<d.length;e++)d[e]();for(f in o)o[f].func||a.console.log("GSAP encountered missing dependency: com.greensock."+f)}h=!1}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenMax");
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 13 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * VERSION: 1.18.2
	 * DATE: 2015-12-22
	 * UPDATES AND DOCS AT: http://greensock.com
	 *
	 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
	 * This work is subject to the terms at http://greensock.com/standard-license or for
	 * Club GreenSock members, the software agreement that was issued with your membership.
	 * 
	 * @author: Jack Doyle, jack@greensock.com
	 */
	var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(a,b,c){var d=function(b){a.call(this,b),this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._dirty=!0},e=1e-10,f=b._internals,g=f.lazyTweens,h=f.lazyRender,i=new c(null,null,1,0),j=d.prototype=new a;return j.constructor=d,j.kill()._gc=!1,d.version="1.18.2",j.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),a.prototype.invalidate.call(this)},j.addCallback=function(a,c,d,e){return this.add(b.delayedCall(0,a,d,e),c)},j.removeCallback=function(a,b){if(a)if(null==b)this._kill(null,a);else for(var c=this.getTweensOf(a,!1),d=c.length,e=this._parseTimeOrLabel(b);--d>-1;)c[d]._startTime===e&&c[d]._enabled(!1,!1);return this},j.removePause=function(b){return this.removeCallback(a._internals.pauseCallback,b)},j.tweenTo=function(a,c){c=c||{};var d,e,f,g={ease:i,useFrames:this.usesFrames(),immediateRender:!1};for(e in c)g[e]=c[e];return g.time=this._parseTimeOrLabel(a),d=Math.abs(Number(g.time)-this._time)/this._timeScale||.001,f=new b(this,d,g),g.onStart=function(){f.target.paused(!0),f.vars.time!==f.target.time()&&d===f.duration()&&f.duration(Math.abs(f.vars.time-f.target.time())/f.target._timeScale),c.onStart&&f._callback("onStart")},f},j.tweenFromTo=function(a,b,c){c=c||{},a=this._parseTimeOrLabel(a),c.startAt={onComplete:this.seek,onCompleteParams:[a],callbackScope:this},c.immediateRender=c.immediateRender!==!1;var d=this.tweenTo(b,c);return d.duration(Math.abs(d.vars.time-a)/this._timeScale||.001)},j.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,i,j,k,l,m,n,o=this._dirty?this.totalDuration():this._totalDuration,p=this._duration,q=this._time,r=this._totalTime,s=this._startTime,t=this._timeScale,u=this._rawPrevTime,v=this._paused,w=this._cycle;if(a>=o-1e-7)this._locked||(this._totalTime=o,this._cycle=this._repeat),this._reversed||this._hasPausedChild()||(f=!0,j="onComplete",k=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||0>u||u===e)&&u!==a&&this._first&&(k=!0,u>e&&(j="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,this._yoyo&&0!==(1&this._cycle)?this._time=a=0:(this._time=p,a=p+1e-4);else if(1e-7>a)if(this._locked||(this._totalTime=this._cycle=0),this._time=0,(0!==q||0===p&&u!==e&&(u>0||0>a&&u>=0)&&!this._locked)&&(j="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(k=f=!0,j="onReverseComplete"):u>=0&&this._first&&(k=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=p||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(k=!0)}else if(0===p&&0>u&&(k=!0),this._time=this._rawPrevTime=a,this._locked||(this._totalTime=a,0!==this._repeat&&(l=p+this._repeatDelay,this._cycle=this._totalTime/l>>0,0!==this._cycle&&this._cycle===this._totalTime/l&&this._cycle--,this._time=this._totalTime-this._cycle*l,this._yoyo&&0!==(1&this._cycle)&&(this._time=p-this._time),this._time>p?(this._time=p,a=p+1e-4):this._time<0?this._time=a=0:a=this._time)),this._hasPause&&!this._forcingPlayhead&&!b){if(a=this._time,a>=q)for(d=this._first;d&&d._startTime<=a&&!m;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(m=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!m;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(m=d),d=d._prev;m&&(this._time=a=m._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}if(this._cycle!==w&&!this._locked){var x=this._yoyo&&0!==(1&w),y=x===(this._yoyo&&0!==(1&this._cycle)),z=this._totalTime,A=this._cycle,B=this._rawPrevTime,C=this._time;if(this._totalTime=w*p,this._cycle<w?x=!x:this._totalTime+=p,this._time=q,this._rawPrevTime=0===p?u-1e-4:u,this._cycle=w,this._locked=!0,q=x?0:p,this.render(q,b,0===p),b||this._gc||this.vars.onRepeat&&this._callback("onRepeat"),q!==this._time)return;if(y&&(q=x?p+1e-4:-1e-4,this.render(q,!0,!1)),this._locked=!1,this._paused&&!v)return;this._time=C,this._totalTime=z,this._cycle=A,this._rawPrevTime=B}if(!(this._time!==q&&this._first||c||k||m))return void(r!==this._totalTime&&this._onUpdate&&(b||this._callback("onUpdate")));if(this._initted||(this._initted=!0),this._active||!this._paused&&this._totalTime!==r&&a>0&&(this._active=!0),0===r&&this.vars.onStart&&0!==this._totalTime&&(b||this._callback("onStart")),n=this._time,n>=q)for(d=this._first;d&&(i=d._next,n===this._time&&(!this._paused||v));)(d._active||d._startTime<=this._time&&!d._paused&&!d._gc)&&(m===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=i;else for(d=this._last;d&&(i=d._prev,n===this._time&&(!this._paused||v));){if(d._active||d._startTime<=q&&!d._paused&&!d._gc){if(m===d){for(m=d._prev;m&&m.endTime()>this._time;)m.render(m._reversed?m.totalDuration()-(a-m._startTime)*m._timeScale:(a-m._startTime)*m._timeScale,b,c),m=m._prev;m=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=i}this._onUpdate&&(b||(g.length&&h(),this._callback("onUpdate"))),j&&(this._locked||this._gc||(s===this._startTime||t!==this._timeScale)&&(0===this._time||o>=this.totalDuration())&&(f&&(g.length&&h(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[j]&&this._callback(j)))},j.getActive=function(a,b,c){null==a&&(a=!0),null==b&&(b=!0),null==c&&(c=!1);var d,e,f=[],g=this.getChildren(a,b,c),h=0,i=g.length;for(d=0;i>d;d++)e=g[d],e.isActive()&&(f[h++]=e);return f},j.getLabelAfter=function(a){a||0!==a&&(a=this._time);var b,c=this.getLabelsArray(),d=c.length;for(b=0;d>b;b++)if(c[b].time>a)return c[b].name;return null},j.getLabelBefore=function(a){null==a&&(a=this._time);for(var b=this.getLabelsArray(),c=b.length;--c>-1;)if(b[c].time<a)return b[c].name;return null},j.getLabelsArray=function(){var a,b=[],c=0;for(a in this._labels)b[c++]={time:this._labels[a],name:a};return b.sort(function(a,b){return a.time-b.time}),b},j.progress=function(a,b){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),b):this._time/this.duration()},j.totalProgress=function(a,b){return arguments.length?this.totalTime(this.totalDuration()*a,b):this._totalTime/this.totalDuration()},j.totalDuration=function(b){return arguments.length?-1!==this._repeat&&b?this.timeScale(this.totalDuration()/b):this:(this._dirty&&(a.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration)},j.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),a>this._duration&&(a=this._duration),this._yoyo&&0!==(1&this._cycle)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(a,b)):this._time},j.repeat=function(a){return arguments.length?(this._repeat=a,this._uncache(!0)):this._repeat},j.repeatDelay=function(a){return arguments.length?(this._repeatDelay=a,this._uncache(!0)):this._repeatDelay},j.yoyo=function(a){return arguments.length?(this._yoyo=a,this):this._yoyo},j.currentLabel=function(a){return arguments.length?this.seek(a,!0):this.getLabelBefore(this._time+1e-8)},d},!0),_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(a,b,c){var d=function(a){b.call(this,a),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var c,d,e=this.vars;for(d in e)c=e[d],i(c)&&-1!==c.join("").indexOf("{self}")&&(e[d]=this._swapSelfInParams(c));i(e.tweens)&&this.add(e.tweens,0,e.align,e.stagger)},e=1e-10,f=c._internals,g=d._internals={},h=f.isSelector,i=f.isArray,j=f.lazyTweens,k=f.lazyRender,l=_gsScope._gsDefine.globals,m=function(a){var b,c={};for(b in a)c[b]=a[b];return c},n=function(a,b,c){var d,e,f=a.cycle;for(d in f)e=f[d],a[d]="function"==typeof e?e.call(b[c],c):e[c%e.length];delete a.cycle},o=g.pauseCallback=function(){},p=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},q=d.prototype=new b;return d.version="1.18.2",q.constructor=d,q.kill()._gc=q._forcingPlayhead=q._hasPause=!1,q.to=function(a,b,d,e){var f=d.repeat&&l.TweenMax||c;return b?this.add(new f(a,b,d),e):this.set(a,d,e)},q.from=function(a,b,d,e){return this.add((d.repeat&&l.TweenMax||c).from(a,b,d),e)},q.fromTo=function(a,b,d,e,f){var g=e.repeat&&l.TweenMax||c;return b?this.add(g.fromTo(a,b,d,e),f):this.set(a,e,f)},q.staggerTo=function(a,b,e,f,g,i,j,k){var l,o,q=new d({onComplete:i,onCompleteParams:j,callbackScope:k,smoothChildTiming:this.smoothChildTiming}),r=e.cycle;for("string"==typeof a&&(a=c.selector(a)||a),a=a||[],h(a)&&(a=p(a)),f=f||0,0>f&&(a=p(a),a.reverse(),f*=-1),o=0;o<a.length;o++)l=m(e),l.startAt&&(l.startAt=m(l.startAt),l.startAt.cycle&&n(l.startAt,a,o)),r&&n(l,a,o),q.to(a[o],b,l,o*f);return this.add(q,g)},q.staggerFrom=function(a,b,c,d,e,f,g,h){return c.immediateRender=0!=c.immediateRender,c.runBackwards=!0,this.staggerTo(a,b,c,d,e,f,g,h)},q.staggerFromTo=function(a,b,c,d,e,f,g,h,i){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,this.staggerTo(a,b,d,e,f,g,h,i)},q.call=function(a,b,d,e){return this.add(c.delayedCall(0,a,b,d),e)},q.set=function(a,b,d){return d=this._parseTimeOrLabel(d,0,!0),null==b.immediateRender&&(b.immediateRender=d===this._time&&!this._paused),this.add(new c(a,0,b),d)},d.exportRoot=function(a,b){a=a||{},null==a.smoothChildTiming&&(a.smoothChildTiming=!0);var e,f,g=new d(a),h=g._timeline;for(null==b&&(b=!0),h._remove(g,!0),g._startTime=0,g._rawPrevTime=g._time=g._totalTime=h._time,e=h._first;e;)f=e._next,b&&e instanceof c&&e.target===e.vars.onComplete||g.add(e,e._startTime-e._delay),e=f;return h.add(g,0),g},q.add=function(e,f,g,h){var j,k,l,m,n,o;if("number"!=typeof f&&(f=this._parseTimeOrLabel(f,0,!0,e)),!(e instanceof a)){if(e instanceof Array||e&&e.push&&i(e)){for(g=g||"normal",h=h||0,j=f,k=e.length,l=0;k>l;l++)i(m=e[l])&&(m=new d({tweens:m})),this.add(m,j),"string"!=typeof m&&"function"!=typeof m&&("sequence"===g?j=m._startTime+m.totalDuration()/m._timeScale:"start"===g&&(m._startTime-=m.delay())),j+=h;return this._uncache(!0)}if("string"==typeof e)return this.addLabel(e,f);if("function"!=typeof e)throw"Cannot add "+e+" into the timeline; it is not a tween, timeline, function, or string.";e=c.delayedCall(0,e)}if(b.prototype.add.call(this,e,f),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(n=this,o=n.rawTime()>e._startTime;n._timeline;)o&&n._timeline.smoothChildTiming?n.totalTime(n._totalTime,!0):n._gc&&n._enabled(!0,!1),n=n._timeline;return this},q.remove=function(b){if(b instanceof a){this._remove(b,!1);var c=b._timeline=b.vars.useFrames?a._rootFramesTimeline:a._rootTimeline;return b._startTime=(b._paused?b._pauseTime:c._time)-(b._reversed?b.totalDuration()-b._totalTime:b._totalTime)/b._timeScale,this}if(b instanceof Array||b&&b.push&&i(b)){for(var d=b.length;--d>-1;)this.remove(b[d]);return this}return"string"==typeof b?this.removeLabel(b):this.kill(null,b)},q._remove=function(a,c){b.prototype._remove.call(this,a,c);var d=this._last;return d?this._time>d._startTime+d._totalDuration/d._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},q.append=function(a,b){return this.add(a,this._parseTimeOrLabel(null,b,!0,a))},q.insert=q.insertMultiple=function(a,b,c,d){return this.add(a,b||0,c,d)},q.appendMultiple=function(a,b,c,d){return this.add(a,this._parseTimeOrLabel(null,b,!0,a),c,d)},q.addLabel=function(a,b){return this._labels[a]=this._parseTimeOrLabel(b),this},q.addPause=function(a,b,d,e){var f=c.delayedCall(0,o,d,e||this);return f.vars.onComplete=f.vars.onReverseComplete=b,f.data="isPause",this._hasPause=!0,this.add(f,a)},q.removeLabel=function(a){return delete this._labels[a],this},q.getLabelTime=function(a){return null!=this._labels[a]?this._labels[a]:-1},q._parseTimeOrLabel=function(b,c,d,e){var f;if(e instanceof a&&e.timeline===this)this.remove(e);else if(e&&(e instanceof Array||e.push&&i(e)))for(f=e.length;--f>-1;)e[f]instanceof a&&e[f].timeline===this&&this.remove(e[f]);if("string"==typeof c)return this._parseTimeOrLabel(c,d&&"number"==typeof b&&null==this._labels[c]?b-this.duration():0,d);if(c=c||0,"string"!=typeof b||!isNaN(b)&&null==this._labels[b])null==b&&(b=this.duration());else{if(f=b.indexOf("="),-1===f)return null==this._labels[b]?d?this._labels[b]=this.duration()+c:c:this._labels[b]+c;c=parseInt(b.charAt(f-1)+"1",10)*Number(b.substr(f+1)),b=f>1?this._parseTimeOrLabel(b.substr(0,f-1),0,d):this.duration()}return Number(b)+c},q.seek=function(a,b){return this.totalTime("number"==typeof a?a:this._parseTimeOrLabel(a),b!==!1)},q.stop=function(){return this.paused(!0)},q.gotoAndPlay=function(a,b){return this.play(a,b)},q.gotoAndStop=function(a,b){return this.pause(a,b)},q.render=function(a,b,c){this._gc&&this._enabled(!0,!1);var d,f,g,h,i,l,m,n=this._dirty?this.totalDuration():this._totalDuration,o=this._time,p=this._startTime,q=this._timeScale,r=this._paused;if(a>=n-1e-7)this._totalTime=this._time=n,this._reversed||this._hasPausedChild()||(f=!0,h="onComplete",i=!!this._timeline.autoRemoveChildren,0===this._duration&&(0>=a&&a>=-1e-7||this._rawPrevTime<0||this._rawPrevTime===e)&&this._rawPrevTime!==a&&this._first&&(i=!0,this._rawPrevTime>e&&(h="onReverseComplete"))),this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,a=n+1e-4;else if(1e-7>a)if(this._totalTime=this._time=0,(0!==o||0===this._duration&&this._rawPrevTime!==e&&(this._rawPrevTime>0||0>a&&this._rawPrevTime>=0))&&(h="onReverseComplete",f=this._reversed),0>a)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(i=f=!0,h="onReverseComplete"):this._rawPrevTime>=0&&this._first&&(i=!0),this._rawPrevTime=a;else{if(this._rawPrevTime=this._duration||!b||a||this._rawPrevTime===a?a:e,0===a&&f)for(d=this._first;d&&0===d._startTime;)d._duration||(f=!1),d=d._next;a=0,this._initted||(i=!0)}else{if(this._hasPause&&!this._forcingPlayhead&&!b){if(a>=o)for(d=this._first;d&&d._startTime<=a&&!l;)d._duration||"isPause"!==d.data||d.ratio||0===d._startTime&&0===this._rawPrevTime||(l=d),d=d._next;else for(d=this._last;d&&d._startTime>=a&&!l;)d._duration||"isPause"===d.data&&d._rawPrevTime>0&&(l=d),d=d._prev;l&&(this._time=a=l._startTime,this._totalTime=a+this._cycle*(this._totalDuration+this._repeatDelay))}this._totalTime=this._time=this._rawPrevTime=a}if(this._time!==o&&this._first||c||i||l){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==o&&a>0&&(this._active=!0),0===o&&this.vars.onStart&&0!==this._time&&(b||this._callback("onStart")),m=this._time,m>=o)for(d=this._first;d&&(g=d._next,m===this._time&&(!this._paused||r));)(d._active||d._startTime<=m&&!d._paused&&!d._gc)&&(l===d&&this.pause(),d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)),d=g;else for(d=this._last;d&&(g=d._prev,m===this._time&&(!this._paused||r));){if(d._active||d._startTime<=o&&!d._paused&&!d._gc){if(l===d){for(l=d._prev;l&&l.endTime()>this._time;)l.render(l._reversed?l.totalDuration()-(a-l._startTime)*l._timeScale:(a-l._startTime)*l._timeScale,b,c),l=l._prev;l=null,this.pause()}d._reversed?d.render((d._dirty?d.totalDuration():d._totalDuration)-(a-d._startTime)*d._timeScale,b,c):d.render((a-d._startTime)*d._timeScale,b,c)}d=g}this._onUpdate&&(b||(j.length&&k(),this._callback("onUpdate"))),h&&(this._gc||(p===this._startTime||q!==this._timeScale)&&(0===this._time||n>=this.totalDuration())&&(f&&(j.length&&k(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[h]&&this._callback(h)))}},q._hasPausedChild=function(){for(var a=this._first;a;){if(a._paused||a instanceof d&&a._hasPausedChild())return!0;a=a._next}return!1},q.getChildren=function(a,b,d,e){e=e||-9999999999;for(var f=[],g=this._first,h=0;g;)g._startTime<e||(g instanceof c?b!==!1&&(f[h++]=g):(d!==!1&&(f[h++]=g),a!==!1&&(f=f.concat(g.getChildren(!0,b,d)),h=f.length))),g=g._next;return f},q.getTweensOf=function(a,b){var d,e,f=this._gc,g=[],h=0;for(f&&this._enabled(!0,!0),d=c.getTweensOf(a),e=d.length;--e>-1;)(d[e].timeline===this||b&&this._contains(d[e]))&&(g[h++]=d[e]);return f&&this._enabled(!1,!0),g},q.recent=function(){return this._recent},q._contains=function(a){for(var b=a.timeline;b;){if(b===this)return!0;b=b.timeline}return!1},q.shiftChildren=function(a,b,c){c=c||0;for(var d,e=this._first,f=this._labels;e;)e._startTime>=c&&(e._startTime+=a),e=e._next;if(b)for(d in f)f[d]>=c&&(f[d]+=a);return this._uncache(!0)},q._kill=function(a,b){if(!a&&!b)return this._enabled(!1,!1);for(var c=b?this.getTweensOf(b):this.getChildren(!0,!0,!1),d=c.length,e=!1;--d>-1;)c[d]._kill(a,b)&&(e=!0);return e},q.clear=function(a){var b=this.getChildren(!1,!0,!0),c=b.length;for(this._time=this._totalTime=0;--c>-1;)b[c]._enabled(!1,!1);return a!==!1&&(this._labels={}),this._uncache(!0)},q.invalidate=function(){for(var b=this._first;b;)b.invalidate(),b=b._next;return a.prototype.invalidate.call(this)},q._enabled=function(a,c){if(a===this._gc)for(var d=this._first;d;)d._enabled(a,!0),d=d._next;return b.prototype._enabled.call(this,a,c)},q.totalTime=function(b,c,d){this._forcingPlayhead=!0;var e=a.prototype.totalTime.apply(this,arguments);return this._forcingPlayhead=!1,e},q.duration=function(a){return arguments.length?(0!==this.duration()&&0!==a&&this.timeScale(this._duration/a),this):(this._dirty&&this.totalDuration(),this._duration)},q.totalDuration=function(a){if(!arguments.length){if(this._dirty){for(var b,c,d=0,e=this._last,f=999999999999;e;)b=e._prev,e._dirty&&e.totalDuration(),e._startTime>f&&this._sortChildren&&!e._paused?this.add(e,e._startTime-e._delay):f=e._startTime,e._startTime<0&&!e._paused&&(d-=e._startTime,this._timeline.smoothChildTiming&&(this._startTime+=e._startTime/this._timeScale),this.shiftChildren(-e._startTime,!1,-9999999999),f=0),c=e._startTime+e._totalDuration/e._timeScale,c>d&&(d=c),e=b;this._duration=this._totalDuration=d,this._dirty=!1}return this._totalDuration}return a&&this.totalDuration()?this.timeScale(this._totalDuration/a):this},q.paused=function(b){if(!b)for(var c=this._first,d=this._time;c;)c._startTime===d&&"isPause"===c.data&&(c._rawPrevTime=0),c=c._next;return a.prototype.paused.apply(this,arguments)},q.usesFrames=function(){for(var b=this._timeline;b._timeline;)b=b._timeline;return b===a._rootFramesTimeline},q.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},d},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(a){"use strict";var b=function(){return(_gsScope.GreenSockGlobals||_gsScope)[a]}; true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15)], __WEBPACK_AMD_DEFINE_FACTORY__ = (b), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof module&&module.exports&&(require("./TweenLite.js"),module.exports=b())}("TimelineMax");
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * VERSION: 1.18.2
	 * DATE: 2015-12-22
	 * UPDATES AND DOCS AT: http://greensock.com
	 *
	 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
	 * This work is subject to the terms at http://greensock.com/standard-license or for
	 * Club GreenSock members, the software agreement that was issued with your membership.
	 * 
	 * @author: Jack Doyle, jack@greensock.com
	 */
	(function(window, moduleName) {
	
			"use strict";
			var _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
			if (_globals.TweenLite) {
				return; //in case the core set of classes is already loaded, don't instantiate twice.
			}
			var _namespace = function(ns) {
					var a = ns.split("."),
						p = _globals, i;
					for (i = 0; i < a.length; i++) {
						p[a[i]] = p = p[a[i]] || {};
					}
					return p;
				},
				gs = _namespace("com.greensock"),
				_tinyNum = 0.0000000001,
				_slice = function(a) { //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
					var b = [],
						l = a.length,
						i;
					for (i = 0; i !== l; b.push(a[i++])) {}
					return b;
				},
				_emptyFunc = function() {},
				_isArray = (function() { //works around issues in iframe environments where the Array global isn't shared, thus if the object originates in a different window/iframe, "(obj instanceof Array)" will evaluate false. We added some speed optimizations to avoid Object.prototype.toString.call() unless it's absolutely necessary because it's VERY slow (like 20x slower)
					var toString = Object.prototype.toString,
						array = toString.call([]);
					return function(obj) {
						return obj != null && (obj instanceof Array || (typeof(obj) === "object" && !!obj.push && toString.call(obj) === array));
					};
				}()),
				a, i, p, _ticker, _tickerActive,
				_defLookup = {},
	
				/**
				 * @constructor
				 * Defines a GreenSock class, optionally with an array of dependencies that must be instantiated first and passed into the definition.
				 * This allows users to load GreenSock JS files in any order even if they have interdependencies (like CSSPlugin extends TweenPlugin which is
				 * inside TweenLite.js, but if CSSPlugin is loaded first, it should wait to run its code until TweenLite.js loads and instantiates TweenPlugin
				 * and then pass TweenPlugin to CSSPlugin's definition). This is all done automatically and internally.
				 *
				 * Every definition will be added to a "com.greensock" global object (typically window, but if a window.GreenSockGlobals object is found,
				 * it will go there as of v1.7). For example, TweenLite will be found at window.com.greensock.TweenLite and since it's a global class that should be available anywhere,
				 * it is ALSO referenced at window.TweenLite. However some classes aren't considered global, like the base com.greensock.core.Animation class, so
				 * those will only be at the package like window.com.greensock.core.Animation. Again, if you define a GreenSockGlobals object on the window, everything
				 * gets tucked neatly inside there instead of on the window directly. This allows you to do advanced things like load multiple versions of GreenSock
				 * files and put them into distinct objects (imagine a banner ad uses a newer version but the main site uses an older one). In that case, you could
				 * sandbox the banner one like:
				 *
				 * <script>
				 *     var gs = window.GreenSockGlobals = {}; //the newer version we're about to load could now be referenced in a "gs" object, like gs.TweenLite.to(...). Use whatever alias you want as long as it's unique, "gs" or "banner" or whatever.
				 * </script>
				 * <script src="js/greensock/v1.7/TweenMax.js"></script>
				 * <script>
				 *     window.GreenSockGlobals = window._gsQueue = window._gsDefine = null; //reset it back to null (along with the special _gsQueue variable) so that the next load of TweenMax affects the window and we can reference things directly like TweenLite.to(...)
				 * </script>
				 * <script src="js/greensock/v1.6/TweenMax.js"></script>
				 * <script>
				 *     gs.TweenLite.to(...); //would use v1.7
				 *     TweenLite.to(...); //would use v1.6
				 * </script>
				 *
				 * @param {!string} ns The namespace of the class definition, leaving off "com.greensock." as that's assumed. For example, "TweenLite" or "plugins.CSSPlugin" or "easing.Back".
				 * @param {!Array.<string>} dependencies An array of dependencies (described as their namespaces minus "com.greensock." prefix). For example ["TweenLite","plugins.TweenPlugin","core.Animation"]
				 * @param {!function():Object} func The function that should be called and passed the resolved dependencies which will return the actual class for this definition.
				 * @param {boolean=} global If true, the class will be added to the global scope (typically window unless you define a window.GreenSockGlobals object)
				 */
				Definition = function(ns, dependencies, func, global) {
					this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
					_defLookup[ns] = this;
					this.gsClass = null;
					this.func = func;
					var _classes = [];
					this.check = function(init) {
						var i = dependencies.length,
							missing = i,
							cur, a, n, cl, hasModule;
						while (--i > -1) {
							if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
								_classes[i] = cur.gsClass;
								missing--;
							} else if (init) {
								cur.sc.push(this);
							}
						}
						if (missing === 0 && func) {
							a = ("com.greensock." + ns).split(".");
							n = a.pop();
							cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);
	
							//exports to multiple environments
							if (global) {
								_globals[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
								hasModule = (typeof(module) !== "undefined" && module.exports);
								if (!hasModule && "function" === "function" && __webpack_require__(13)){ //AMD
									!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return cl; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
								} else if (ns === moduleName && hasModule){ //node
									module.exports = cl;
								}
							}
							for (i = 0; i < this.sc.length; i++) {
								this.sc[i].check();
							}
						}
					};
					this.check(true);
				},
	
				//used to create Definition instances (which basically registers a class that has dependencies).
				_gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
					return new Definition(ns, dependencies, func, global);
				},
	
				//a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
				_class = gs._class = function(ns, func, global) {
					func = func || function() {};
					_gsDefine(ns, [], function(){ return func; }, global);
					return func;
				};
	
			_gsDefine.globals = _globals;
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * Ease
	 * ----------------------------------------------------------------
	 */
			var _baseParams = [0, 0, 1, 1],
				_blankArray = [],
				Ease = _class("easing.Ease", function(func, extraParams, type, power) {
					this._func = func;
					this._type = type || 0;
					this._power = power || 0;
					this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
				}, true),
				_easeMap = Ease.map = {},
				_easeReg = Ease.register = function(ease, names, types, create) {
					var na = names.split(","),
						i = na.length,
						ta = (types || "easeIn,easeOut,easeInOut").split(","),
						e, name, j, type;
					while (--i > -1) {
						name = na[i];
						e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
						j = ta.length;
						while (--j > -1) {
							type = ta[j];
							_easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
						}
					}
				};
	
			p = Ease.prototype;
			p._calcEnd = false;
			p.getRatio = function(p) {
				if (this._func) {
					this._params[0] = p;
					return this._func.apply(null, this._params);
				}
				var t = this._type,
					pw = this._power,
					r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
				if (pw === 1) {
					r *= r;
				} else if (pw === 2) {
					r *= r * r;
				} else if (pw === 3) {
					r *= r * r * r;
				} else if (pw === 4) {
					r *= r * r * r * r;
				}
				return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
			};
	
			//create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
			a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
			i = a.length;
			while (--i > -1) {
				p = a[i]+",Power"+i;
				_easeReg(new Ease(null,null,1,i), p, "easeOut", true);
				_easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
				_easeReg(new Ease(null,null,3,i), p, "easeInOut");
			}
			_easeMap.linear = gs.easing.Linear.easeIn;
			_easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks
	
	
	/*
	 * ----------------------------------------------------------------
	 * EventDispatcher
	 * ----------------------------------------------------------------
	 */
			var EventDispatcher = _class("events.EventDispatcher", function(target) {
				this._listeners = {};
				this._eventTarget = target || this;
			});
			p = EventDispatcher.prototype;
	
			p.addEventListener = function(type, callback, scope, useParam, priority) {
				priority = priority || 0;
				var list = this._listeners[type],
					index = 0,
					listener, i;
				if (list == null) {
					this._listeners[type] = list = [];
				}
				i = list.length;
				while (--i > -1) {
					listener = list[i];
					if (listener.c === callback && listener.s === scope) {
						list.splice(i, 1);
					} else if (index === 0 && listener.pr < priority) {
						index = i + 1;
					}
				}
				list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
				if (this === _ticker && !_tickerActive) {
					_ticker.wake();
				}
			};
	
			p.removeEventListener = function(type, callback) {
				var list = this._listeners[type], i;
				if (list) {
					i = list.length;
					while (--i > -1) {
						if (list[i].c === callback) {
							list.splice(i, 1);
							return;
						}
					}
				}
			};
	
			p.dispatchEvent = function(type) {
				var list = this._listeners[type],
					i, t, listener;
				if (list) {
					i = list.length;
					t = this._eventTarget;
					while (--i > -1) {
						listener = list[i];
						if (listener) {
							if (listener.up) {
								listener.c.call(listener.s || t, {type:type, target:t});
							} else {
								listener.c.call(listener.s || t);
							}
						}
					}
				}
			};
	
	
	/*
	 * ----------------------------------------------------------------
	 * Ticker
	 * ----------------------------------------------------------------
	 */
	 		var _reqAnimFrame = window.requestAnimationFrame,
				_cancelAnimFrame = window.cancelAnimationFrame,
				_getTime = Date.now || function() {return new Date().getTime();},
				_lastUpdate = _getTime();
	
			//now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
			a = ["ms","moz","webkit","o"];
			i = a.length;
			while (--i > -1 && !_reqAnimFrame) {
				_reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
				_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
			}
	
			_class("Ticker", function(fps, useRAF) {
				var _self = this,
					_startTime = _getTime(),
					_useRAF = (useRAF !== false && _reqAnimFrame) ? "auto" : false,
					_lagThreshold = 500,
					_adjustedLag = 33,
					_tickWord = "tick", //helps reduce gc burden
					_fps, _req, _id, _gap, _nextTime,
					_tick = function(manual) {
						var elapsed = _getTime() - _lastUpdate,
							overlap, dispatch;
						if (elapsed > _lagThreshold) {
							_startTime += elapsed - _adjustedLag;
						}
						_lastUpdate += elapsed;
						_self.time = (_lastUpdate - _startTime) / 1000;
						overlap = _self.time - _nextTime;
						if (!_fps || overlap > 0 || manual === true) {
							_self.frame++;
							_nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
							dispatch = true;
						}
						if (manual !== true) { //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.
							_id = _req(_tick);
						}
						if (dispatch) {
							_self.dispatchEvent(_tickWord);
						}
					};
	
				EventDispatcher.call(_self);
				_self.time = _self.frame = 0;
				_self.tick = function() {
					_tick(true);
				};
	
				_self.lagSmoothing = function(threshold, adjustedLag) {
					_lagThreshold = threshold || (1 / _tinyNum); //zero should be interpreted as basically unlimited
					_adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
				};
	
				_self.sleep = function() {
					if (_id == null) {
						return;
					}
					if (!_useRAF || !_cancelAnimFrame) {
						clearTimeout(_id);
					} else {
						_cancelAnimFrame(_id);
					}
					_req = _emptyFunc;
					_id = null;
					if (_self === _ticker) {
						_tickerActive = false;
					}
				};
	
				_self.wake = function(seamless) {
					if (_id !== null) {
						_self.sleep();
					} else if (seamless) {
						_startTime += -_lastUpdate + (_lastUpdate = _getTime());
					} else if (_self.frame > 10) { //don't trigger lagSmoothing if we're just waking up, and make sure that at least 10 frames have elapsed because of the iOS bug that we work around below with the 1.5-second setTimout().
						_lastUpdate = _getTime() - _lagThreshold + 5;
					}
					_req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
					if (_self === _ticker) {
						_tickerActive = true;
					}
					_tick(2);
				};
	
				_self.fps = function(value) {
					if (!arguments.length) {
						return _fps;
					}
					_fps = value;
					_gap = 1 / (_fps || 60);
					_nextTime = this.time + _gap;
					_self.wake();
				};
	
				_self.useRAF = function(value) {
					if (!arguments.length) {
						return _useRAF;
					}
					_self.sleep();
					_useRAF = value;
					_self.fps(_fps);
				};
				_self.fps(fps);
	
				//a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
				setTimeout(function() {
					if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
						_self.useRAF(false);
					}
				}, 1500);
			});
	
			p = gs.Ticker.prototype = new gs.events.EventDispatcher();
			p.constructor = gs.Ticker;
	
	
	/*
	 * ----------------------------------------------------------------
	 * Animation
	 * ----------------------------------------------------------------
	 */
			var Animation = _class("core.Animation", function(duration, vars) {
					this.vars = vars = vars || {};
					this._duration = this._totalDuration = duration || 0;
					this._delay = Number(vars.delay) || 0;
					this._timeScale = 1;
					this._active = (vars.immediateRender === true);
					this.data = vars.data;
					this._reversed = (vars.reversed === true);
	
					if (!_rootTimeline) {
						return;
					}
					if (!_tickerActive) { //some browsers (like iOS 6 Safari) shut down JavaScript execution when the tab is disabled and they [occasionally] neglect to start up requestAnimationFrame again when returning - this code ensures that the engine starts up again properly.
						_ticker.wake();
					}
	
					var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
					tl.add(this, tl._time);
	
					if (this.vars.paused) {
						this.paused(true);
					}
				});
	
			_ticker = Animation.ticker = new gs.Ticker();
			p = Animation.prototype;
			p._dirty = p._gc = p._initted = p._paused = false;
			p._totalTime = p._time = 0;
			p._rawPrevTime = -1;
			p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
			p._paused = false;
	
	
			//some browsers (like iOS) occasionally drop the requestAnimationFrame event when the user switches to a different tab and then comes back again, so we use a 2-second setTimeout() to sense if/when that condition occurs and then wake() the ticker.
			var _checkTimeout = function() {
					if (_tickerActive && _getTime() - _lastUpdate > 2000) {
						_ticker.wake();
					}
					setTimeout(_checkTimeout, 2000);
				};
			_checkTimeout();
	
	
			p.play = function(from, suppressEvents) {
				if (from != null) {
					this.seek(from, suppressEvents);
				}
				return this.reversed(false).paused(false);
			};
	
			p.pause = function(atTime, suppressEvents) {
				if (atTime != null) {
					this.seek(atTime, suppressEvents);
				}
				return this.paused(true);
			};
	
			p.resume = function(from, suppressEvents) {
				if (from != null) {
					this.seek(from, suppressEvents);
				}
				return this.paused(false);
			};
	
			p.seek = function(time, suppressEvents) {
				return this.totalTime(Number(time), suppressEvents !== false);
			};
	
			p.restart = function(includeDelay, suppressEvents) {
				return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
			};
	
			p.reverse = function(from, suppressEvents) {
				if (from != null) {
					this.seek((from || this.totalDuration()), suppressEvents);
				}
				return this.reversed(true).paused(false);
			};
	
			p.render = function(time, suppressEvents, force) {
				//stub - we override this method in subclasses.
			};
	
			p.invalidate = function() {
				this._time = this._totalTime = 0;
				this._initted = this._gc = false;
				this._rawPrevTime = -1;
				if (this._gc || !this.timeline) {
					this._enabled(true);
				}
				return this;
			};
	
			p.isActive = function() {
				var tl = this._timeline, //the 2 root timelines won't have a _timeline; they're always active.
					startTime = this._startTime,
					rawTime;
				return (!tl || (!this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale));
			};
	
			p._enabled = function (enabled, ignoreTimeline) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				this._gc = !enabled;
				this._active = this.isActive();
				if (ignoreTimeline !== true) {
					if (enabled && !this.timeline) {
						this._timeline.add(this, this._startTime - this._delay);
					} else if (!enabled && this.timeline) {
						this._timeline._remove(this, true);
					}
				}
				return false;
			};
	
	
			p._kill = function(vars, target) {
				return this._enabled(false, false);
			};
	
			p.kill = function(vars, target) {
				this._kill(vars, target);
				return this;
			};
	
			p._uncache = function(includeSelf) {
				var tween = includeSelf ? this : this.timeline;
				while (tween) {
					tween._dirty = true;
					tween = tween.timeline;
				}
				return this;
			};
	
			p._swapSelfInParams = function(params) {
				var i = params.length,
					copy = params.concat();
				while (--i > -1) {
					if (params[i] === "{self}") {
						copy[i] = this;
					}
				}
				return copy;
			};
	
			p._callback = function(type) {
				var v = this.vars;
				v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray);
			};
	
	//----Animation getters/setters --------------------------------------------------------
	
			p.eventCallback = function(type, callback, params, scope) {
				if ((type || "").substr(0,2) === "on") {
					var v = this.vars;
					if (arguments.length === 1) {
						return v[type];
					}
					if (callback == null) {
						delete v[type];
					} else {
						v[type] = callback;
						v[type + "Params"] = (_isArray(params) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
						v[type + "Scope"] = scope;
					}
					if (type === "onUpdate") {
						this._onUpdate = callback;
					}
				}
				return this;
			};
	
			p.delay = function(value) {
				if (!arguments.length) {
					return this._delay;
				}
				if (this._timeline.smoothChildTiming) {
					this.startTime( this._startTime + value - this._delay );
				}
				this._delay = value;
				return this;
			};
	
			p.duration = function(value) {
				if (!arguments.length) {
					this._dirty = false;
					return this._duration;
				}
				this._duration = this._totalDuration = value;
				this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration.
				if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
					this.totalTime(this._totalTime * (value / this._duration), true);
				}
				return this;
			};
	
			p.totalDuration = function(value) {
				this._dirty = false;
				return (!arguments.length) ? this._totalDuration : this.duration(value);
			};
	
			p.time = function(value, suppressEvents) {
				if (!arguments.length) {
					return this._time;
				}
				if (this._dirty) {
					this.totalDuration();
				}
				return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
			};
	
			p.totalTime = function(time, suppressEvents, uncapped) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				if (!arguments.length) {
					return this._totalTime;
				}
				if (this._timeline) {
					if (time < 0 && !uncapped) {
						time += this.totalDuration();
					}
					if (this._timeline.smoothChildTiming) {
						if (this._dirty) {
							this.totalDuration();
						}
						var totalDuration = this._totalDuration,
							tl = this._timeline;
						if (time > totalDuration && !uncapped) {
							time = totalDuration;
						}
						this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
						if (!tl._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
							this._uncache(false);
						}
						//in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The startTime of that child would get pushed out, but one of the ancestors may have completed.
						if (tl._timeline) {
							while (tl._timeline) {
								if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
									tl.totalTime(tl._totalTime, true);
								}
								tl = tl._timeline;
							}
						}
					}
					if (this._gc) {
						this._enabled(true, false);
					}
					if (this._totalTime !== time || this._duration === 0) {
						if (_lazyTweens.length) {
							_lazyRender();
						}
						this.render(time, suppressEvents, false);
						if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
							_lazyRender();
						}
					}
				}
				return this;
			};
	
			p.progress = p.totalProgress = function(value, suppressEvents) {
				var duration = this.duration();
				return (!arguments.length) ? (duration ? this._time / duration : this.ratio) : this.totalTime(duration * value, suppressEvents);
			};
	
			p.startTime = function(value) {
				if (!arguments.length) {
					return this._startTime;
				}
				if (value !== this._startTime) {
					this._startTime = value;
					if (this.timeline) if (this.timeline._sortChildren) {
						this.timeline.add(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
					}
				}
				return this;
			};
	
			p.endTime = function(includeRepeats) {
				return this._startTime + ((includeRepeats != false) ? this.totalDuration() : this.duration()) / this._timeScale;
			};
	
			p.timeScale = function(value) {
				if (!arguments.length) {
					return this._timeScale;
				}
				value = value || _tinyNum; //can't allow zero because it'll throw the math off
				if (this._timeline && this._timeline.smoothChildTiming) {
					var pauseTime = this._pauseTime,
						t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
					this._startTime = t - ((t - this._startTime) * this._timeScale / value);
				}
				this._timeScale = value;
				return this._uncache(false);
			};
	
			p.reversed = function(value) {
				if (!arguments.length) {
					return this._reversed;
				}
				if (value != this._reversed) {
					this._reversed = value;
					this.totalTime(((this._timeline && !this._timeline.smoothChildTiming) ? this.totalDuration() - this._totalTime : this._totalTime), true);
				}
				return this;
			};
	
			p.paused = function(value) {
				if (!arguments.length) {
					return this._paused;
				}
				var tl = this._timeline,
					raw, elapsed;
				if (value != this._paused) if (tl) {
					if (!_tickerActive && !value) {
						_ticker.wake();
					}
					raw = tl.rawTime();
					elapsed = raw - this._pauseTime;
					if (!value && tl.smoothChildTiming) {
						this._startTime += elapsed;
						this._uncache(false);
					}
					this._pauseTime = value ? raw : null;
					this._paused = value;
					this._active = this.isActive();
					if (!value && elapsed !== 0 && this._initted && this.duration()) {
						raw = tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale;
						this.render(raw, (raw === this._totalTime), true); //in case the target's properties changed via some other tween or manual update by the user, we should force a render.
					}
				}
				if (this._gc && !value) {
					this._enabled(true, false);
				}
				return this;
			};
	
	
	/*
	 * ----------------------------------------------------------------
	 * SimpleTimeline
	 * ----------------------------------------------------------------
	 */
			var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
				Animation.call(this, 0, vars);
				this.autoRemoveChildren = this.smoothChildTiming = true;
			});
	
			p = SimpleTimeline.prototype = new Animation();
			p.constructor = SimpleTimeline;
			p.kill()._gc = false;
			p._first = p._last = p._recent = null;
			p._sortChildren = false;
	
			p.add = p.insert = function(child, position, align, stagger) {
				var prevTween, st;
				child._startTime = Number(position || 0) + child._delay;
				if (child._paused) if (this !== child._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order).
					child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
				}
				if (child.timeline) {
					child.timeline._remove(child, true); //removes from existing timeline so that it can be properly added to this one.
				}
				child.timeline = child._timeline = this;
				if (child._gc) {
					child._enabled(true, true);
				}
				prevTween = this._last;
				if (this._sortChildren) {
					st = child._startTime;
					while (prevTween && prevTween._startTime > st) {
						prevTween = prevTween._prev;
					}
				}
				if (prevTween) {
					child._next = prevTween._next;
					prevTween._next = child;
				} else {
					child._next = this._first;
					this._first = child;
				}
				if (child._next) {
					child._next._prev = child;
				} else {
					this._last = child;
				}
				child._prev = prevTween;
				this._recent = child;
				if (this._timeline) {
					this._uncache(true);
				}
				return this;
			};
	
			p._remove = function(tween, skipDisable) {
				if (tween.timeline === this) {
					if (!skipDisable) {
						tween._enabled(false, true);
					}
	
					if (tween._prev) {
						tween._prev._next = tween._next;
					} else if (this._first === tween) {
						this._first = tween._next;
					}
					if (tween._next) {
						tween._next._prev = tween._prev;
					} else if (this._last === tween) {
						this._last = tween._prev;
					}
					tween._next = tween._prev = tween.timeline = null;
					if (tween === this._recent) {
						this._recent = this._last;
					}
	
					if (this._timeline) {
						this._uncache(true);
					}
				}
				return this;
			};
	
			p.render = function(time, suppressEvents, force) {
				var tween = this._first,
					next;
				this._totalTime = this._time = this._rawPrevTime = time;
				while (tween) {
					next = tween._next; //record it here because the value could change after rendering...
					if (tween._active || (time >= tween._startTime && !tween._paused)) {
						if (!tween._reversed) {
							tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
						} else {
							tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
						}
					}
					tween = next;
				}
			};
	
			p.rawTime = function() {
				if (!_tickerActive) {
					_ticker.wake();
				}
				return this._totalTime;
			};
	
	/*
	 * ----------------------------------------------------------------
	 * TweenLite
	 * ----------------------------------------------------------------
	 */
			var TweenLite = _class("TweenLite", function(target, duration, vars) {
					Animation.call(this, duration, vars);
					this.render = TweenLite.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)
	
					if (target == null) {
						throw "Cannot tween a null target.";
					}
	
					this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
	
					var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
						overwrite = this.vars.overwrite,
						i, targ, targets;
	
					this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];
	
					if ((isSelector || target instanceof Array || (target.push && _isArray(target))) && typeof(target[0]) !== "number") {
						this._targets = targets = _slice(target);  //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
						this._propLookup = [];
						this._siblings = [];
						for (i = 0; i < targets.length; i++) {
							targ = targets[i];
							if (!targ) {
								targets.splice(i--, 1);
								continue;
							} else if (typeof(targ) === "string") {
								targ = targets[i--] = TweenLite.selector(targ); //in case it's an array of strings
								if (typeof(targ) === "string") {
									targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
								}
								continue;
							} else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { //in case the user is passing in an array of selector objects (like jQuery objects), we need to check one more level and pull things out if necessary. Also note that <select> elements pass all the criteria regarding length and the first child having style, so we must also check to ensure the target isn't an HTML node itself.
								targets.splice(i--, 1);
								this._targets = targets = targets.concat(_slice(targ));
								continue;
							}
							this._siblings[i] = _register(targ, this, false);
							if (overwrite === 1) if (this._siblings[i].length > 1) {
								_applyOverwrite(targ, this, null, 1, this._siblings[i]);
							}
						}
	
					} else {
						this._propLookup = {};
						this._siblings = _register(target, this, false);
						if (overwrite === 1) if (this._siblings.length > 1) {
							_applyOverwrite(target, this, null, 1, this._siblings);
						}
					}
					if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
						this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
						this.render(-this._delay);
					}
				}, true),
				_isSelector = function(v) {
					return (v && v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); //we cannot check "nodeType" if the target is window from within an iframe, otherwise it will trigger a security error in some browsers like Firefox.
				},
				_autoCSS = function(vars, target) {
					var css = {},
						p;
					for (p in vars) {
						if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { //note: <img> elements contain read-only "x" and "y" properties. We should also prioritize editing css width/height rather than the element's properties.
							css[p] = vars[p];
							delete vars[p];
						}
					}
					vars.css = css;
				};
	
			p = TweenLite.prototype = new Animation();
			p.constructor = TweenLite;
			p.kill()._gc = false;
	
	//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------
	
			p.ratio = 0;
			p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
			p._notifyPluginsOfEnabled = p._lazy = false;
	
			TweenLite.version = "1.18.2";
			TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
			TweenLite.defaultOverwrite = "auto";
			TweenLite.ticker = _ticker;
			TweenLite.autoSleep = 120;
			TweenLite.lagSmoothing = function(threshold, adjustedLag) {
				_ticker.lagSmoothing(threshold, adjustedLag);
			};
	
			TweenLite.selector = window.$ || window.jQuery || function(e) {
				var selector = window.$ || window.jQuery;
				if (selector) {
					TweenLite.selector = selector;
					return selector(e);
				}
				return (typeof(document) === "undefined") ? e : (document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e));
			};
	
			var _lazyTweens = [],
				_lazyLookup = {},
				_numbersExp = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
				//_nonNumbersExp = /(?:([\-+](?!(\d|=)))|[^\d\-+=e]|(e(?![\-+][\d])))+/ig,
				_setRatio = function(v) {
					var pt = this._firstPT,
						min = 0.000001,
						val;
					while (pt) {
						val = !pt.blob ? pt.c * v + pt.s : v ? this.join("") : this.start;
						if (pt.r) {
							val = Math.round(val);
						} else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
							val = 0;
						}
						if (!pt.f) {
							pt.t[pt.p] = val;
						} else if (pt.fp) {
							pt.t[pt.p](pt.fp, val);
						} else {
							pt.t[pt.p](val);
						}
						pt = pt._next;
					}
				},
				//compares two strings (start/end), finds the numbers that are different and spits back an array representing the whole value but with the changing values isolated as elements. For example, "rgb(0,0,0)" and "rgb(100,50,0)" would become ["rgb(", 0, ",", 50, ",0)"]. Notice it merges the parts that are identical (performance optimization). The array also has a linked list of PropTweens attached starting with _firstPT that contain the tweening data (t, p, s, c, f, etc.). It also stores the starting value as a "start" property so that we can revert to it if/when necessary, like when a tween rewinds fully. If the quantity of numbers differs between the start and end, it will always prioritize the end value(s). The pt parameter is optional - it's for a PropTween that will be appended to the end of the linked list and is typically for actually setting the value after all of the elements have been updated (with array.join("")).
				_blobDif = function(start, end, filter, pt) {
					var a = [start, end],
						charIndex = 0,
						s = "",
						color = 0,
						startNums, endNums, num, i, l, nonNumbers, currentNum;
					a.start = start;
					if (filter) {
						filter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.
						start = a[0];
						end = a[1];
					}
					a.length = 0;
					startNums = start.match(_numbersExp) || [];
					endNums = end.match(_numbersExp) || [];
					if (pt) {
						pt._next = null;
						pt.blob = 1;
						a._firstPT = pt; //apply last in the linked list (which means inserting it first)
					}
					l = endNums.length;
					for (i = 0; i < l; i++) {
						currentNum = endNums[i];
						nonNumbers = end.substr(charIndex, end.indexOf(currentNum, charIndex)-charIndex);
						s += (nonNumbers || !i) ? nonNumbers : ","; //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
						charIndex += nonNumbers.length;
						if (color) { //sense rgba() values and round them.
							color = (color + 1) % 5;
						} else if (nonNumbers.substr(-5) === "rgba(") {
							color = 1;
						}
						if (currentNum === startNums[i] || startNums.length <= i) {
							s += currentNum;
						} else {
							if (s) {
								a.push(s);
								s = "";
							}
							num = parseFloat(startNums[i]);
							a.push(num);
							a._firstPT = {_next: a._firstPT, t:a, p: a.length-1, s:num, c:((currentNum.charAt(1) === "=") ? parseInt(currentNum.charAt(0) + "1", 10) * parseFloat(currentNum.substr(2)) : (parseFloat(currentNum) - num)) || 0, f:0, r:(color && color < 4)};
							//note: we don't set _prev because we'll never need to remove individual PropTweens from this list.
						}
						charIndex += currentNum.length;
					}
					s += end.substr(charIndex);
					if (s) {
						a.push(s);
					}
					a.setRatio = _setRatio;
					return a;
				},
				//note: "funcParam" is only necessary for function-based getters/setters that require an extra parameter like getAttribute("width") and setAttribute("width", value). In this example, funcParam would be "width". Used by AttrPlugin for example.
				_addPropTween = function(target, prop, start, end, overwriteProp, round, funcParam, stringFilter) {
					var s = (start === "get") ? target[prop] : start,
						type = typeof(target[prop]),
						isRelative = (typeof(end) === "string" && end.charAt(1) === "="),
						pt = {t:target, p:prop, s:s, f:(type === "function"), pg:0, n:overwriteProp || prop, r:round, pr:0, c:isRelative ? parseInt(end.charAt(0) + "1", 10) * parseFloat(end.substr(2)) : (parseFloat(end) - s) || 0},
						blob, getterName;
					if (type !== "number") {
						if (type === "function" && start === "get") {
							getterName = ((prop.indexOf("set") || typeof(target["get" + prop.substr(3)]) !== "function") ? prop : "get" + prop.substr(3));
							pt.s = s = funcParam ? target[getterName](funcParam) : target[getterName]();
						}
						if (typeof(s) === "string" && (funcParam || isNaN(s))) {
							//a blob (string that has multiple numbers in it)
							pt.fp = funcParam;
							blob = _blobDif(s, end, stringFilter || TweenLite.defaultStringFilter, pt);
							pt = {t:blob, p:"setRatio", s:0, c:1, f:2, pg:0, n:overwriteProp || prop, pr:0}; //"2" indicates it's a Blob property tween. Needed for RoundPropsPlugin for example.
						} else if (!isRelative) {
							pt.s = parseFloat(s);
							pt.c = (parseFloat(end) - pt.s) || 0;
						}
					}
					if (pt.c) { //only add it to the linked list if there's a change.
						if ((pt._next = this._firstPT)) {
							pt._next._prev = pt;
						}
						this._firstPT = pt;
						return pt;
					}
				},
				_internals = TweenLite._internals = {isArray:_isArray, isSelector:_isSelector, lazyTweens:_lazyTweens, blobDif:_blobDif}, //gives us a way to expose certain private values to other GreenSock classes without contaminating tha main TweenLite object.
				_plugins = TweenLite._plugins = {},
				_tweenLookup = _internals.tweenLookup = {},
				_tweenLookupNum = 0,
				_reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1, lazy:1, onOverwrite:1, callbackScope:1, stringFilter:1},
				_overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
				_rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(),
				_rootTimeline = Animation._rootTimeline = new SimpleTimeline(),
				_nextGCFrame = 30,
				_lazyRender = _internals.lazyRender = function() {
					var i = _lazyTweens.length,
						tween;
					_lazyLookup = {};
					while (--i > -1) {
						tween = _lazyTweens[i];
						if (tween && tween._lazy !== false) {
							tween.render(tween._lazy[0], tween._lazy[1], true);
							tween._lazy = false;
						}
					}
					_lazyTweens.length = 0;
				};
	
			_rootTimeline._startTime = _ticker.time;
			_rootFramesTimeline._startTime = _ticker.frame;
			_rootTimeline._active = _rootFramesTimeline._active = true;
			setTimeout(_lazyRender, 1); //on some mobile devices, there isn't a "tick" before code runs which means any lazy renders wouldn't run before the next official "tick".
	
			Animation._updateRoot = TweenLite.render = function() {
					var i, a, p;
					if (_lazyTweens.length) { //if code is run outside of the requestAnimationFrame loop, there may be tweens queued AFTER the engine refreshed, so we need to ensure any pending renders occur before we refresh again.
						_lazyRender();
					}
					_rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
					_rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
					if (_lazyTweens.length) {
						_lazyRender();
					}
					if (_ticker.frame >= _nextGCFrame) { //dump garbage every 120 frames or whatever the user sets TweenLite.autoSleep to
						_nextGCFrame = _ticker.frame + (parseInt(TweenLite.autoSleep, 10) || 120);
						for (p in _tweenLookup) {
							a = _tweenLookup[p].tweens;
							i = a.length;
							while (--i > -1) {
								if (a[i]._gc) {
									a.splice(i, 1);
								}
							}
							if (a.length === 0) {
								delete _tweenLookup[p];
							}
						}
						//if there are no more tweens in the root timelines, or if they're all paused, make the _timer sleep to reduce load on the CPU slightly
						p = _rootTimeline._first;
						if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
							while (p && p._paused) {
								p = p._next;
							}
							if (!p) {
								_ticker.sleep();
							}
						}
					}
				};
	
			_ticker.addEventListener("tick", Animation._updateRoot);
	
			var _register = function(target, tween, scrub) {
					var id = target._gsTweenID, a, i;
					if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
						_tweenLookup[id] = {target:target, tweens:[]};
					}
					if (tween) {
						a = _tweenLookup[id].tweens;
						a[(i = a.length)] = tween;
						if (scrub) {
							while (--i > -1) {
								if (a[i] === tween) {
									a.splice(i, 1);
								}
							}
						}
					}
					return _tweenLookup[id].tweens;
				},
				_onOverwrite = function(overwrittenTween, overwritingTween, target, killedProps) {
					var func = overwrittenTween.vars.onOverwrite, r1, r2;
					if (func) {
						r1 = func(overwrittenTween, overwritingTween, target, killedProps);
					}
					func = TweenLite.onOverwrite;
					if (func) {
						r2 = func(overwrittenTween, overwritingTween, target, killedProps);
					}
					return (r1 !== false && r2 !== false);
				},
				_applyOverwrite = function(target, tween, props, mode, siblings) {
					var i, changed, curTween, l;
					if (mode === 1 || mode >= 4) {
						l = siblings.length;
						for (i = 0; i < l; i++) {
							if ((curTween = siblings[i]) !== tween) {
								if (!curTween._gc) {
									if (curTween._kill(null, target, tween)) {
										changed = true;
									}
								}
							} else if (mode === 5) {
								break;
							}
						}
						return changed;
					}
					//NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
					var startTime = tween._startTime + _tinyNum,
						overlaps = [],
						oCount = 0,
						zeroDur = (tween._duration === 0),
						globalStart;
					i = siblings.length;
					while (--i > -1) {
						if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
							//ignore
						} else if (curTween._timeline !== tween._timeline) {
							globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
							if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
								overlaps[oCount++] = curTween;
							}
						} else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
							overlaps[oCount++] = curTween;
						}
					}
	
					i = oCount;
					while (--i > -1) {
						curTween = overlaps[i];
						if (mode === 2) if (curTween._kill(props, target, tween)) {
							changed = true;
						}
						if (mode !== 2 || (!curTween._firstPT && curTween._initted)) {
							if (mode !== 2 && !_onOverwrite(curTween, tween)) {
								continue;
							}
							if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
								changed = true;
							}
						}
					}
					return changed;
				},
				_checkOverlap = function(tween, reference, zeroDur) {
					var tl = tween._timeline,
						ts = tl._timeScale,
						t = tween._startTime;
					while (tl._timeline) {
						t += tl._startTime;
						ts *= tl._timeScale;
						if (tl._paused) {
							return -100;
						}
						tl = tl._timeline;
					}
					t /= ts;
					return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * _tinyNum)) ? _tinyNum : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum) ? 0 : t - reference - _tinyNum;
				};
	
	
	//---- TweenLite instance methods -----------------------------------------------------------------------------
	
			p._init = function() {
				var v = this.vars,
					op = this._overwrittenProps,
					dur = this._duration,
					immediate = !!v.immediateRender,
					ease = v.ease,
					i, initPlugins, pt, p, startVars;
				if (v.startAt) {
					if (this._startAt) {
						this._startAt.render(-1, true); //if we've run a startAt previously (when the tween instantiated), we should revert it so that the values re-instantiate correctly particularly for relative tweens. Without this, a TweenLite.fromTo(obj, 1, {x:"+=100"}, {x:"-=100"}), for example, would actually jump to +=200 because the startAt would run twice, doubling the relative change.
						this._startAt.kill();
					}
					startVars = {};
					for (p in v.startAt) { //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, 1, from, to).fromTo(e, 1, to, from);
						startVars[p] = v.startAt[p];
					}
					startVars.overwrite = false;
					startVars.immediateRender = true;
					startVars.lazy = (immediate && v.lazy !== false);
					startVars.startAt = startVars.delay = null; //no nesting of startAt objects allowed (otherwise it could cause an infinite loop).
					this._startAt = TweenLite.to(this.target, 0, startVars);
					if (immediate) {
						if (this._time > 0) {
							this._startAt = null; //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in TimelineLite/Max instances where immediateRender was false (which is the default in the convenience methods like from()).
						} else if (dur !== 0) {
							return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a TimelineLite or TimelineMax, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
						}
					}
				} else if (v.runBackwards && dur !== 0) {
					//from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
					if (this._startAt) {
						this._startAt.render(-1, true);
						this._startAt.kill();
						this._startAt = null;
					} else {
						if (this._time !== 0) { //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0
							immediate = false;
						}
						pt = {};
						for (p in v) { //copy props into a new object and skip any reserved props, otherwise onComplete or onUpdate or onStart could fire. We should, however, permit autoCSS to go through.
							if (!_reservedProps[p] || p === "autoCSS") {
								pt[p] = v[p];
							}
						}
						pt.overwrite = 0;
						pt.data = "isFromStart"; //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
						pt.lazy = (immediate && v.lazy !== false);
						pt.immediateRender = immediate; //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
						this._startAt = TweenLite.to(this.target, 0, pt);
						if (!immediate) {
							this._startAt._init(); //ensures that the initial values are recorded
							this._startAt._enabled(false); //no need to have the tween render on the next cycle. Disable it because we'll always manually control the renders of the _startAt tween.
							if (this.vars.immediateRender) {
								this._startAt = null;
							}
						} else if (this._time === 0) {
							return;
						}
					}
				}
				this._ease = ease = (!ease) ? TweenLite.defaultEase : (ease instanceof Ease) ? ease : (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
				if (v.easeParams instanceof Array && ease.config) {
					this._ease = ease.config.apply(ease, v.easeParams);
				}
				this._easeType = this._ease._type;
				this._easePower = this._ease._power;
				this._firstPT = null;
	
				if (this._targets) {
					i = this._targets.length;
					while (--i > -1) {
						if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
							initPlugins = true;
						}
					}
				} else {
					initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
				}
	
				if (initPlugins) {
					TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
				}
				if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
					this._enabled(false, false);
				}
				if (v.runBackwards) {
					pt = this._firstPT;
					while (pt) {
						pt.s += pt.c;
						pt.c = -pt.c;
						pt = pt._next;
					}
				}
				this._onUpdate = v.onUpdate;
				this._initted = true;
			};
	
			p._initProps = function(target, propLookup, siblings, overwrittenProps) {
				var p, i, initPlugins, plugin, pt, v;
				if (target == null) {
					return false;
				}
	
				if (_lazyLookup[target._gsTweenID]) {
					_lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)
				}
	
				if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { //it's so common to use TweenLite/Max to animate the css of DOM elements, we assume that if the target is a DOM element, that's what is intended (a convenience so that users don't have to wrap things in css:{}, although we still recommend it for a slight performance boost and better specificity). Note: we cannot check "nodeType" on the window inside an iframe.
					_autoCSS(this.vars, target);
				}
				for (p in this.vars) {
					v = this.vars[p];
					if (_reservedProps[p]) {
						if (v) if ((v instanceof Array) || (v.push && _isArray(v))) if (v.join("").indexOf("{self}") !== -1) {
							this.vars[p] = v = this._swapSelfInParams(v, this);
						}
	
					} else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
	
						//t - target 		[object]
						//p - property 		[string]
						//s - start			[number]
						//c - change		[number]
						//f - isFunction	[boolean]
						//n - name			[string]
						//pg - isPlugin 	[boolean]
						//pr - priority		[number]
						this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:1, n:p, pg:1, pr:plugin._priority};
						i = plugin._overwriteProps.length;
						while (--i > -1) {
							propLookup[plugin._overwriteProps[i]] = this._firstPT;
						}
						if (plugin._priority || plugin._onInitAllProps) {
							initPlugins = true;
						}
						if (plugin._onDisable || plugin._onEnable) {
							this._notifyPluginsOfEnabled = true;
						}
						if (pt._next) {
							pt._next._prev = pt;
						}
	
					} else {
						propLookup[p] = _addPropTween.call(this, target, p, "get", v, p, 0, null, this.vars.stringFilter);
					}
				}
	
				if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
					return this._initProps(target, propLookup, siblings, overwrittenProps);
				}
				if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
					this._kill(propLookup, target);
					return this._initProps(target, propLookup, siblings, overwrittenProps);
				}
				if (this._firstPT) if ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration)) { //zero duration tweens don't lazy render by default; everything else does.
					_lazyLookup[target._gsTweenID] = true;
				}
				return initPlugins;
			};
	
			p.render = function(time, suppressEvents, force) {
				var prevTime = this._time,
					duration = this._duration,
					prevRawPrevTime = this._rawPrevTime,
					isComplete, callback, pt, rawPrevTime;
				if (time >= duration - 0.0000001) { //to work around occasional floating point math artifacts.
					this._totalTime = this._time = duration;
					this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
					if (!this._reversed ) {
						isComplete = true;
						callback = "onComplete";
						force = (force || this._timeline.autoRemoveChildren); //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
					}
					if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
						if (this._startTime === this._timeline._duration) { //if a zero-duration tween is at the VERY end of a timeline and that timeline renders at its end, it will typically add a tiny bit of cushion to the render time to prevent rounding errors from getting in the way of tweens rendering their VERY end. If we then reverse() that timeline, the zero-duration tween will trigger its onReverseComplete even though technically the playhead didn't pass over it again. It's a very specific edge case we must accommodate.
							time = 0;
						}
						if (prevRawPrevTime < 0 || (time <= 0 && time >= -0.0000001) || (prevRawPrevTime === _tinyNum && this.data !== "isPause")) if (prevRawPrevTime !== time) { //note: when this.data is "isPause", it's a callback added by addPause() on a timeline that we should not be triggered when LEAVING its exact start time. In other words, tl.addPause(1).play(1) shouldn't pause.
							force = true;
							if (prevRawPrevTime > _tinyNum) {
								callback = "onReverseComplete";
							}
						}
						this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
					}
	
				} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
					this._totalTime = this._time = 0;
					this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
					if (prevTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
						callback = "onReverseComplete";
						isComplete = this._reversed;
					}
					if (time < 0) {
						this._active = false;
						if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
							if (prevRawPrevTime >= 0 && !(prevRawPrevTime === _tinyNum && this.data === "isPause")) {
								force = true;
							}
							this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
						}
					}
					if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
						force = true;
					}
				} else {
					this._totalTime = this._time = time;
	
					if (this._easeType) {
						var r = time / duration, type = this._easeType, pow = this._easePower;
						if (type === 1 || (type === 3 && r >= 0.5)) {
							r = 1 - r;
						}
						if (type === 3) {
							r *= 2;
						}
						if (pow === 1) {
							r *= r;
						} else if (pow === 2) {
							r *= r * r;
						} else if (pow === 3) {
							r *= r * r * r;
						} else if (pow === 4) {
							r *= r * r * r * r;
						}
	
						if (type === 1) {
							this.ratio = 1 - r;
						} else if (type === 2) {
							this.ratio = r;
						} else if (time / duration < 0.5) {
							this.ratio = r / 2;
						} else {
							this.ratio = 1 - (r / 2);
						}
	
					} else {
						this.ratio = this._ease.getRatio(time / duration);
					}
				}
	
				if (this._time === prevTime && !force) {
					return;
				} else if (!this._initted) {
					this._init();
					if (!this._initted || this._gc) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly. Also, if all of the tweening properties have been overwritten (which would cause _gc to be true, as set in _init()), we shouldn't continue otherwise an onStart callback could be called for example.
						return;
					} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) {
						this._time = this._totalTime = prevTime;
						this._rawPrevTime = prevRawPrevTime;
						_lazyTweens.push(this);
						this._lazy = [time, suppressEvents];
						return;
					}
					//_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
					if (this._time && !isComplete) {
						this.ratio = this._ease.getRatio(this._time / duration);
					} else if (isComplete && this._ease._calcEnd) {
						this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
					}
				}
				if (this._lazy !== false) { //in case a lazy render is pending, we should flush it because the new render is occurring now (imagine a lazy tween instantiating and then immediately the user calls tween.seek(tween.duration()), skipping to the end - the end render would be forced, and then if we didn't flush the lazy render, it'd fire AFTER the seek(), rendering it at the wrong time.
					this._lazy = false;
				}
				if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
					this._active = true;  //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
				}
				if (prevTime === 0) {
					if (this._startAt) {
						if (time >= 0) {
							this._startAt.render(time, suppressEvents, force);
						} else if (!callback) {
							callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
						}
					}
					if (this.vars.onStart) if (this._time !== 0 || duration === 0) if (!suppressEvents) {
						this._callback("onStart");
					}
				}
				pt = this._firstPT;
				while (pt) {
					if (pt.f) {
						pt.t[pt.p](pt.c * this.ratio + pt.s);
					} else {
						pt.t[pt.p] = pt.c * this.ratio + pt.s;
					}
					pt = pt._next;
				}
	
				if (this._onUpdate) {
					if (time < 0) if (this._startAt && time !== -0.0001) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
						this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
					}
					if (!suppressEvents) if (this._time !== prevTime || isComplete) {
						this._callback("onUpdate");
					}
				}
				if (callback) if (!this._gc || force) { //check _gc because there's a chance that kill() could be called in an onUpdate
					if (time < 0 && this._startAt && !this._onUpdate && time !== -0.0001) { //-0.0001 is a special value that we use when looping back to the beginning of a repeated TimelineMax, in which case we shouldn't render the _startAt values.
						this._startAt.render(time, suppressEvents, force);
					}
					if (isComplete) {
						if (this._timeline.autoRemoveChildren) {
							this._enabled(false, false);
						}
						this._active = false;
					}
					if (!suppressEvents && this.vars[callback]) {
						this._callback(callback);
					}
					if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) { //the onComplete or onReverseComplete could trigger movement of the playhead and for zero-duration tweens (which must discern direction) that land directly back on their start time, we don't want to fire again on the next render. Think of several addPause()'s in a timeline that forces the playhead to a certain spot, but what if it's already paused and another tween is tweening the "time" of the timeline? Each time it moves [forward] past that spot, it would move back, and since suppressEvents is true, it'd reset _rawPrevTime to _tinyNum so that when it begins again, the callback would fire (so ultimately it could bounce back and forth during that tween). Again, this is a very uncommon scenario, but possible nonetheless.
						this._rawPrevTime = 0;
					}
				}
			};
	
			p._kill = function(vars, target, overwritingTween) {
				if (vars === "all") {
					vars = null;
				}
				if (vars == null) if (target == null || target === this.target) {
					this._lazy = false;
					return this._enabled(false, false);
				}
				target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
				var simultaneousOverwrite = (overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline),
					i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed;
				if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
					i = target.length;
					while (--i > -1) {
						if (this._kill(vars, target[i], overwritingTween)) {
							changed = true;
						}
					}
				} else {
					if (this._targets) {
						i = this._targets.length;
						while (--i > -1) {
							if (target === this._targets[i]) {
								propLookup = this._propLookup[i] || {};
								this._overwrittenProps = this._overwrittenProps || [];
								overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
								break;
							}
						}
					} else if (target !== this.target) {
						return false;
					} else {
						propLookup = this._propLookup;
						overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
					}
	
					if (propLookup) {
						killProps = vars || propLookup;
						record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof(vars) !== "object" || !vars._tempKill)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
						if (overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
							for (p in killProps) {
								if (propLookup[p]) {
									if (!killed) {
										killed = [];
									}
									killed.push(p);
								}
							}
							if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed)) { //if the onOverwrite returned false, that means the user wants to override the overwriting (cancel it).
								return false;
							}
						}
	
						for (p in killProps) {
							if ((pt = propLookup[p])) {
								if (simultaneousOverwrite) { //if another tween overwrites this one and they both start at exactly the same time, yet this tween has already rendered once (for example, at 0.001) because it's first in the queue, we should revert the values to where they were at 0 so that the starting values aren't contaminated on the overwriting tween.
									if (pt.f) {
										pt.t[pt.p](pt.s);
									} else {
										pt.t[pt.p] = pt.s;
									}
									changed = true;
								}
								if (pt.pg && pt.t._kill(killProps)) {
									changed = true; //some plugins need to be notified so they can perform cleanup tasks first
								}
								if (!pt.pg || pt.t._overwriteProps.length === 0) {
									if (pt._prev) {
										pt._prev._next = pt._next;
									} else if (pt === this._firstPT) {
										this._firstPT = pt._next;
									}
									if (pt._next) {
										pt._next._prev = pt._prev;
									}
									pt._next = pt._prev = null;
								}
								delete propLookup[p];
							}
							if (record) {
								overwrittenProps[p] = 1;
							}
						}
						if (!this._firstPT && this._initted) { //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.
							this._enabled(false, false);
						}
					}
				}
				return changed;
			};
	
			p.invalidate = function() {
				if (this._notifyPluginsOfEnabled) {
					TweenLite._onPluginEvent("_onDisable", this);
				}
				this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null;
				this._notifyPluginsOfEnabled = this._active = this._lazy = false;
				this._propLookup = (this._targets) ? {} : [];
				Animation.prototype.invalidate.call(this);
				if (this.vars.immediateRender) {
					this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
					this.render(-this._delay);
				}
				return this;
			};
	
			p._enabled = function(enabled, ignoreTimeline) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				if (enabled && this._gc) {
					var targets = this._targets,
						i;
					if (targets) {
						i = targets.length;
						while (--i > -1) {
							this._siblings[i] = _register(targets[i], this, true);
						}
					} else {
						this._siblings = _register(this.target, this, true);
					}
				}
				Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
				if (this._notifyPluginsOfEnabled) if (this._firstPT) {
					return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
				}
				return false;
			};
	
	
	//----TweenLite static methods -----------------------------------------------------
	
			TweenLite.to = function(target, duration, vars) {
				return new TweenLite(target, duration, vars);
			};
	
			TweenLite.from = function(target, duration, vars) {
				vars.runBackwards = true;
				vars.immediateRender = (vars.immediateRender != false);
				return new TweenLite(target, duration, vars);
			};
	
			TweenLite.fromTo = function(target, duration, fromVars, toVars) {
				toVars.startAt = fromVars;
				toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
				return new TweenLite(target, duration, toVars);
			};
	
			TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
				return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, lazy:false, useFrames:useFrames, overwrite:0});
			};
	
			TweenLite.set = function(target, vars) {
				return new TweenLite(target, 0, vars);
			};
	
			TweenLite.getTweensOf = function(target, onlyActive) {
				if (target == null) { return []; }
				target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
				var i, a, j, t;
				if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
					i = target.length;
					a = [];
					while (--i > -1) {
						a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
					}
					i = a.length;
					//now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
					while (--i > -1) {
						t = a[i];
						j = i;
						while (--j > -1) {
							if (t === a[j]) {
								a.splice(i, 1);
							}
						}
					}
				} else {
					a = _register(target).concat();
					i = a.length;
					while (--i > -1) {
						if (a[i]._gc || (onlyActive && !a[i].isActive())) {
							a.splice(i, 1);
						}
					}
				}
				return a;
			};
	
			TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
				if (typeof(onlyActive) === "object") {
					vars = onlyActive; //for backwards compatibility (before "onlyActive" parameter was inserted)
					onlyActive = false;
				}
				var a = TweenLite.getTweensOf(target, onlyActive),
					i = a.length;
				while (--i > -1) {
					a[i]._kill(vars, target);
				}
			};
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * TweenPlugin   (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another script call before loading plugins which is easy to forget)
	 * ----------------------------------------------------------------
	 */
			var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
						this._overwriteProps = (props || "").split(",");
						this._propName = this._overwriteProps[0];
						this._priority = priority || 0;
						this._super = TweenPlugin.prototype;
					}, true);
	
			p = TweenPlugin.prototype;
			TweenPlugin.version = "1.18.0";
			TweenPlugin.API = 2;
			p._firstPT = null;
			p._addTween = _addPropTween;
			p.setRatio = _setRatio;
	
			p._kill = function(lookup) {
				var a = this._overwriteProps,
					pt = this._firstPT,
					i;
				if (lookup[this._propName] != null) {
					this._overwriteProps = [];
				} else {
					i = a.length;
					while (--i > -1) {
						if (lookup[a[i]] != null) {
							a.splice(i, 1);
						}
					}
				}
				while (pt) {
					if (lookup[pt.n] != null) {
						if (pt._next) {
							pt._next._prev = pt._prev;
						}
						if (pt._prev) {
							pt._prev._next = pt._next;
							pt._prev = null;
						} else if (this._firstPT === pt) {
							this._firstPT = pt._next;
						}
					}
					pt = pt._next;
				}
				return false;
			};
	
			p._roundProps = function(lookup, value) {
				var pt = this._firstPT;
				while (pt) {
					if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
						pt.r = value;
					}
					pt = pt._next;
				}
			};
	
			TweenLite._onPluginEvent = function(type, tween) {
				var pt = tween._firstPT,
					changed, pt2, first, last, next;
				if (type === "_onInitAllProps") {
					//sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
					while (pt) {
						next = pt._next;
						pt2 = first;
						while (pt2 && pt2.pr > pt.pr) {
							pt2 = pt2._next;
						}
						if ((pt._prev = pt2 ? pt2._prev : last)) {
							pt._prev._next = pt;
						} else {
							first = pt;
						}
						if ((pt._next = pt2)) {
							pt2._prev = pt;
						} else {
							last = pt;
						}
						pt = next;
					}
					pt = tween._firstPT = first;
				}
				while (pt) {
					if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
						changed = true;
					}
					pt = pt._next;
				}
				return changed;
			};
	
			TweenPlugin.activate = function(plugins) {
				var i = plugins.length;
				while (--i > -1) {
					if (plugins[i].API === TweenPlugin.API) {
						_plugins[(new plugins[i]())._propName] = plugins[i];
					}
				}
				return true;
			};
	
			//provides a more concise way to define plugins that have no dependencies besides TweenPlugin and TweenLite, wrapping common boilerplate stuff into one function (added in 1.9.0). You don't NEED to use this to define a plugin - the old way still works and can be useful in certain (rare) situations.
			_gsDefine.plugin = function(config) {
				if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
				var propName = config.propName,
					priority = config.priority || 0,
					overwriteProps = config.overwriteProps,
					map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
					Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
						function() {
							TweenPlugin.call(this, propName, priority);
							this._overwriteProps = overwriteProps || [];
						}, (config.global === true)),
					p = Plugin.prototype = new TweenPlugin(propName),
					prop;
				p.constructor = Plugin;
				Plugin.API = config.API;
				for (prop in map) {
					if (typeof(config[prop]) === "function") {
						p[map[prop]] = config[prop];
					}
				}
				Plugin.version = config.version;
				TweenPlugin.activate([Plugin]);
				return Plugin;
			};
	
	
			//now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you.
			a = window._gsQueue;
			if (a) {
				for (i = 0; i < a.length; i++) {
					a[i]();
				}
				for (p in _defLookup) {
					if (!_defLookup[p].func) {
						window.console.log("GSAP encountered missing dependency: com.greensock." + p);
					}
				}
			}
	
			_tickerActive = false; //ensures that the first official animation forces a ticker.tick() to update the time when it is instantiated
	
	})((typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window, "TweenLite");
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Tween = __webpack_require__(12);
	var Timeline = __webpack_require__(14);
	
	var FlashStep = function () {
	  function FlashStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, FlashStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.flash(duration);
	  }
	
	  _createClass(FlashStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'flash',
	    value: function flash() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      var thisTimeline = new Timeline({
	        onComplete: function onComplete() {
	          _this.imageElement.killTimeline(thisTimeline);
	        }
	      });
	      var origBrightness = 100;
	      var currBrightness = origBrightness;
	      var targetBrightness = 200;
	
	      var flashUpTime = duration * 0.2;
	      var flashDownTime = duration - flashUpTime;
	
	      var currActive = null;
	      thisTimeline.to(this.canvas, flashUpTime, {
	        onStart: function onStart() {
	          currActive = thisTimeline.getActive()[0];
	          _this.imageElement.tweens.push(currActive);
	        },
	        onUpdate: function onUpdate() {
	          if (currActive) {
	            currBrightness = origBrightness + (targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2);
	            Tween.set(_this.canvas, {
	              css: {
	                '-webkit-filter': 'brightness(' + currBrightness + '%)'
	              }
	            });
	          }
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(currActive);
	        }
	      });
	      thisTimeline.to(this.canvas, flashDownTime, {
	        onStart: function onStart() {
	          currActive = thisTimeline.getActive()[0];
	          _this.imageElement.tweens.push(currActive);
	        },
	        onUpdate: function onUpdate() {
	          if (currActive) {
	            currBrightness = targetBrightness - (targetBrightness - origBrightness) * Math.pow(currActive.progress(), 2);
	            Tween.set(_this.canvas, {
	              css: {
	                '-webkit-filter': 'brightness(' + currBrightness + '%)'
	              }
	            });
	          }
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(currActive);
	        }
	      });
	      thisTimeline.to(this.canvas, 0, {
	        clearProps: '-webkit-filter'
	      });
	
	      this.imageElement.timelines.push(thisTimeline);
	    }
	  }]);
	
	  return FlashStep;
	}();
	
	exports.default = FlashStep;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single, document, window, Image, requestAnimationFrame */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _pointUtils = __webpack_require__(18);
	
	var _pointUtils2 = _interopRequireDefault(_pointUtils);
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _imageConst = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Tween = __webpack_require__(12);
	
	var BASE_RADIUS = 135;
	var BASE_GROUP_RADIUS = 225;
	var MAX_GROUP_RADIUS = 390;
	var CIRCLE_OFFSET = 10;
	var CIRCLE_GROUP_OFFSET = 75;
	var LINE_WIDTH = 2;
	var LINE_WIDTH_PRINT = 7;
	var LINE_TRANSLATE_OFFSET = 0;
	
	var CanvasUtils = function () {
	  function CanvasUtils(imageElement) {
	    _classCallCheck(this, CanvasUtils);
	
	    this.imageElement = imageElement;
	
	    this.pointUtils = new _pointUtils2.default(imageElement);
	
	    this.shapeScale = 1;
	
	    if (single) {
	      this.shapeScale = 2;
	    }
	
	    this.PIXEL_RATIO = function () {
	      var ctx = document.createElement('canvas').getContext('2d'),
	          dpr = window.devicePixelRatio || 1,
	          bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
	
	      return dpr / bsr;
	    }();
	
	    this.isGroup = this.imageElement.facesAndEmotions.length !== 1;
	  }
	
	  _createClass(CanvasUtils, [{
	    key: 'retraceCanvas',
	    value: function retraceCanvas() {
	      this.imageElement.context.beginPath();
	      this.imageElement.context.moveTo(0, 0);
	      this.imageElement.context.lineTo(this.imageElement.canvas.width, 0);
	      this.imageElement.context.lineTo(this.imageElement.canvas.width, this.imageElement.canvas.height);
	      this.imageElement.context.lineTo(0, this.imageElement.canvas.height);
	      this.imageElement.context.lineTo(0, 0);
	      this.imageElement.context.closePath();
	    }
	  }, {
	    key: 'createHiDPICanvas',
	    value: function createHiDPICanvas(w, h, ratio) {
	      if (!ratio) {
	        ratio = this.PIXEL_RATIO;
	      }
	      var tempCanvas = document.createElement('canvas');
	      tempCanvas.width = w * ratio;
	      tempCanvas.height = h * ratio;
	      tempCanvas.style.width = w + 'px';
	      tempCanvas.style.height = h + 'px';
	      tempCanvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
	      return tempCanvas;
	    }
	  }, {
	    key: 'drawScrim',
	    value: function drawScrim() {
	      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
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
	  }, {
	    key: 'redrawCurrentCanvas',
	    value: function redrawCurrentCanvas() {
	      this.retraceCanvas();
	      this.imageElement.context.globalAlpha = 1;
	      this.imageElement.context.globalCompositeOperation = 'source-over';
	      this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
	      this.imageElement.context.fillStyle = this.imageElement.canvasSnapshot;
	      this.imageElement.context.fill();
	    }
	  }, {
	    key: 'redrawBaseImage',
	    value: function redrawBaseImage() {
	      this.retraceCanvas();
	      this.imageElement.context.globalAlpha = 1;
	      this.imageElement.context.globalCompositeOperation = 'source-over';
	      this.imageElement.context.clearRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
	
	      this.fillBackground();
	
	      if (single && (this.imageElement.offsetY < 0 || this.imageElement.offsetX < 0)) {
	        this.imageElement.offsetX = (this.imageElement.subRect.width - this.imageElement.image.width) / 2 / this.imageElement.resizedImageScale;
	        this.imageElement.offsetY = (this.imageElement.subRect.height - this.imageElement.image.height) / this.imageElement.resizedImageScale;
	
	        this.imageElement.context.drawImage(this.imageElement.image, 0, 0, this.imageElement.image.width, this.imageElement.image.height, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.canvas.width - 2 * this.imageElement.offsetX, this.imageElement.canvas.height - this.imageElement.offsetY);
	
	        this.imageElement.resizedImageOffset = {
	          x: this.imageElement.offsetX * -1 * this.imageElement.resizedImageScale,
	          y: this.imageElement.offsetY * -1 * this.imageElement.resizedImageScale
	        };
	
	        if (this.imageElement.backgroundFill === 'blue' || this.imageElement.backgroundFill === 'rgba(0, 0, 255, 1)') {
	          var dataSample = animationUtils.getSquareColorSample(this.imageElement.canvas, 10, new geometryUtils.Point(this.imageElement.canvas.width / 2, this.imageElement.offsetY));
	          this.imageElement.backgroundFill = dataSample;
	          this.redrawBaseImage();
	        }
	      } else {
	        this.imageElement.context.drawImage(this.imageElement.image, this.imageElement.offsetX, this.imageElement.offsetY, this.imageElement.subRect.width, this.imageElement.subRect.height, 0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
	        if (this.imageElement.backgroundFill === 'blue' || this.imageElement.backgroundFill === 'rgba(0, 0, 255, 1)') {
	          var sampleOffset = 1;
	          if (this.imageElement.resizedImageScale) {
	            sampleOffset = this.imageElement.imageScale / this.imageElement.resizedImageScale;
	          }
	
	          var _dataSample = animationUtils.getSquareColorSample(this.imageElement.canvas, 10, new geometryUtils.Point(Math.min(this.imageElement.canvas.width / 2, Math.abs(this.imageElement.offsetX)), Math.min(this.imageElement.offsetY, 0) * -1 * sampleOffset));
	
	          this.imageElement.backgroundFill = _dataSample;
	          this.redrawBaseImage();
	        }
	      }
	    }
	  }, {
	    key: 'loadImage',
	    value: function loadImage(json, imgPath) {
	      var _this = this;
	
	      this.imageElement.reinitFaces(json);
	
	      var image = new Image();
	      image.src = imgPath || this.imgPath;
	
	      image.onload = function () {
	        _this.imageElement.image = image;
	        _this.imageElement.killAnimations();
	        _this.setImageScale();
	        _this.generateHexInfo();
	        _this.cleanUpImage();
	      };
	    }
	  }, {
	    key: 'drawRect',
	    value: function drawRect(topLeft, width, height) {
	      var _this2 = this;
	
	      var alpha = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
	
	      this.imageElement.ifNotDrawing(function () {
	        _this2.imageElement.context.clearRect(0, 0, _this2.imageElement.canvas.width, _this2.imageElement.canvas.height);
	        _this2.imageElement.context.drawImage(_this2.imageElement.image, _this2.imageElement.offsetX, _this2.imageElement.offsetY, _this2.imageElement.width, _this2.imageElement.height, 0, 0, _this2.imageElement.canvas.width, _this2.imageElement.canvas.height);
	        _this2.drawScrim(function () {
	          var x = _this2.pointUtils.toGridCoords(topLeft.x, 'x');
	          var y = _this2.pointUtils.toGridCoords(topLeft.y, 'y');
	          var w = _this2.pointUtils.toGridCoords(width);
	          var h = _this2.pointUtils.toGridCoords(height);
	
	          _this2.imageElement.context.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
	          _this2.imageElement.context.lineWidth = 5;
	          _this2.imageElement.context.strokeRect(x, y, w, h);
	        });
	      });
	    }
	  }, {
	    key: 'getSubRectDimension',
	    value: function getSubRectDimension(image) {
	      var width = this.imageElement.canvas.width;
	      var height = this.imageElement.canvas.height;
	
	      var widthsRatio = this.imageElement.canvas.width / image.width;
	      var heightsRatio = this.imageElement.canvas.height / image.height;
	
	      if (widthsRatio > heightsRatio) {
	        width = image.width;
	        height = this.imageElement.canvas.height / widthsRatio;
	        this.imageElement.imageScale = 1 / widthsRatio;
	      } else {
	        height = image.height;
	        width = this.imageElement.canvas.width / heightsRatio;
	        this.imageElement.imageScale = 1 / heightsRatio;
	      }
	
	      return { width: width, height: height };
	    }
	  }, {
	    key: 'setImageScale',
	    value: function setImageScale() {
	      var image = arguments.length <= 0 || arguments[0] === undefined ? this.imageElement.image : arguments[0];
	
	      var widthsRatio = this.imageElement.canvas.width / image.width;
	      var heightsRatio = this.imageElement.canvas.height / image.height;
	
	      if (widthsRatio > heightsRatio) {
	        this.imageElement.imageScale = 1 / widthsRatio;
	      } else {
	        this.imageElement.imageScale = 1 / heightsRatio;
	      }
	    }
	  }, {
	    key: 'cleanUpImage',
	    value: function cleanUpImage() {
	      var _this3 = this;
	
	      this.resizeContent(function () {
	        _this3.generateHexInfo();
	        if (_this3.imageElement.readyCallback) {
	          _this3.imageElement.readyCallback();
	        }
	      });
	    }
	  }, {
	    key: 'resizeContent',
	    value: function resizeContent() {
	      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      var scaledMin = animationUtils.MIN_HEX_RADIUS * this.imageElement.canvas.height;
	      var scaledMax = animationUtils.MAX_HEX_RADIUS * this.imageElement.canvas.height;
	      var targetHexR = this.imageElement.hexR;
	
	      if (this.imageElement.hexR < scaledMin) {
	        // make sure that we don't scale the image too much
	        if (scaledMin - this.imageElement.hexR > this.imageElement.hexR * animationUtils.MAX_HEX_DIFF) {
	          targetHexR = this.imageElement.hexR + this.imageElement.hexR * animationUtils.MAX_HEX_DIFF;
	        } else {
	          targetHexR = scaledMin;
	        }
	      } else if (this.imageElement.hexR > scaledMax) {
	        if (this.imageElement.hexR - scaledMax > this.imageElement.hexR * animationUtils.MAX_HEX_DIFF) {
	          targetHexR = this.imageElement.hexR - this.imageElement.hexR * animationUtils.MAX_HEX_DIFF;
	        } else {
	          targetHexR = scaledMax;
	        }
	      }
	
	      // work backwards.
	      var targetFaceDiff = targetHexR;
	      var currentFaceDiff = this.imageElement.faceBounds.right - this.imageElement.faceBounds.left;
	      // 1. get target difference between left and right face edges.
	      if (this.imageElement.faces.length === 1) {
	        targetFaceDiff /= 2;
	      }
	      targetFaceDiff *= Math.sqrt(3);
	      // 2. use this to calculate different, ideal image scale.
	      var newImageScale = 1 / (targetFaceDiff / currentFaceDiff);
	
	      this.imageElement.subRect = {
	        width: this.imageElement.canvas.width * newImageScale,
	        height: this.imageElement.canvas.height * newImageScale
	      };
	
	      if (this.imageElement.image.width < this.imageElement.subRect.width) {
	        this.imageElement.subRect.width = this.imageElement.image.width;
	        this.imageElement.subRect.height = this.imageElement.canvas.height / this.imageElement.canvas.width * this.imageElement.subRect.width;
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
	  }, {
	    key: 'generateHexInfo',
	    value: function generateHexInfo() {
	      this.imageElement.hexR = this.createHexR();
	      this.imageElement.hexVertices = this.createHexVertices(this.imageElement.hexR);
	    }
	  }, {
	    key: 'createHexR',
	    value: function createHexR() {
	      var r = 1;
	      var baseDistance = geometryUtils.distanceFromCoords(new geometryUtils.Point(this.imageElement.faceBounds.left, this.imageElement.faceBounds.bottom), new geometryUtils.Point(this.imageElement.faceBounds.right, this.imageElement.faceBounds.top));
	
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
	  }, {
	    key: 'createHexVertices',
	    value: function createHexVertices() {
	      var radius = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      return geometryUtils.createRoundedHexagon(radius, radius / 6);
	    }
	  }, {
	    key: 'cutOutHex',
	    value: function cutOutHex() {
	      var _this4 = this;
	
	      var closePath = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
	
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
	
	      this.imageElement.hexVertices.forEach(function (vertex, i, vertices) {
	        if (i === 0) {
	          _this4.imageElement.context.moveTo(vertex.x, vertex.y);
	          return;
	        }
	        if (i % 2 === 0) {
	          _this4.imageElement.context.lineTo(vertex.x, vertex.y);
	        } else {
	          var prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
	          var xMid = (vertex.x + prev.x) / 2;
	          var yMid = (vertex.y + prev.y) / 2;
	          var r = geometryUtils.distanceFromCoords(prev, vertex) / 2;
	
	          var bigIndex = Math.floor(i / 2);
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
	
	          var startAngle = (30 + bigIndex * -1 * 60 + 360) % 360;
	          var endAngle = (startAngle - 60 + 360) % 360;
	
	          _this4.imageElement.context.arc(xMid, yMid, r, startAngle / 360 * (Math.PI * 2), endAngle / 360 * (Math.PI * 2), true);
	        }
	      });
	
	      if (closePath) {
	        this.imageElement.context.closePath();
	      }
	      this.imageElement.context.restore();
	    }
	  }, {
	    key: 'cutOutCircle',
	    value: function cutOutCircle() {
	      var closePath = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
	
	      var baseRadius = this.getBaseRadius();
	
	      var circleOffset = CIRCLE_OFFSET;
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
	  }, {
	    key: 'fillBackground',
	    value: function fillBackground() {
	      this.imageElement.context.fillStyle = this.imageElement.backgroundFill;
	      this.imageElement.context.globalAlpha = 1;
	      this.imageElement.context.globalCompositeOperation = 'source-over';
	      this.imageElement.context.fillRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
	    }
	  }, {
	    key: 'drawBackgroundWithAlpha',
	    value: function drawBackgroundWithAlpha() {
	      var alpha = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      this.imageElement.context.save();
	
	      this.imageElement.context.fillStyle = this.imageElement.treatments.treatment.noEmotionScrim ? colorUtils.subAlpha(colorUtils.NEUTRAL, 0.25) : this.imageElement.treatments.treatment.background;
	      this.imageElement.context.globalCompositeOperation = 'multiply';
	      this.imageElement.context.globalAlpha = alpha;
	
	      this.imageElement.context.fill();
	      this.imageElement.context.restore();
	    }
	  }, {
	    key: 'drawVignetteWithAlpha',
	    value: function drawVignetteWithAlpha() {
	      var alpha = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      this.imageElement.context.save();
	
	      this.imageElement.context.fillStyle = this.vignettePattern;
	      this.imageElement.context.globalCompositeOperation = 'overlay';
	      this.imageElement.context.globalAlpha = alpha;
	      this.imageElement.context.fill();
	      this.imageElement.context.restore();
	    }
	  }, {
	    key: 'applyFill',
	    value: function applyFill(fill) {
	      this.imageElement.isDrawing = false;
	      this.imageElement.context.fillStyle = fill.style;
	      this.imageElement.context.globalCompositeOperation = fill.comp || 'source-over';
	      this.imageElement.context.globalAlpha = fill.alpha || 1;
	
	      this.imageElement.context.fillRect(0, 0, this.imageElement.canvas.width, this.imageElement.canvas.height);
	
	      this.imageElement.context.globalCompositeOperation = 'source-over';
	      this.imageElement.context.globalAlpha = 1;
	      this.imageElement.isDrawing = false;
	    }
	  }, {
	    key: 'createSimpleGradient',
	    value: function createSimpleGradient() {
	      var centerColor = arguments.length <= 0 || arguments[0] === undefined ? colorUtils.WHITE : arguments[0];
	      var edgeColor = arguments.length <= 1 || arguments[1] === undefined ? colorUtils.BLACK : arguments[1];
	      var radiusFactor = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
	      var centered = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
	      var colorstop1 = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
	      var colorstop2 = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
	
	      var x = centered ? this.imageElement.canvas.width / 2 : this.imageElement.eyesMidpoint.x;
	      var y = centered ? this.imageElement.canvas.height / 2 : this.imageElement.eyesMidpoint.y;
	
	      var gradient = this.imageElement.context.createRadialGradient(x, y, 0, x, y, this.imageElement.canvas.height * (radiusFactor || 1));
	
	      gradient.addColorStop(colorstop1, centerColor);
	      gradient.addColorStop(colorstop2, edgeColor);
	
	      return gradient;
	    }
	  }, {
	    key: 'getBaseRadius',
	    value: function getBaseRadius() {
	      var baseRadius = BASE_RADIUS * this.shapeScale;
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
	  }, {
	    key: 'createShapeBackground',
	    value: function createShapeBackground(opacityProgress) {
	      var opacity = opacityProgress;
	      this.imageElement.context.save();
	      this.imageElement.context.moveTo(0, 0);
	      this.imageElement.context.translate(0, 0);
	
	      var group = this.isGroup;
	      var color = null;
	
	      var EMO_COLOR = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
	      if (!this.imageElement.noEmotions) {
	        if (group) {
	          EMO_COLOR = (0, _animationUtils.getStrongestColor)(this.imageElement)[0];
	        } else {
	          EMO_COLOR = this.imageElement.treatments.treatment.background;
	        }
	      }
	
	      color = this.imageElement.noEmotions ? colorUtils.subAlpha(colorUtils.NEUTRAL_WHITE, opacity * 0.5) : colorUtils.subAlpha(EMO_COLOR, opacity * 0.9);
	
	      var baseRadius = this.getBaseRadius();
	
	      var circleOffset = CIRCLE_OFFSET;
	      if (group) {
	        circleOffset = CIRCLE_GROUP_OFFSET;
	      }
	
	      var fillColor = this.createSimpleGradient(colorUtils.TRANSPARENT, color, 0, false);
	
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
	  }, {
	    key: 'getEmoColor',
	    value: function getEmoColor() {
	      var emoColor = void 0;
	      if (this.imageElement.noEmotions) {
	        emoColor = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
	      } else {
	        emoColor = 'rgba(255, 255, 255, 1)';
	      }
	      return emoColor;
	    }
	  }, {
	    key: 'drawCircle',
	    value: function drawCircle() {
	      var group = this.isGroup;
	
	      var baseRadius = this.getBaseRadius();
	
	      var emoColor = this.getEmoColor();
	
	      var circleOffset = CIRCLE_OFFSET;
	      if (group) {
	        circleOffset = CIRCLE_GROUP_OFFSET;
	      }
	
	      this.imageElement.context.save();
	
	      var perc = ease.expOut(0, 1, this.imageElement.currentFrame / _imageConst.TOTAL_CIRCLE_FRAMES);
	
	      if (this.imageElement.currentFrame < _imageConst.TOTAL_CIRCLE_FRAMES) {
	        requestAnimationFrame(this.drawCircle.bind(this));
	        var lineSize = LINE_WIDTH;
	        if (this.shapeScale === 2) lineSize = LINE_WIDTH_PRINT;
	
	        this.imageElement.context.save();
	        this.imageElement.context.globalCompositeOperation = 'source-over';
	        this.imageElement.context.strokeStyle = emoColor;
	        this.imageElement.context.lineWidth = lineSize;
	        this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
	        this.imageElement.context.beginPath();
	
	        this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, Math.PI * 2 * perc);
	
	        this.imageElement.context.stroke();
	        this.imageElement.context.restore();
	        this.imageElement.currentFrame++;
	      } else {
	        this.createTopShapes(true, 0);
	      }
	
	      this.imageElement.context.restore();
	    }
	  }, {
	    key: 'createTopShapes',
	    value: function createTopShapes(single, progress) {
	      var group = this.isGroup;
	      var blendMode = 'source-over';
	
	      this.imageElement.context.save();
	      this.imageElement.context.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
	
	      var emoColor = this.getEmoColor();
	
	      var circleOffset = CIRCLE_OFFSET;
	      if (group) {
	        circleOffset = CIRCLE_GROUP_OFFSET;
	      }
	
	      var lineSize = LINE_WIDTH;
	      if (this.shapeScale === 2) lineSize = LINE_WIDTH_PRINT;
	
	      this.imageElement.context.restore();
	      this.imageElement.context.save();
	      this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
	      this.imageElement.context.strokeStyle = emoColor;
	      this.imageElement.context.lineWidth = lineSize;
	      this.imageElement.context.globalCompositeOperation = blendMode;
	
	      var baseRadius = this.getBaseRadius();
	
	      this.imageElement.context.beginPath();
	      this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius, 0, Math.PI * 2);
	      this.imageElement.context.closePath();
	      this.imageElement.context.stroke();
	
	      if (!this.imageElement.randomizedArcs) {
	        this.imageElement.randomizedArcs = [];
	        for (var i = 0; i < 3; i++) {
	          this.imageElement.randomizedArcs.push(Math.random() * Math.PI);
	        }
	      }
	
	      if (!single) {
	
	        if (!this.imageElement.shapesInit) {
	          this.imageElement.shapesInit = true;
	
	          this.circleAnim = 0;
	
	          var timing = 1.5;
	
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
	
	        var randomOffset = this.imageElement.randomizedArcs[0];
	
	        this.imageElement.context.beginPath();
	        this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + 15 * (this.shapeScale * 1.25), randomOffset, randomOffset + this.circleAnim * Math.PI);
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
	        this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + 35 * (this.shapeScale * 1.25), randomOffset, randomOffset + this.circleAnim * (Math.PI * 0.5));
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
	        this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + 55 * (this.shapeScale * 1.25), randomOffset + -(0.1 * Math.PI), randomOffset + this.circleAnim * (Math.PI * 0.7));
	        this.imageElement.context.stroke();
	
	        // 5
	
	        this.imageElement.context.restore();
	        this.imageElement.context.save();
	        this.imageElement.context.translate(LINE_TRANSLATE_OFFSET, LINE_TRANSLATE_OFFSET);
	        this.imageElement.context.strokeStyle = emoColor;
	        this.imageElement.context.lineWidth = lineSize;
	        this.imageElement.context.globalCompositeOperation = blendMode;
	
	        this.imageElement.context.beginPath();
	        this.imageElement.context.arc(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y + circleOffset, baseRadius + 55 * (this.shapeScale * 1.25), randomOffset + 0.8 * Math.PI, randomOffset + (0.8 * Math.PI + this.circleAnim * Math.PI));
	        this.imageElement.context.stroke();
	      }
	
	      this.imageElement.context.restore();
	    }
	  }]);
	
	  return CanvasUtils;
	}();
	
	exports.default = CanvasUtils;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var PointUtils = function () {
	  function PointUtils(imageElement) {
	    _classCallCheck(this, PointUtils);
	
	    this.imageElement = imageElement;
	  }
	
	  _createClass(PointUtils, [{
	    key: 'drawPointsWithAnim',
	    value: function drawPointsWithAnim(points, duration) {
	      var _this = this;
	
	      var timeline = new Timeline({
	        onComplete: function onComplete() {
	          _this.imageElement.killTimeline(timeline);
	        }
	      });
	
	      var active = null;
	      var prog = 0;
	      timeline.to(this.imageElement.canvas, animationUtils.POINTS_FADE_DURATION, {
	        onStart: function onStart() {
	          active = timeline.getActive()[0];
	          _this.imageElement.tweens.push(active);
	        },
	        onUpdate: function onUpdate() {
	          prog = active.progress();
	          _this.drawPoints(points, prog);
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(active);
	        }
	      });
	      timeline.to(this.imageElement.canvas, duration - animationUtils.POINTS_FADE_DURATION * 2, {
	        onStart: function onStart() {
	          active = timeline.getActive()[0];
	          _this.imageElement.tweens.push(active);
	        },
	        onUpdate: function onUpdate() {
	          _this.drawPoints(points);
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(active);
	        }
	      });
	      timeline.to(this.imageElement.canvas, animationUtils.POINTS_FADE_DURATION, {
	        onStart: function onStart() {
	          active = timeline.getActive()[0];
	          _this.imageElement.tweens.push(active);
	        },
	        onUpdate: function onUpdate() {
	          prog = active.progress();
	          _this.drawPoints(points, 1 - prog);
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(active);
	        }
	      });
	
	      this.imageElement.timelines.push(timeline);
	    }
	  }, {
	    key: 'drawPoints',
	    value: function drawPoints() {
	      var _this2 = this;
	
	      var points = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	      var alpha = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	
	      if (points.length === 0) {
	        return;
	      }
	
	      this.imageElement.ifNotDrawing(function () {
	        _this2.imageElement.context.clearRect(0, 0, _this2.imageElement.canvas.width, _this2.imageElement.canvas.height);
	        _this2.imageElement.context.drawImage(_this2.imageElement.image, _this2.imageElement.offsetX, _this2.imageElement.offsetY, _this2.width, _this2.height, 0, 0, _this2.imageElement.canvas.width, _this2.imageElement.canvas.height);
	        _this2.imageElement.canvasUtils.drawScrim(function () {
	          points.forEach(function (point, index) {
	            _this2.drawPoint(point, alpha, index === points.length - 1);
	          });
	        });
	      });
	    }
	  }, {
	    key: 'pointToGridCoords',
	    value: function pointToGridCoords() {
	      var point = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      if (!point) {
	        return new geometryUtils.Point(0, 0);
	      }
	
	      return new geometryUtils.Point(this.toGridCoords(point.x, 'x'), this.toGridCoords(point.y, 'y'));
	    }
	  }, {
	    key: 'drawPoint',
	    value: function drawPoint(point) {
	      var alpha = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	      var isLast = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	
	      this.imageElement.isDrawing = false;
	
	      var x = this.toGridCoords(point.position.x, 'x');
	      var y = this.toGridCoords(point.position.y, 'y');
	
	      this.imageElement.context.beginPath();
	      this.imageElement.context.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
	      this.imageElement.context.arc(x, y, 3, 0, Math.PI * 2);
	      this.imageElement.context.fill();
	      this.imageElement.context.closePath();
	
	      if (isLast) {
	        this.imageElement.isDrawing = false;
	      }
	    }
	  }, {
	    key: 'toGridCoords',
	    value: function toGridCoords() {
	      var value = arguments.length <= 0 || arguments[0] === undefined ? this.imageElement.canvas.width : arguments[0];
	      var axis = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	
	      var offset = 0;
	      if (axis === 'x') {
	        if (this.imageElement.offsetX === 0 && this.imageElement.resizedImageOffset) {
	          offset = this.imageElement.resizedImageOffset.x;
	        } else {
	          offset = this.imageElement.offsetX;
	        }
	      } else if (axis === 'y') {
	        if (this.imageElement.offsetY === 0 && this.imageElement.resizedImageOffset) {
	          offset = this.imageElement.resizedImageOffset.y;
	        } else {
	          offset = this.imageElement.offsetY;
	        }
	      }
	
	      // this.imageElement.resizedImageOffset
	      // this.imageElement.imageScale
	
	
	      return (value - offset) / this.imageElement.imageScale;
	    }
	  }]);
	
	  return PointUtils;
	}();
	
	exports.default = PointUtils;

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.linear = linear;
	exports.square = square;
	exports.cube = cube;
	exports.exp = exp;
	exports.expOut = expOut;
	function linear() {
	  var startVal = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var endVal = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var progress = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  return startVal + (endVal - startVal) * progress;
	}
	
	function square() {
	  var startVal = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var endVal = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var progress = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  return startVal + (endVal - startVal) * Math.pow(progress, 2);
	}
	
	function cube() {
	  var startVal = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var endVal = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var progress = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  return startVal + (endVal - startVal) * Math.pow(progress, 3);
	}
	
	function exp() {
	  var startVal = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var endVal = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var progress = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  return startVal + (endVal - startVal) * Math.pow(2, 10 * (progress - 1));
	}
	
	function expOut() {
	  var startVal = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	  var endVal = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var progress = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	  return startVal + (endVal - startVal) * (-1 * Math.pow(2, -10 * progress) + 1);
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _utils = __webpack_require__(21);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _pointUtils = __webpack_require__(18);
	
	var _pointUtils2 = _interopRequireDefault(_pointUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Tween = __webpack_require__(12);
	
	var ZoomStep = function () {
	  function ZoomStep(imageElement, canvas, context) {
	    _classCallCheck(this, ZoomStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	    this.pointUtils = new _pointUtils2.default(imageElement);
	  }
	
	  _createClass(ZoomStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	      this.pointUtils = null;
	    }
	  }, {
	    key: 'zoom',
	    value: function zoom() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var zoomOut = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	
	      var topLeft = new geometryUtils.Point(utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[0].x), utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[0].y));
	
	      var width = Math.abs(topLeft.x - utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[1].x));
	      width += geometryUtils.createPadding(width);
	
	      var height = Math.abs(topLeft.y - utils.thisOrZero(this.imageElement.json[this.imageElement.currFace].boundingPoly.vertices[2].y));
	      height += geometryUtils.createPadding(height);
	
	      var centerX = topLeft.x + width / 2;
	      var centerY = topLeft.y + height / 2;
	
	      if (height > width) {
	        width = this.canvas.width / this.canvas.height * height;
	      } else {
	        height = this.canvas.height / this.canvas.width * width;
	      }
	
	      var targetLeft = Math.max(centerX - width / 2, 0);
	      var targetTop = Math.max(centerY - height / 2, 0);
	
	      if (zoomOut) {
	        width = this.imageElement.subRect.width;
	        height = this.imageElement.subRect.height;
	
	        targetLeft = this.imageElement.resizedImageOffset ? this.imageElement.resizedImageOffset.x : 0;
	        targetTop = this.imageElement.resizedImageOffset ? this.imageElement.resizedImageOffset.y : 0;
	      }
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.imageElement.isDrawing = false;
	
	          _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
	
	          _this.canvasUtils.fillBackground();
	
	          _this.context.drawImage(_this.imageElement.image, targetLeft, targetTop, _this.imageElement.width, _this.imageElement.height, 0, 0, _this.canvas.width, _this.canvas.height);
	          _this.imageElement.offsetX = targetLeft;
	          _this.imageElement.offsetY = targetTop;
	          _this.imageElement.width = width;
	          _this.imageElement.height = height;
	          _this.imageElement.imageScale = width / _this.canvas.width;
	
	          if (zoomOut) {
	            _this.imageElement.eyesMidpoint = _this.pointUtils.pointToGridCoords(_this.imageElement.allEyesCenter);
	          } else {
	            _this.imageElement.eyesMidpoint = _this.pointUtils.pointToGridCoords(_this.imageElement.eyeMidpoints[_this.imageElement.currFace]);
	          }
	
	          _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	
	          _this.imageElement.isDrawing = false;
	        });
	      } else {
	        (function () {
	          var tween = Tween.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              _this.imageElement.isDrawing = false;
	              _this.imageElement.tweens.push(tween);
	            },
	            onUpdate: function onUpdate() {
	              var prog = tween.progress();
	              var currX = _this.imageElement.offsetX - (_this.imageElement.offsetX - targetLeft) * prog;
	              var currY = _this.imageElement.offsetY - (_this.imageElement.offsetY - targetTop) * prog;
	
	              var currWidth = _this.imageElement.width - (_this.imageElement.width - width) * prog;
	              var currHeight = _this.imageElement.height - (_this.imageElement.height - height) * prog;
	
	              _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
	
	              _this.canvasUtils.fillBackground();
	
	              _this.context.drawImage(_this.imageElement.image, currX, currY, currWidth, currHeight, 0, 0, _this.canvas.width, _this.canvas.height);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.offsetX = targetLeft;
	              _this.imageElement.offsetY = targetTop;
	              _this.imageElement.width = width;
	              _this.imageElement.height = height;
	              _this.imageElement.imageScale = width / _this.canvas.width;
	              if (zoomOut) {
	                _this.imageElement.eyesMidpoint = _this.pointUtils.pointToGridCoords(_this.imageElement.allEyesCenter);
	              } else {
	                _this.imageElement.eyesMidpoint = _this.pointUtils.pointToGridCoords(_this.imageElement.eyeMidpoints[_this.imageElement.currFace]);
	              }
	              _this.imageElement.killTween(tween);
	
	              _this.imageElement.isDrawing = false;
	              _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	            }
	          });
	          _this.imageElement.tweens.push(tween);
	        })();
	      }
	    }
	  }]);
	
	  return ZoomStep;
	}();
	
	exports.default = ZoomStep;

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.actualCompare = actualCompare;
	exports.randomOrder = randomOrder;
	exports.thisOrZero = thisOrZero;
	function actualCompare(a, b) {
	  return a - b;
	}
	
	function randomOrder() {
	  var inputArr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	
	  var chosenIndices = [];
	  var inputLength = inputArr.length;
	  var outputArr = [];
	
	  while (outputArr.length < inputLength) {
	    var nextIndex = Math.floor(Math.random() * inputLength);
	    if (!chosenIndices.includes(nextIndex)) {
	      outputArr.push(inputArr[nextIndex]);
	      chosenIndices.push(nextIndex);
	    }
	  }
	
	  return outputArr;
	}
	
	function thisOrZero(val) {
	  if (typeof val === 'undefined' || !val) {
	    return 0;
	  }
	  return val;
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _faceUtils = __webpack_require__(6);
	
	var faceUtils = _interopRequireWildcard(_faceUtils);
	
	var _pointUtils = __webpack_require__(18);
	
	var _pointUtils2 = _interopRequireDefault(_pointUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var FaceStep = function () {
	  function FaceStep(imageElement, canvas, context) {
	    _classCallCheck(this, FaceStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	    this.pointUtils = new _pointUtils2.default(imageElement);
	  }
	
	  _createClass(FaceStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	      this.pointUtils = null;
	    }
	  }, {
	    key: 'ears',
	    value: function ears() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EARS), duration);
	    }
	  }, {
	    key: 'forehead',
	    value: function forehead() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FOREHEAD), duration);
	    }
	  }, {
	    key: 'nose',
	    value: function nose() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.NOSE), duration);
	    }
	  }, {
	    key: 'mouth',
	    value: function mouth() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.MOUTH), duration);
	    }
	  }, {
	    key: 'chin',
	    value: function chin() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.CHIN), duration);
	    }
	  }, {
	    key: 'eyes',
	    value: function eyes() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EYES), duration);
	    }
	  }, {
	    key: 'face',
	    value: function face() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 3 : arguments[0];
	
	      var boundingPoly = this.imageElement.json[this.imageElement.currFace].fdBoundingPoly;
	      var topLeft = boundingPoly.vertices[0];
	      var width = Math.abs(topLeft.x - boundingPoly.vertices[1].x);
	      var height = Math.abs(topLeft.y - boundingPoly.vertices[2].y);
	
	      var timeline = new Timeline({
	        onComplete: function onComplete() {
	          _this.imageElement.killTimeline(timeline);
	        }
	      });
	      var active = null;
	      var prog = 0;
	
	      timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
	        onStart: function onStart() {
	          _this.imageElementscrimAlpha = 1;
	          _this.context.globalAlpha = 1;
	          _this.context.globalCompositeOperation = 'source-over';
	          active = timeline.getActive()[0];
	          _this.imageElement.tweens.push(active);
	        },
	        onUpdate: function onUpdate() {
	          prog = active.progress();
	          _this.imageElementisDrawing = false;
	          _this.canvasUtils.drawRect(topLeft, width, height, prog);
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(active);
	        }
	      });
	      timeline.to(this.canvas, duration - animationUtils.POINTS_FADE_DURATION * 2, {
	        onStart: function onStart() {
	          _this.canvasUtils.drawRect(topLeft, width, height, 1);
	        }
	      });
	      timeline.to(this.canvas, animationUtils.POINTS_FADE_DURATION, {
	        onStart: function onStart() {
	          active = timeline.getActive()[0];
	          _this.imageElement.tweens.push(active);
	        },
	        onUpdate: function onUpdate() {
	          prog = active.progress();
	          _this.canvasUtils.drawRect(topLeft, width, height, 1 - prog);
	        },
	        onComplete: function onComplete() {
	          _this.imageElement.killTween(active);
	        }
	      });
	
	      this.imageElement.timelines.push(timeline);
	    }
	  }, {
	    key: 'allFeatures',
	    value: function allFeatures() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      if (!this.imageElementisDrawing) {
	        this.pointUtils.drawPointsWithAnim(this.imageElement.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FULL), duration);
	      }
	    }
	  }]);
	
	  return FaceStep;
	}();
	
	exports.default = FaceStep;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var EmotionStep = function () {
	  function EmotionStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, EmotionStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.emotion(duration);
	  }
	
	  _createClass(EmotionStep, [{
	    key: 'emotion',
	    value: function emotion(duration) {
	      var _this = this;
	
	      this.imageElement.ntscrimAlpha = 0;
	
	      this.imageElement.ifNotDrawing(function () {
	        _this.canvasUtils.drawScrim();
	        if (_this.imageElement.faces.length > 1) {
	          _this.personalColor(duration);
	        }
	      });
	    }
	  }, {
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'personalColor',
	    value: function personalColor() {
	      var _this2 = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var fillColors = this.imageElement.treatments.personalAuraColors[this.imageElement.currFace];
	      this.imageElement.fills = [];
	
	      // maybe have scrim pulse instead of just drawing?
	      if (fillColors.length === 1) {
	        this.canvasUtils.applyFill({
	          style: fillColors[0],
	          comp: 'multiply',
	          alpha: 0.35
	        });
	        this.canvasUtils.redrawCurrentCanvas();
	      } else {
	        (function () {
	          var colorTimeline = new Timeline({
	            onStart: function onStart() {
	              _this2.imageElement.timelines.push(colorTimeline);
	            },
	            onComplete: function onComplete() {
	              _this2.imageElement.killTimeline(colorTimeline);
	            }
	          });
	
	          var active = null;
	          var gradient = null;
	
	          colorTimeline.to(_this2.canvas, duration * 0.75, {
	            onStart: function onStart() {
	              active = colorTimeline.getActive()[0];
	              _this2.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              _this2.canvasUtils.redrawCurrentCanvas();
	
	              var progress = active.progress();
	              var opacity = ease.expOut(0.5, 1, progress);
	              var radius = ease.expOut(0, 1, progress);
	
	              gradient = _this2.canvasUtils.createSimpleGradient(fillColors[0], fillColors[1], radius);
	
	              _this2.canvasUtils.applyFill({
	                style: gradient,
	                comp: 'screen',
	                alpha: opacity
	              });
	            },
	            onComplete: function onComplete() {
	              _this2.imageElement.killTween(active);
	            }
	          });
	          colorTimeline.to(_this2.canvas, duration * 0.25, {
	            onStart: function onStart() {
	              active = colorTimeline.getActive()[0];
	              _this2.canvasUtils.redrawCurrentCanvas();
	
	              _this2.canvasUtils.applyFill({
	                style: gradient,
	                comp: 'screen',
	                alpha: 1
	              });
	
	              _this2.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              var progress = active.progress();
	              var opacity = ease.square(1, 0, progress);
	
	              _this2.canvasUtils.redrawCurrentCanvas();
	
	              _this2.canvasUtils.applyFill({
	                style: gradient,
	                comp: 'screen',
	                alpha: opacity
	              });
	            },
	            onComplete: function onComplete() {
	              _this2.canvasUtils.redrawCurrentCanvas();
	              _this2.imageElement.isDrawing = false;
	              _this2.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return EmotionStep;
	}();
	
	exports.default = EmotionStep;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _pointUtils = __webpack_require__(18);
	
	var _pointUtils2 = _interopRequireDefault(_pointUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var MultiAuraStep = function () {
	  function MultiAuraStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, MultiAuraStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.pointUtils = new _pointUtils2.default(imageElement);
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInMultiAura(duration);
	  }
	
	  _createClass(MultiAuraStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	      this.pointUtils = null;
	    }
	  }, {
	    key: 'fillInFeatheredCircle',
	    value: function fillInFeatheredCircle(pattern, radius, feather) {
	      var reverse = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
	      var centered = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
	
	      var tempCanvas = this.canvasUtils.createHiDPICanvas();
	      tempCanvas.width = this.canvas.width;
	      tempCanvas.height = this.canvas.height;
	      var tempContext = tempCanvas.getContext('2d');
	      animationUtils.setSmoothing(tempContext);
	
	      var x = centered ? this.canvas.width / 2 : this.imageElement.eyesMidpoint.x;
	      var y = centered ? this.canvas.height / 2 : this.imageElement.eyesMidpoint.y;
	
	      var gradient = tempContext.createRadialGradient(x, y, 0, x, y, radius);
	
	      gradient.addColorStop(1 - feather / radius, reverse ? colorUtils.TRANSPARENT : colorUtils.BLACK);
	      gradient.addColorStop(1, reverse ? colorUtils.BLACK : colorUtils.TRANSPARENT);
	
	      tempContext.fillStyle = gradient;
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      tempContext.fillStyle = pattern;
	      tempContext.globalCompositeOperation = 'source-in';
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      var canvasPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	      return canvasPattern;
	    }
	  }, {
	    key: 'animateInMultiAuraFrame',
	    value: function animateInMultiAuraFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var startR = arguments.length <= 1 || arguments[1] === undefined ? this.canvas.width : arguments[1];
	      var fill = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	      var comp = arguments.length <= 3 || arguments[3] === undefined ? animationUtils.BLEND_NORMAL : arguments[3];
	
	      if (!fill) {
	        return;
	      }
	
	      this.imageElement.isDrawing = true;
	
	      var feather = ease.linear(0, startR, progress);
	
	      this.canvasUtils.redrawBaseImage();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, startR, feather);
	      this.context.globalAlpha = ease.expOut(0.4, 1, progress);
	      this.context.globalCompositeOperation = comp;
	
	      this.canvasUtils.cutOutHex();
	
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, ease.expOut(this.imageElement.hexR * 0.75, this.imageElement.hexR * 1.25, progress), ease.exp(this.imageElement.hexR * 0.25, this.imageElement.hexR * 0.75, progress));
	
	      this.context.globalAlpha = ease.exp(0.3, 0.7, progress);
	
	      this.context.globalCompositeOperation = 'screen';
	      this.context.fill();
	
	      this.context.globalCompositeOperation = 'color-burn';
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, ease.expOut(this.canvas.height * 2, this.canvas.height, progress), ease.exp(this.canvas.height, this.canvas.height - this.imageElement.hexR / 2, progress), true, false);
	
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
	
	      this.imageElement.isDrawing = false;
	    }
	  }, {
	    key: 'animateInMultiAura',
	    value: function animateInMultiAura() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var fill = null;
	      var comp = this.imageElement.treatments.groupAuraColors.length > 0 ? 'screen' : 'lighten';
	      var startR = this.pointUtils.toGridCoords(this.imageElement.faceBounds.right - this.imageElement.faceBounds.left) / 2;
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInMultiAuraFrame(1, _this.canvas.width, _this.getMultiAuraFill(), comp);
	        });
	      } else {
	        (function () {
	          var active = null;
	
	          var auraTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(auraTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(auraTimeline);
	            }
	          });
	          auraTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              active = auraTimeline.getActive()[0];
	              fill = _this.getMultiAuraFill();
	              _this.imageElement.fills = [fill];
	              _this.imageElement.isDrawing = false;
	              _this.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              var progress = active.progress();
	              var r = ease.exp(startR, _this.canvas.width, progress);
	
	              _this.animateInMultiAuraFrame(progress, r, _this.imageElement.fills[0], comp);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }, {
	    key: 'getMultiAuraFill',
	    value: function getMultiAuraFill() {
	      var tempCanvas = this.canvasUtils.createHiDPICanvas(this.imageElement.canvasWidth, this.imageElement.canvasHeight);
	      tempCanvas.width = this.imageElement.canvasWidth;
	      tempCanvas.height = this.imageElement.canvasHeight;
	      var tempContext = tempCanvas.getContext('2d');
	      animationUtils.setSmoothing(tempContext);
	
	      var gradientColors = this.imageElement.treatments.groupAuraColors;
	
	      // no one in the group shows any emotion
	      if (gradientColors.length === 0) {
	        tempContext.save();
	        tempContext.fillStyle = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.35);
	        tempContext.globalAlpha = 1;
	        tempContext.globalCompositeOperation = 'source-over';
	
	        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	        var solidPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	        tempContext.restore();
	
	        return solidPattern;
	      } else if (gradientColors.length === 1) {
	        // only one emotion in the entire group
	        var gradient = this.canvasUtils.createSimpleGradient(gradientColors[0], colorUtils.subAlpha(gradientColors[0], 0.2));
	
	        tempContext.save();
	        tempContext.fillStyle = gradient;
	        tempContext.globalAlpha = 1;
	        tempContext.globalCompositeOperation = 'source-over';
	
	        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	        var _gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	        tempContext.restore();
	
	        return _gradientPattern;
	      }
	
	      tempContext.save();
	      // get total number of emotions to display, and then tween between their colors, degree by degree
	      var degBetweenColors = 360 / gradientColors.length;
	      var currOffset = 0;
	      var offsetDeg = 30 - Math.floor(Math.random() * 36) + 135;
	      var startOffset = 360 + offsetDeg;
	      tempContext.globalCompositeOperation = animationUtils.BLEND_NORMAL;
	
	      tempContext.fillStyle = colorUtils.WHITE;
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      tempContext.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
	      tempContext.lineWidth = 1;
	      tempContext.lineCap = 'round';
	
	      gradientColors.forEach(function (color, index, arr) {
	        var nextColor = arr[(index + 1) % arr.length];
	        var colorSplit = colorUtils.splitRGBA(color);
	        var nextColorSplit = colorUtils.splitRGBA(nextColor);
	        var rStep = (nextColorSplit.r - colorSplit.r) / degBetweenColors;
	        var gStep = (nextColorSplit.g - colorSplit.g) / degBetweenColors;
	        var bStep = (nextColorSplit.b - colorSplit.b) / degBetweenColors;
	        currOffset = degBetweenColors * index + startOffset;
	
	        for (var currDeg = 0; currDeg < degBetweenColors; currDeg += single ? 0.01 : 0.02) {
	          var actualCurrDeg = currDeg + currOffset + startOffset;
	          tempContext.save();
	          tempContext.rotate(Math.PI * actualCurrDeg * -1 / 180);
	          tempContext.translate(tempContext.lineWidth / 2 * -1, tempContext.lineWidth / 2);
	
	          var currR = parseInt(colorSplit.r + currDeg * rStep, 10);
	          var currG = parseInt(colorSplit.g + currDeg * gStep, 10);
	          var currB = parseInt(colorSplit.b + currDeg * bStep, 10);
	          var currA = 1;
	          var currStyle = 'rgba(' + currR + ', ' + currG + ', ' + currB + ', ' + currA + ')';
	
	          tempContext.globalAlpha = currA;
	
	          tempContext.fillStyle = currStyle;
	
	          tempContext.fillRect(0, 0, 0.8, Math.max(tempCanvas.width, tempCanvas.height) * 2);
	
	          tempContext.restore();
	        }
	      });
	
	      var gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	      tempContext.restore();
	
	      return gradientPattern;
	    }
	  }]);
	
	  return MultiAuraStep;
	}();
	
	exports.default = MultiAuraStep;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var BackgroundStep = function () {
	  function BackgroundStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, BackgroundStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.vignettePattern;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInBackground(duration);
	  }
	
	  _createClass(BackgroundStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'animateInBackgroundFrame',
	    value: function animateInBackgroundFrame() {
	      var _this = this;
	
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var hexRadius = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
	
	      this.canvasUtils.redrawBaseImage();
	
	      this.canvasUtils.cutOutHex(false);
	
	      this.imageElement.context.save();
	      this.imageElement.context.moveTo(0, 0);
	      this.imageElement.context.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
	
	      var points = geometryUtils.createRoundedHexagon(Math.max(this.imageElement.hexR, hexRadius));
	
	      this.imageElement.context.moveTo(Math.max(this.imageElement.hexR, hexRadius), 0);
	
	      points.reverse();
	
	      points.forEach(function (vertex, i, vertices) {
	        if (i % 2 === 0) {
	          _this.imageElement.context.lineTo(vertex.x, vertex.y);
	        } else {
	          var prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
	          var xMid = (vertex.x + prev.x) / 2;
	          var yMid = (vertex.y + prev.y) / 2;
	          var r = geometryUtils.distanceFromCoords(prev, vertex) / 2;
	
	          var bigIndex = Math.floor(i / 2);
	          if ([0, 4].includes(bigIndex)) {
	            xMid -= r / 2;
	          } else if ([1, 2].includes(bigIndex)) {
	            xMid += r / 2;
	          } else if ([5].includes(bigIndex)) {
	            xMid -= r * Math.sqrt(3) / 2;
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
	
	          var startAngle = (30 + bigIndex * 60 + 360) % 360;
	          var endAngle = (startAngle + 60 + 360) % 360;
	
	          _this.imageElement.context.arc(xMid, yMid, r, startAngle / 360 * (Math.PI * 2), endAngle / 360 * (Math.PI * 2), false);
	        }
	      });
	
	      this.imageElement.context.closePath();
	      this.imageElement.context.restore();
	
	      this.canvasUtils.drawBackgroundWithAlpha(ease.square(0, 0.25, progress));
	    }
	  }, {
	    key: 'animateInBackground',
	    value: function animateInBackground() {
	      var _this2 = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var rEnd = this.imageElement.canvas.width;
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this2.animateInBackgroundFrame(1, rEnd);
	        });
	      } else {
	        (function () {
	          var active = null;
	          var backgroundTimeline = new Timeline({
	            onStart: function onStart() {
	              _this2.imageElement.timelines.push(backgroundTimeline);
	            },
	            onComplete: function onComplete() {
	              _this2.imageElement.killTimeline(backgroundTimeline);
	              _this2.imageElement.context.restore();
	            }
	          });
	
	          var rStart = _this2.imageElement.hexR;
	          var progress = 0;
	          var currR = rStart;
	
	          backgroundTimeline.to(_this2.imageElement.canvas, duration, {
	            onStart: function onStart() {
	              active = backgroundTimeline.getActive()[0];
	              _this2.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              progress = active.progress();
	              currR = ease.exp(rStart, rEnd, progress);
	              _this2.animateInBackgroundFrame(progress, currR);
	            },
	            onComplete: function onComplete() {
	              _this2.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return BackgroundStep;
	}();
	
	exports.default = BackgroundStep;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var VignetteStep = function () {
	  function VignetteStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, VignetteStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.vignettePattern;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInVignette(duration);
	  }
	
	  _createClass(VignetteStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	      this.vignettePattern = null;
	    }
	  }, {
	    key: 'drawVignetteWithAlpha',
	    value: function drawVignetteWithAlpha() {
	      var alpha = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      this.context.save();
	
	      this.context.fillStyle = this.vignettePattern;
	      this.context.globalCompositeOperation = 'overlay';
	      this.context.globalAlpha = alpha;
	      this.context.fill();
	      this.context.restore();
	    }
	  }, {
	    key: 'animateInVignetteFrame',
	    value: function animateInVignetteFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      if (this.imageElement.treatments.treatment.noEmotionScrim) {
	        this.canvasUtils.redrawBaseImage();
	
	        this.canvasUtils.cutOutHex();
	        this.canvasUtils.drawBackgroundWithAlpha(0.35);
	      } else {
	        var opacity = ease.expOut(0, 0.5, progress);
	
	        this.canvasUtils.redrawBaseImage();
	        this.canvasUtils.cutOutHex();
	
	        this.canvasUtils.drawBackgroundWithAlpha(0.25);
	        this.canvasUtils.drawVignetteWithAlpha(opacity);
	
	        this.context.restore();
	      }
	    }
	  }, {
	    key: 'animateInVignette',
	    value: function animateInVignette() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      if (!this.imageElement.treatments.treatment.noEmotionScrim) {
	
	        this.context.save();
	
	        var vignetteGradient = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.vignette.innerColor, this.imageElement.treatments.treatment.vignette.outerColor, 0, false);
	
	        this.canvasUtils.applyFill({
	          style: colorUtils.TRANSPARENT
	        });
	        this.canvasUtils.applyFill({
	          style: vignetteGradient
	        });
	
	        var vignetteLayer = this.canvas;
	        this.vignettePattern = this.context.createPattern(vignetteLayer, 'no-repeat');
	
	        this.context.restore();
	      }
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInVignetteFrame(1);
	        });
	      } else {
	        (function () {
	          var active = null;
	          var progress = 0;
	
	          var vignetteTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(vignetteTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(vignetteTimeline);
	              _this.context.restore();
	            }
	          });
	
	          vignetteTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              active = vignetteTimeline.getActive()[0];
	              _this.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              progress = active.progress();
	              _this.animateInVignetteFrame(progress);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return VignetteStep;
	}();
	
	exports.default = VignetteStep;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var HaloStep = function () {
	  function HaloStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, HaloStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInHalo(duration);
	  }
	
	  _createClass(HaloStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'animateInHaloFrame',
	    value: function animateInHaloFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      if (this.imageElement.treatments.treatment.noEmotionScrim) {
	        this.canvasUtils.redrawBaseImage();
	        this.canvasUtils.cutOutHex();
	        this.canvasUtils.drawBackgroundWithAlpha(0.35);
	      } else {
	        if (this.imageElement.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.imageElement.treatments.treatment.halo.innerColor === colorUtils.TRANSPARENT) {
	          return;
	        }
	        if (this.imageElement.totalEmotions === 1) {
	          this.canvasUtils.redrawBaseImage();
	          this.canvasUtils.cutOutHex();
	          this.context.save();
	          this.canvasUtils.drawBackgroundWithAlpha(0.25);
	          this.canvasUtils.drawVignetteWithAlpha(0.5);
	
	          var alpha = ease.expOut(0, 0.75, progress);
	          var r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);
	
	          var gradient = this.context.createRadialGradient(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, this.imageElement.hexR, this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, r);
	
	          gradient.addColorStop(0, this.imageElement.treatments.treatment.halo.innerColor);
	          if (this.imageElement.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
	            gradient.addColorStop(0.5, this.imageElement.treatments.treatment.halo.outerColor);
	          }
	          gradient.addColorStop(1, colorUtils.TRANSPARENT);
	
	          this.context.fillStyle = gradient;
	          this.context.globalCompositeOperation = 'source-over';
	          this.context.globalAlpha = alpha;
	
	          this.context.fill();
	
	          this.context.restore();
	        } else {
	          var _alpha = ease.expOut(0.2, 0.5, progress);
	          var _r = ease.expOut(0.1, 1.2, progress);
	
	          this.canvasUtils.redrawBaseImage();
	          this.canvasUtils.cutOutHex();
	          this.context.save();
	
	          this.canvasUtils.drawBackgroundWithAlpha(0.25);
	          this.canvasUtils.drawVignetteWithAlpha(0.5);
	
	          this.context.fillStyle = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.halo.outerColor, colorUtils.TRANSPARENT, _r, false);
	          this.context.globalCompositeOperation = 'source-over';
	          this.context.globalAlpha = _alpha;
	
	          this.context.fill();
	
	          var alpha2 = ease.expOut(0, 0.5, progress);
	          var r2 = ease.expOut(0, this.imageElement.hexR * (Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.radius : 3) / this.canvas.height, progress);
	          this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha(this.imageElement.treatments.treatment.halo.innerColor, Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.alpha : 1), colorUtils.TRANSPARENT, r2, false, 0.3, 1);
	          this.context.globalAlpha = alpha2;
	          this.context.fill();
	
	          this.context.restore();
	        }
	      }
	    }
	  }, {
	    key: 'animateInHalo',
	    value: function animateInHalo() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      if (duration === 0) {
	        if (!this.imageElement.treatments.treatment.noEmotionScrim) {
	          this.imageElement.ifNotDrawing(function () {
	            _this.animateInHaloFrame();
	          });
	        }
	      } else {
	        (function () {
	          var active = null;
	          var progress = 0;
	
	          var haloTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(haloTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(haloTimeline);
	              _this.context.restore();
	            }
	          });
	
	          haloTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              _this.context.save();
	              active = haloTimeline.getActive()[0];
	              _this.imageElement.tweens.push(active);
	              _this.context.restore();
	            },
	            onUpdate: function onUpdate() {
	              if (!_this.imageElement.treatments.treatment.noEmotionScrim) {
	                progress = active.progress();
	                _this.animateInHaloFrame(progress, _this.imageElement.treatments.treatment.halo.radius);
	              }
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return HaloStep;
	}();
	
	exports.default = HaloStep;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single, Image */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _assets = __webpack_require__(29);
	
	var assets = _interopRequireWildcard(_assets);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var ChromeStep = function () {
	  function ChromeStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, ChromeStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.logoTop = 40;
	    this.logoLeft = 40;
	    this.logoWidth = 348 * (110 / 348);
	    this.logoHeight = 136 * (110 / 348);
	
	    this.logo = new Image();
	    this.logo.src = assets.logoSrc;
	
	    this.chrome(duration);
	  }
	
	  _createClass(ChromeStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'chrome',
	    value: function chrome() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
	
	      this.imageElement.finalImage = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	      this.drawChrome(duration);
	    }
	  }, {
	    key: 'drawChromeFrame',
	    value: function drawChromeFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var height = arguments.length <= 1 || arguments[1] === undefined ? 112 : arguments[1];
	      var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	      this.context.globalCompositeOperation = 'source-over';
	      this.context.fillStyle = 'rgba(255, 255, 255, ' + progress + ')';
	      this.context.fillRect(0, this.canvas.height - height, this.canvas.width, height);
	
	      if (callback) {
	        callback();
	      }
	    }
	  }, {
	    key: 'drawChrome',
	    value: function drawChrome() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
	
	      var height = 0;
	      if (single) {
	        height = animationUtils.CHROME_SHORT_HEIGHT;
	      } else {
	        height = this.imageElement.totalEmotions <= animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS ? animationUtils.CHROME_SHORT_HEIGHT : animationUtils.CHROME_TALL_HEIGHT;
	      }
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          if (_this.imageElement.totalEmotions > 0) {
	            _this.drawChromeFrame(1, height, function () {
	              var tick = 0;
	              _this.imageElement.facesAndEmotions.forEach(function (person) {
	                for (var emotion in person) {
	                  _this.drawChromeHex(height, emotion, person[emotion], tick, 1);
	                  tick++;
	                }
	              });
	              _this.context.globalCompositeOperation = 'overlay';
	              _this.context.drawImage(_this.logo, _this.logoLeft, _this.logoTop, single ? _this.logoWidth * 1.5 : _this.logoWidth, single ? _this.logoHeight * 1.5 : _this.logoHeight);
	              _this.context.globalCompositeOperation = 'source-over';
	            });
	          } else {
	            _this.context.globalCompositeOperation = 'overlay';
	            _this.context.drawImage(_this.logo, _this.logoLeft, _this.logoTop, single ? _this.logoWidth * 1.5 : _this.logoWidth, single ? _this.logoHeight * 1.5 : _this.logoHeight);
	            _this.context.globalCompositeOperation = 'source-over';
	          }
	        });
	      } else {
	        (function () {
	          var timeline = new Timeline({
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(timeline);
	            }
	          });
	          var currActive = null;
	          var tick = -1;
	          _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	          _this.canvasUtils.redrawCurrentCanvas();
	          if (_this.imageElement.totalEmotions > 0) {
	            timeline.to(_this, animationUtils.EMOTION_HEX_FADE_DURATION / _this.imageElement.timeFactor, {
	              onStart: function onStart() {
	                currActive = timeline.getActive()[0];
	                _this.imageElement.tweens.push(currActive);
	              },
	              onUpdate: function onUpdate() {
	                var progress = currActive.progress();
	                _this.drawChromeFrame(progress, height);
	              },
	              onComplete: function onComplete() {
	                _this.imageElement.killTween(currActive);
	              }
	            });
	
	            _this.imageElement.facesAndEmotions.forEach(function (person) {
	              var _loop = function _loop(emotion) {
	                timeline.to(_this, animationUtils.EMOTION_HEX_FADE_DURATION / _this.imageElement.timeFactor, {
	                  onStart: function onStart() {
	                    currActive = timeline.getActive()[0];
	                    _this.imageElement.tweens.push(currActive);
	                    tick++;
	                    _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	                  },
	                  onUpdate: function onUpdate() {
	                    _this.canvasUtils.redrawCurrentCanvas();
	                    _this.drawChromeHex(height, emotion, person[emotion], tick, currActive.progress());
	                  },
	                  onComplete: function onComplete() {
	                    _this.canvasUtils.redrawCurrentCanvas();
	                    _this.drawChromeHex(height, emotion, person[emotion], tick, 1);
	                    _this.imageElement.killTween(currActive);
	                    _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	                  }
	                });
	              };
	
	              for (var emotion in person) {
	                _loop(emotion);
	              }
	            });
	          }
	          timeline.to(_this, animationUtils.EMOTION_HEX_FADE_DURATION / _this.imageElement.timeFactor, {
	            onStart: function onStart() {
	              currActive = timeline.getActive()[0];
	            },
	            onUpdate: function onUpdate() {
	              _this.canvasUtils.redrawCurrentCanvas();
	              _this.context.globalCompositeOperation = 'overlay';
	              _this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
	              _this.context.drawImage(_this.logo, _this.logoLeft, _this.logoTop, _this.logoWidth, _this.logoHeight);
	              _this.context.globalCompositeOperation = 'source-over';
	            }
	          });
	
	          _this.imageElement.timelines.push(timeline);
	        })();
	      }
	    }
	  }, {
	    key: 'drawChromeHex',
	    value: function drawChromeHex(height, emotion, strength, num, progress) {
	      var _this2 = this;
	
	      var radius = arguments.length <= 5 || arguments[5] === undefined ? animationUtils.CHROME_HEX_RADIUS : arguments[5];
	
	      if (num >= animationUtils.CHROME_MAX_ITEMS) {
	        return;
	      }
	
	      this.canvasUtils.retraceCanvas();
	
	      var x = 0;
	      var y = 0;
	      if (single) {
	        x = animationUtils.CHROME_HORIZONTAL_PADDING + num % animationUtils.CHROME_MAX_ITEMS * animationUtils.BACKEND_CHROME_ITEM_WIDTH;
	        y = this.canvas.height - height + animationUtils.CHROME_VERTICAL_PADDING + Math.floor(num / animationUtils.CHROME_MAX_ITEMS) * animationUtils.CHROME_SINGLE_LINE_HEIGHT + Math.floor(num / animationUtils.CHROME_MAX_ITEMS) * animationUtils.CHROME_SPACE_BETWEEN_LINES;
	      } else {
	        x = animationUtils.CHROME_HORIZONTAL_PADDING + num % (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) * animationUtils.CHROME_ITEM_WIDTH;
	        y = this.canvas.height - height + animationUtils.CHROME_VERTICAL_PADDING + Math.floor(num / animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) * animationUtils.CHROME_SINGLE_LINE_HEIGHT + Math.floor(num / (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS)) * animationUtils.CHROME_SPACE_BETWEEN_LINES;
	      }
	      var hexPoints = geometryUtils.createRoundedHexagon(radius, radius / 5);
	      this.context.beginPath();
	      var hexStartX = x + radius;
	      var hexStartY = y + radius;
	      hexPoints.forEach(function (vertex, i, vertices) {
	        vertex.x += hexStartX;
	        vertex.y += hexStartY;
	
	        if (i === 0) {
	          _this2.context.moveTo(vertex.x, vertex.y);
	          return;
	        }
	        if (i % 2 === 0) {
	          _this2.context.lineTo(vertex.x, vertex.y);
	        } else {
	          var prev = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
	          var xMid = (vertex.x + prev.x) / 2;
	          var yMid = (vertex.y + prev.y) / 2;
	
	          var r = geometryUtils.distanceFromCoords(prev, vertex) / 2;
	
	          var bigIndex = Math.floor(i / 2);
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
	
	          var startAngle = (30 + bigIndex * -1 * 60 + 360) % 360;
	          var endAngle = (startAngle - 60 + 360) % 360;
	
	          _this2.context.arc(xMid, yMid, r, startAngle / 360 * (Math.PI * 2), endAngle / 360 * (Math.PI * 2), true);
	        }
	      });
	      this.context.closePath();
	      this.context.globalAlpha = ease.exp(0, 1, progress);
	      var grad = this.context.createLinearGradient(x, y, x + radius * 2, y + radius * 2);
	      grad.addColorStop(0, colorUtils[emotion][0]);
	      grad.addColorStop(1, colorUtils[emotion][2]);
	      this.context.fillStyle = grad;
	      this.context.fill();
	      this.context.globalAlpha = 1;
	      this.context.font = '12px "Roboto Mono"';
	      this.context.fillStyle = 'rgba(0, 0, 0, ' + ease.exp(0, 0.38, progress) + ')';
	      this.context.fillText(emotion.toLowerCase() + ':' + strength, hexStartX + radius * 1.5, hexStartY + radius / 4);
	    }
	  }]);
	
	  return ChromeStep;
	}();
	
	exports.default = ChromeStep;

/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var logoSrc = exports.logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAABQCAYAAAByKBsiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAIHJJREFUeNrsfVlTW1m25p6OJsBMxpjJSOKAwAJsrIyOcD6p/kOrM33DWdk/Rf+ky5l5rzOLfrgR9QOSp3J0lFW2MTKSkEAMBjNPms/ee/WDAQshgY7OEciZLIdesHSGvde81/oWBgB0S7d0S9dDuF4XDgQC9M2bNx2MsyZECpZGXQANY4kxzjkcjv3Z2dn017JxgUCALoZCzYeEWBRFYbRQYBpjQikUBBbNBUuXJRUKhbR63f9p/1P7UeuRHWcySo5SBSGErNzKhU1onPNUPB7P672m3+9n29vbRM9vurq65O+//y4wxtdqOfx+P1tdXe1gnDVhqilSMkIJFwShPLLbU4FA4CAYDMprETif2916JKmLUkm/Ju0jKd1/9OjR8vT0tGjE5wMAPD4+3i6z2U5ESAsAXLp/HOMcQmjr+fPnu+U2X/e++nzK8fHxPSpEOyBkveJhC6Aouz09PVszMzO8muurqtrPALpreTYhiGBEpJGwprpxdn8mmczVYw+CwSD57f/81i1JrothfJAnJIsQynd1dWnZjQ0rx9haUJQmrGnNgtKNhYWFnWJlYLrAqap6hwEMf60mH6RMRRYXY9etMa+iycnJpuxh9gFl0qFbkUjJWzBOhhYXD2sV9Am3+14eWI9eJco5lsRKVmOx2E49Ba6Msjno5/yjmYLn9XotMpcbKSB02NbW9ukyD8Lv9Ns2rBs9QghHa2tr7PS7xEymCAQClAji+qp9bEKaHzof3m+kZ5qYmGjXMhlPLcKGEEKEEJbGWB0bHOupRaOPq+oQJ6S/Fo+FMSBEiMExl2vwKotsJjGAtjVgY6Ojo51X8ezQ0JBajdIppApDgtL9RCKxepW7PpOcyUWj0SWE0OHh4eFwMBgkplu4oaGhAQWhe197YMs5ltZmazgcDhdu+llGR0c7kaY5y1hiTSFkP4fxYT/vLyAn4ifxjwWlUTPHmXuYEKX0dxaEVmcTia1qhe3lixfDmJDmC4oJ4Egwtt/S0pJBCGkIIWSxWNju7m4T4bwDYdxSxmX/FIvFPlZr4TjHktro5uV7xSnjjBHGmyq5udRmWwqHw3uVBGnENfJoIbnw9qp9gHz+rl7vBwCwx+NxKQUlE06GP5kmcH6n37bJ1h5epxarq2vJ2N6JhroxUlXVijT0kDE454loCG398MMPHy+Ly06SVj2lLhrGGLp5/4eZ5MyVrpbX7X4gMO4qCfrzxGZLhsPh1GW/HRkZuQsFuGAVmwDilVzbUoGTkvLYUuydjhjTkdnf7wOM75S+c1tX1/yrV6+yZZ/VNfLoP378j/eXreeY2z1slXL7bTJ5UMs+KgDD84nEnGku5SZZGfijCBtCCGHOO7xeb/NNJkioEM5SYeMYryQSidWrkiDT09MiHo+vcYxXSq+7SVYGqkl8lQobxzjbPTAQuUrYEEIoFovt3Om8Eyv9+yEh/fXik1AolJlfXFzgGG+WvvPR1lZfRZcb8+zLly+bLo2DAextTmeqlueKx+N5AMCBQICaInA+t7u1VKv8EaiQKtyYEhkeHm4pdeUowHY8Ht/WudnbHONzWhkwvuN3Om2X/e6QkL7SLGBra+tCtRnHUwEoZX4GYJtyTbXWc+0WFhY+cozPWTOBUKuqquVdTmk/AoBL+VdISvW8+wXXlxDx4cMH4wIHADiD8QD6AxJl0uHxeDpv6PZdpQzf9eDBeo3XWiv9w4bV2nGJC3SHAdjPx19yvZZzvampqQ0hyLljlowl01FX7wRjoJSulv7dAVBW0PMsv481rfM0sVGOFAaaz+dTauYlIVggEOCGBW7C7b535ZnM10wa6gsEAtd6nujz+RQG0FbC8Lu1ath4PJ4v1fioUGipVtilpFyvZS12bYHB8bnr5WVrvT2HSCSS4iXJDU1Ke6X1wWA9mv7b9L1LLEv+8PDQXmssTgiRwWBQEqOMkQfWg/7ARIhgb968udZ3LGwXLsSONptt39h7kC2O8cHpB0lLoZLHgvn5DKOC+b6Rc0kHnBc4xoAMDw/Xtfro5HnPJYYKZbK2Zxaoia5znLlXKW7XCDmwStlWq7einbj1hgQuvZvu+9qqSWohBaF7V8U8ZlLWkj0XwHOO5dzcnKGys1gsthOPxxOnn+hy+QzsN998Yy/dU0XKIyP37hDiCAllt/jT1dVF6r2OhJNziSXLJVY1HA4XrC0tCZ7JuD0eT0sZ13hPA9bu9Xp1KQqv19uMOb7b2tq6aUjgfD6fA1GtE/0JCADwNqX913U/Js8fcBNMstdV+XJ4eHghW6c1NWWMXHMmmcxFkuf/VUrRm7pvCM4pSSmUS13y2dnZtLWlJUE4HxwbHOspjummp6eFtdm6IrJZ52WxXjH5nU6byGZdlibLiuFKk9ReagD9iUgg1Opzu1uv414Y43NalCCSu673pCeFyMXWtREKAGoJdy54XzZ0ZUH17OxsuntgIIJIzvLrTz95vU7v/VPv5v379/tYWI9/++mnIb/fzypdIxAI0JGRkb6PSBmVjG0UH7qzWl7G6/V2iFyuGf3JKPv5DOmo3tZGSEpJUWKPM86v6x2ZpjGBv3hejEr+Ne5VZm+vF5Hz9oQxVpVrfJKcWvb5fEoqler6mFNcD1WVcEKyBVHQLIDQ2tLahNft3tUYy3xOLEmsaAoTVmF/9/pdC7bgo17UG5mJnS8w0G3hgsEg4ZlMP/oTkgSwTbjddS9dK9XMlFJ5Xe/IFeXcvTkh8mvbJ1VV7wAhd8+5l1JqeuPgUCikRaPR9YXlhXnv1FRESrlDKc1SgCNiJVsYY7AIYbcIYUcIWQkm4Cg49h5982guGo0ulavm0W3hXr58eR9fku3RERgdzycSC1+j4GFcv4w2AOAxVT13A5Zn18b0QghSzBRYw1+NwAWDQfJ/X7zoyiF0oaoEW60fjXgmJy1bVVnIt8m3lT0InZrDKnLiPmPGF6e9u3u10VpgvmY6ad7UVe1TqaC3YTwKKcnIyMjdy75jE4LkGWNCCPt//u0/WygllJWgGHCMDxbm5/fqqSirdtl1fZmzHsQ0bMJNt64jS/Vnoo2NDTvmXFdrFADsN7LSYwwIEmLwsu8UEEKY88+MTC++CkXo8Pvnz5ca5T11xXC0iR4ZvaGUlN8dGNi4FZGK7iqUMge3cnJtDEHIuXuD8nUWpEtJuaR0OZxIxM3odr8RCxcOh/dGnCP3CBVNNS8EletGikD/DCSEEIR8CaUUzq+tuIBqmoCi7B6TX1FhA0BBMpZWFOVgfm6uIa237mispbNlJX1wMFbLzTjG2ROMhxt96adPn9r3NzcNnyNSjGXghx8WzdagklJOAM72RuNXR82Tk5OZ2dnZWKX/Vzhv41U0BwtF4UR8OZIQktKbUzxEWJos8UtjOJtNHh4eiqmpKV6MRaOHx0ZHRztpjip1fReb0CKRyK5ugQuFQpkxl2unNO1aFYNS2hCJklevXmVH3W5UritZ1yKiz1lbhNC6mc/HpNQQxrYvQiCuLJo9YbbjigI5NFRV4a1F0zgvsnCUSur3+9lNeCUYY6im9w4hhOLxuJHkjA0wNDNgh/V+p5ryjY6OjvWj3aN2PXWUktL9WDR63Cimvb27e3V/a+uhYc2VE/e9Xu+OmdUYoCgpzPmZMmAA9kAgQK8DTUyzWDK45Jx9Y2PDfpkwX0WBQIAu/Otf55Qb7exM1xPGTw/1Fgq7W4y1hePRTzeaNHna/9TudXrvl7FymhXzqhMfnGNQFGWtkXzpV69eZRlCW0avwxhgTdPMLgS4wNyRSORaGnyfPXuWLvVCrmrOvIo+fPjQmqN0qPhjsVhYo/DCTDKZ45yI6+jwv1TgDiyb/XnI95SrkH6/uLhFPuMeXu1K2uinRqzHuzswsCElNewqESHay1WYG2F6zs8fOPN0+u51rEkwGJRS0HSJi9tmyAtIiwsYI//85z9zjcQLksldmZGdNyZwj53ONsD4DmNAOOd95fzrAkKr1WSOnj179gk1IM3MzHBJpSnxlxDCNDiGYDAobQzO4TgCxncmJyebrmNdsBWfu7cEsBkq3CYlza5SHjdaBnFqampPINFWbSeAqQIXDAZJvqgdpRKgTjwePyrFy7hg3ez2j2Zl8QAA+/1+Zma38MLCws6FbuhaXEsA+/DwsGlWCGy2C/BwmUzmWrAdv//++/1Sy39ISF8t9x4dHe1EJd0PYLE0XIXL9PS0QAo6/vXXX9uvXeCm/zZ9ATbhEkCdtUraCqRMGSkfCgQCdHR0tFNV1SGPyzU5pqpPPq2uPhpT1Scel2tSVdWhkZGRu0YgECrhX9TmWpJes+AYwuFwgQJslxFqdy2ML4Stas0dDAalBWmfSu/90O1+oOeePp9PETkxUMIT2vfff7+PGpBaON9FhULntQrcZ9iE/AVIgUqAOvF4PC8IKQvW2dzRURMjAwAed7m6371+N440zckA2koLpjEhCgNoI0IMvv3X2wmv03u/VncgGo0eS0oNMwEhgs3/+9+9Zm1O4K9/XSu1vgyg7eHQkFpt5zEA4NHR0c5ye3oZvV9c3CqN5YCQu2Mu12A16+zz+ZTUXspdmsnGVuvHRqr8KKbXicQRJ0TUE8PmgqYcdY46K3VyS0n5o28ezZWmpwOBAJ19/dpbLBRYyp35paVlvQ/k8/mU493joVqqWQQnGUuzJVFLgsbr9Vryqfw4Y8ZcNj1Aq9XQ0/6n9h224yllXM6xBAY7TU1Ne+/evcsUexkAgL/99lvb0cZRawEK7eUg0oGxjWg0emn8qqqqlQgySohgJUyTVxDaUtra9otT+wCAv/nmG/vx8XE7FKCr9JklpfvRaLRiXaNRINivgc4x1+TkZFMhnR697AcaQluJRGK1DMN2iFzO9dl9IaLP2Ten97BUVVUrFcJjpP1HSsl7AaK1DHHweDy9mHPDgEEY4Gh+cdG01iO/02n7RMhwaSxU6qoRQqSUkhBKL41zGUJbc2X2sPy9/bYNvDxSaU84x1JhoF11Xwxw9N1f/5q4zLr9qQQOALDH5fFcZVku0+Ael8eDCW/Wg19fbCXfvHnjKcVDrPGl8t0DAxG9Ah8MBsmvP/3kvYyxq6XLIL1roZNRUQNEiHYjykhxOFb1xtVer9cis9nBWsF+gbGNSCSycVVmslEE7mQsWBPn/I4Qwm5ByCaEoBJYWVeaYC4ppQID5DVKs1LK44WFhbKZWHwum1RmaIQeDe7z+RyHh4fOhYWFeb1p3zGXa7CWcrGKi8bZXiVkqsvoZFKN2wyh/xCPh81Of09OTjaJdLpHYnyn2uSJ4CQDCuxMTU3tGalWeex83JaGdE81U3wwxgCc7d1HuU/Vehs3LXAngzc6Cec9AFBg4DhUkJKTd6QmhNDm5ua0MkUBeHx8XKGUKuToSOEYWznGrQBgUxDa/J8//rhdbNVxpRjsKrIJkSg32MDn8yl6S3b8Tr/tE131mr2ATW1t86FQSDfilMfl8pSbGKOXmJRrc0tLm/VgjkAgQCP/L3Ina8k2Mc4YJgVFAhBGiOCMCYRQnjGWQwilzC468Hq9FprLtQkAW54QhQrBGCFCCIVLi9SklMfPnz9P6U2OPH361J7dyJ5lxyk5AjO9hKvW830oNEQxlnfy9z6+WjPWr+l3Om1rjPURTpSWzpbEqUxghBAaGRnpI0LomomGEcp/98MPH8zIOJlt3YxaOZ/P56i1I6I0vmm92zrXKDWDt1TZso0NDQ1LxtKXjdOqibcHx3o44m2xZCyCMQaiqqpVSql76iQgZL0UGlrHywqE2uqxkBLXBqkdCoUypWdgNVk4BiSzt9d7y9KNTR6PpxMjBGYLG0IIzS/Pb4AChVPwKYIQ6mI1Vi/kId9jZMABQgh9++23tuJmSzOJUkkfPXpU09TQrgcP1kuHUNT4EJ1G1+iW6kwFdJfY7XVDIWhtbd3IUXoXIYSIUjI0Qq8GT++m+wy96+ZmXTHmAaCm68/MzHC7CXWWAIDT6fSdW65uXHdSgrRX23dXC4VCoQzmWAkGg4RpGFtKUY70aXCtc3Jycnt2drYm7PtjxpTiDmOzCWcyNVuXd/H4tsft6Sk9+NX9DFl9xwwej6eFMaYghJCSTstapm56vd6zkVBd6XSmOFMYDAbJ9PS0ITc+n8+n4/F4HqHP8wFzdvvZIXdXV9eRniMZv9Np225qKvZECuFwOFULElkVyZGD4rzDX/7yF3odYLfAQJuenmaMCsGRQZzJ3FFuAACitaTArVar0DKZur1oQVFqlubh4eEWRsCwu6spmq4NZZx3C85bEUJIUIomJiYW379/r6v07LQIASGEdjBeQ0WTZP7xj3/Q4v+vhQilywh9hg4/JMTCcrmzOsuNpY09hFBVySoAwMPDw26Wy52dv1KbLYoQQsfHxxajz1nGc3mHEDoTuN9//12MuEbqDiNBBGEPHz4UBBTFsCklVDSNjY3VNGRPSlnXDB7nvKbrAwC2IGTK/ISuri5Da5xP5R9chmV/07SwsLADkp29I2a8Q1XVqizTQ+fD+8XFDgyhrXq6dxe8D4xBYaDVczqSqqpWgrmcnp4WRFGULTMuCvl8TYMLu7q6cvXsjWptba3pPGXC7b4nAYxvAsCxUQxOQgTb2Nio2/AUSek+FbaPej6dnZ3pYqbtgZ7l4n1UAB5cVeTsdzptmqL1FK1VYezJk+K4WbvqOaBIYXOMs1d93+/3XzjGAk3Z2yakbhD2Vim7QVF2EfpyDuc2UjJU9MKb8XhcN5TCqNs9YhTQpywjCZqOJWMRvb/z+/3sY/LjuBmz72o5fPcODakCoQsNnzbRknibfFtVPDc6NOQ7sxolB/A+n09JHxxMnn1ZUZKRSGTX6LuODY71ACv0VssPpfteSznc8ODw2Gnli6R0PxaLLdYQ19G5f/97zCpa1qpd36oV98REO89k+safPJmfnp4W5MSt+8i5cSujIHSv0uDyS8li2a2L5mayputuLi+bMmgSS7lTS6VLJcriw4Z2LT8kP3wqbidiAN0+n6/sscxJY+qZsAFne9dVVVJK09PTolsMxPP0uL90LlytFAwGicfj6dXS6f62/L3EaUkdQehzTxu1UcMwCACAAUC36zM/P79nRtf1OWZHKL+wsLCj93c+n89hRtWLEEQ4OjoMHysUY5tgQpRPyU8NO7kIYwwOh+NcS9bRztGFLnW/38+KG1OlpLzH1bN6k88+k5zJOdraoojkLC9fvBhXVbXf4/G0+Hw+pZriCQDAPp9P8Xg8Laqq9r988WKcFIjS1N4eKS4TO9OWz549+/TyxYu7RifjKAi1qqp6Jx6PH+nZKK/XuyLz+RGzIAQ0jFdqiQ1Te6kBbAKqhRXzDTNKuggmWeA4jxn/nJSiWqfP7d6/KWtwFc3OzqZVVd08LUKmTDpOqizOXNqNpY0Byr54EIpDWW0ENO6T/Vr2er0WJZNpF1LeT+3t2cdUVfG4XJqUrGzxMiFcGVNVRUrJKcYZBeAIHI5IOBwulOZqSZEJlMzhMAXKzoKQbkCdcDicEoSsmHT/VT0CfxY7eb0dmPBm40KCc+8XF7fMYoQeV8+qlF/OilIAg/XsSjZKz58/X8foy7TRnKS9p6GGqqp3zpQH+jxso9Gm+ITD4cLc0tLm/OLiQnRpaXbiyZO3zOGI9GFtqZN3Lhd/+nDfEnM4IhNPnryNLS29m19cXJhbWtqsVDDOSm5keHYAQucGF+qqlI/FYjuqqmKlBoEtThDMLi3pZvZgMEhevnjRj4lx82aXcs3MzOvMzAyfeDCxopHPbUOYEGXu9et+hNByIwpcMBiUHo9nGXM+gtDniiQs4UEwGEz89vPPD6DIXabN1hXU4HQSf52c5yYrCWl1yrj0Dy2dLaYsQB5YTXWW8Xh8W1K6UC3mZXHMxjFeqLUdxqxBkxShw3q4e+9X3u8X464AIXerPeu6CYpGo8dYWs5iaMD4zn/97b9GisGpHAw+fo3zw2vJbZwmYlgZPzYz5hrbAVIwlDigVNKTSvnlWjYLAD54PJ5OyEPXZQ2Pp82VJ0NCarIqqqpahRD3jab/MMbQxXndEKZ7e3tX1pfXW05LzZiUg4FA4INRCHQAsFbKJl5QyLu7stqG0vFvxtdmX79uPVVkxZ6TFDT9bim63QhDEutNf3G5rB9BcSGE5svymKPDsX64o3UwBob8KyDkrs/n264lNX4iPDsIoR2fz6cUtgvNWMkoecaYlXMOmkOTLTIdOdGQBjeun5mQrNEQ2qoFS0WPa+n1eldFTrhOFsnyIRTqQwgZ8kow5z3pg4OqsFwyhBwhhKrCa5menhaPnY9Xcuh4qHRve1FvshHHSfn9fra+vt5GNa1Jo5TZAApcUTJNTU1HZiTBWKVszbjLtc4RMZyCTu2lBhBCUROyR3XBMvR4PC2Y8zaj15GS8qlvHm0YmeJSZUC/p6pqOzvp8hAYd3k8nv1oAw1KKaa3ybcHqqpmi8u3pEb3Z5Znco32rBMTE+0by8sD2GI5JuDINnPlMGfLUU3THKm9vT6v232A7HZDsP0VLdj7xcWt4kxTzdqT8ObiyvVG862FEOaUTCno43VMt0EIodbW1pXiXj3C+aCRw1qQMoWl3KnmQwF0ZX8fO51tpcBQQhHt9axdrIW8Tu/93FHufnNHRzwajS6Fk+FPb5NvDyKRyG4ikVh99uOPc3lCsiKb9Vw1d1y3hTs1+z63ezWNsWr0ZXgm0x8MBg8aDQBUVdUuBSHDKGGCk0wsHt29rngkFAppo6Ojq0iTToQ+d9///PPPfaiaWQ/l9tpq3Zk3obSrlE6wch6UrgoDwBvYOggAsUZwK71er0XLZLrvdHZ8qOQ2nvDuts/nOzg+Ph5QVbV1amoqqVfJXqoVQ4uLh1inRitv5YhyMriwoXx1Iogp8AeWZsu1D5qMRCK7FKHDLwYW3buOcUt6aO716/7izG9xNREmvFlV1a5GeE6ZyfRYEPpUTYwWCoW0WCy26AA4fvPmjUevpb7SDemWD0xhJiHE/ZrqLOtE2ysrvWbUSwJne9fZTnKObLZzriXk84P1nv6iJzYuLpEDKVNTU1PR4up+zHFftZDt9SQumeMuDOo6yplNJLYopaublKp6jmeu3JyZ5EyuYAagzucsYEPUAT59+tQuMDasXTnHkjWzjzf1HuFwuIAt+OwYQgLYfvnllxsHLQoGg4RwPlhk2aAHYHl6elrYAc4yqowBkdns4I0zBEbW35d+152viEajxxrGCwih/mqtdVXa8MmTJ+tmDC5kAG1mDi6slfY3N01JlCgO5cYHTcZisZ1it58BdF/XHLlK9Msvv/QWH3BbuXX99LjkbTJ5cO4AH+M7o6OjnTf1rIFAgBLMZa1eXDwez/f398eYlO3jQ0NXVkhVJXAns7NM0eRmDi6shSYeTLSb0nsHUPjuu+82UQMQsduXi7sKMpmM86aeZXJysqkYPZljnJ1bmju3Ti0tLavFrrDIiYGbQjb7+9//LiUwYoQnZ2Zm+HwiscCFQsdVdeiyOteq/f1oNLpr1uDCmwqWg8Eg0VjaFLdWaWpaa5SsazgcLiAFrRWt8Y2k3AEAlwq7w+FYLrUeoVBIK3aFKZX0+Ph44CaeGWMMGOHc+Ph4k9HrRJKRpOSW9Js3bzyVYlOi54JWqzmFpkSQ3ptopPztt9+6zRjUAVKm9IL61Jvi8fg2ArjRw+/R0dGeYmHnGG9WQnOLxWI7IGXqC0+I9sfOx2034iHYyLbIZnvN8Lzml+c3rFbrJ5HNesq59rqYPhwOp0ZGRvaNwjFQKun2ykovMliSpIdO5r/dZyaIeXNHxypaWkKNRpyQZaShh3pL8gDAqjfuE0JoxfHr06dP7Qfb2/eLhtQVnv/ww3owGKx4jR6A5TWMH56W1WXx4YNAIHB8XQUEpxSJRHaHhobaa+lwqSAne16vt1BIpdwTDybWEDrO1iRwCCGkKMpaPi9bjdZZCoy7PC6X3cyFwxgDtduT5RIZmqb1G31mhBCiANtmwiaYbOXyQ0NDH5FOtDHMeU9B51w8htAWOjloBwA84hxx0qJhlpyQ5atc7plkMjc2OLZxioNyk21HAwMDya21NY/X7bY+9PkMVw2Fw+GUqqoxYsmqmwKnEOh0KYvjBWqjpiQLMCHNZn5AKFo5YfN6vc1mgCQJQUTXgwfrqIEpHo9vF7tq15KIcrvvnevoEMputQ3ApTgoQMjdm8hkz8zM8P/1/Pk8VxT+PhR6OOZyDU4ODd0zcnYcj8fz9/r7o4CxVXcMV0zPnj37hAAaqo+Jcyyb7zavlQvkC6mCKQG5ncr164ACyGN8SAG2KcC2BWu6YkWMMQhKk6e/pwDbmsVyziK73W5Z/P+1fLDDkTpd3xylSvH/3XfeX9PzvK2treeeVykUqp4HYcGW/dPfIYQMVUUFg0EZjUbXqd0eVQjJalLam3mz3aggzycSC4//x+MYQmVmfOuIiTrMRsU15OoJ28dwMnwBCElV1S4G8MBwYI1xLryw8KERW0pu6euhmmOacDi8d92uS0UtiVA+8L8DF2AVAoEANatesoDQ6q2w3ZJhw2Dkx86hoayWy914AapNiOVf//u/L5wRkny+HzAYjgc0hA4TicTGLbvc0o1ZOIROxvBIuXOTL4ABjspNl/E7/TaOkGH4aowxYIxXb1nllswgw6dSjo6O9aPdo3YzKu9rEYZuMbA6jy6iW2+SlQEDIWqxdds6HctkBgHceqW3Fs6YldOsmN+Iu/UZQ+Riq/5jp7MNMDaMaCWl5FNTU7eu5C01jsAh9BmOQS+snXFhoGWFIRgMkjylptRLEqt17bqrHm7pj02mVe373O5WM+AYqhY4SpdjsdiF+NHr9N4XNNdn9PqCk0wsGYuYnZm8dSlvLZwpFFpcPCxu+a8nCU4y0Wj0AgaHz+dT8pDvMeMeNwGbcEu3AqeLuoRYuw4mrSQM6d10nxn1kjcKm3BLtwJXLc0kkznCrXWtNawkDJOTk02IaoY7h0FK7aZHJ93SrcBVTeFk+BPHuC6d0JfVS+aOcsbrJQEKzR0d8UYYnXRLtwJXNcXj8TVqs0UlpfvFKE1GyYqtZWeujY2NddQ68YdzLE9nQ0/4fB8atfXmlv4Y9P8HAJ7/lDO4kcseAAAAAElFTkSuQmCC';
	
	//export const googleLogoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA1CAYAAAAd84i6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkIzODMwODc1RTdGMTFFNkI3MzFCMzIxN0YyOURBRTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkIzODMwODg1RTdGMTFFNkI3MzFCMzIxN0YyOURBRTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQjM4MzA4NTVFN0YxMUU2QjczMUIzMjE3RjI5REFFMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQjM4MzA4NjVFN0YxMUU2QjczMUIzMjE3RjI5REFFMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Poy7rtYAAASnSURBVHja5Fv5TxNBFJ6WAsUKSAVEAUFLwQgKUUL8BU3809V4RMFgPEpPEBEtAtrKIQL1DXmbTIfOznu73dLEL/lQst2d/eZ4ZwkJ72gBJoH9wDCwIoJFCFgCZoBlLw+oVCqnD/GKIeBdFN5IrAGXvEywH8F9wAfi/JAFfmqk4IfA7nMULFf3OXC7EYKvA6fF+aMIfBW04HZc3ahoDrwBbgQp+DYwIZoHv4DPgCdBCO7C1Q2J5kIKXVXdBc8Cr4rmw1/gE+BePQVfA94XzYt14GK9BIdwK3cRBz9SZrsR29+J8hYwEvMtWIaPtxgv8BGYwxdpFMLKZPsS3Ap8DGwjDvwTrWalGfc9dYWnMdig4CVwM6AtW2mUYBlkPCKs8jfg6wAWpgc4hdbYJlq+4xdgwa+VvgmcdLkuHf9Tm9HwAU7sfoJuqlxLsMmwjAAHld8LeD5NyAUoVuID8wgkbdZNN1STGEaGlOwkZXjGHgoOElvAFcbn5WINUAXfwKQ+iv93sInnVEcGzxfFn8dx9yTw3x6Gr5Y58CFD9LjpJfR4eV6ZiEM8D/uG69QUbRC3WWeNa7vAZYyWbEjgzuMchbzbGU5qq96mnYcSzrSDNGFQWQa6ZxArEcPrM4Rn5S22pNYERU1buhdj5loG7JI26DFu7x3LgFN4PwXDhMJCBXcDFVHdgKmCJ1xunNCyk0XCwH2aDaBWU2wZWdFgS0wYVV2aFBzBF4u73NSPK6AGGSXCQF5AuS9NTfoVAxZxBI9gYEFJIiKMrdTrI7KKESodHFc44BytMFrQC4SbYozyzkXG5OiQLrGD8DnpDn8zffOpYE7OmnCxtjb/7iXdc8Ox4i4pCDkP3mGchxaTQ9ewzzxjtco2lCpMH+OZO47gAmYYVFAG2mXOvooynlE3RCxepdb7FBzBZbR6vsM2LWP57FHwd8LuSKCdoCLtZE9hZQtmGA+IEyz7Cs4sd3WzBIPIqY1vqzs4rL0gpw0pB213uS7rS2+Bf4jPO8aAxnZ+k4LXsVx2Sx5klDPLeFiekKt2YKwctxiUJcKEXwHOMd5vFfjOVvHgFNypXbwQRmtDuCVbcEWlwK+MUJFT+ThToDcJ5rZUfgBfiOAhQ847jM+facGYSjwlNYckoFcE34JpdyvbGDTkOBFNVhB6NVo2FeRXH8YFr0WbMrk2k+BDgntQ0UlMQLygi5l5baIvZ8esq4QEX8UYIcvxAk5E5VZsJAXpacZgEeY5o2Y4A4zP28rJVsFFZog4jO6nHqAmKg4OKNEixfXE0E1R81sZTq4x82FZLNzACVYjKk7X8r0wtFhsfthkJSdEcNBbNTI4mWdM2hYGQMImmJqo55jVBS5SorpGlmTuELKtoQo+tlk/H9CDhMsYglKxjtFeXQULPGNbAQhOM3Nt/Shw4gV27Skl6tvdXxfVXywbFbxqZ0Ywu5ZcwduC18WzrU5Gs9RjzLJNnjuol+pilpHU2wxhWYvUOpire9QIwQfCfz9Y7yl3M2PxIvp6Nvx8j2pGVLdfOFgU1e1RTmJ/gD77gDuo32/Ee/kTgFY0Mgvo6pwgY05xf26L4/9PAOSP/wn/BBgAVAlJOIkdr28AAAAASUVORK5CYII=';
	var googleLogoSrc = exports.googleLogoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA1CAYAAAAd84i6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDQzQTM5RjE1RUU1MTFFNkI3MzFCMzIxN0YyOURBRTIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDQzQTM5RjA1RUU1MTFFNkI3MzFCMzIxN0YyOURBRTIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQjM4MzA4NzVFN0YxMUU2QjczMUIzMjE3RjI5REFFMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQjM4MzA4ODVFN0YxMUU2QjczMUIzMjE3RjI5REFFMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PilCyBoAAAQrSURBVHja5FtNSBVRFH5jmgpJGUaWQqhEkVqb0MqihduSFCIC3YUVGLjSjQtpIe4qRXARYQuNWuQ2Cl+0iMxF2i+IPw9CIrJUyKgwnb5rV7kN82bOmTszb8QLn/N07vn53r1z55xzr4ZpmrFN1bwShlw60A7MmOG1GWkz3TNXDcL9Zupaf6iEIVNjpr7VeCFsrP4wDI5QJi7vgZIUP41TQCl8/80hnObBUHMEyMakD81cIdYIo28+LhPAtoisuYvAfvj/OagR7owQ2Zj0pTOQEUa/ClyGhUzU3qzAMXAY8W3RQh/R4QVQGdFw4iVwHDxMv6Z0fYTJxqRv9b5MadwXz8k4sJdofBa4CCyHTHoOPN5oBx6438EMCC5FOYymTOlFhs5R4E6UcwfKlM7C5QNQRNB3Erqe+zwqIrK7wng7zMOHu1qxNPqcI0zlgQCn4gDzsapmEZap3xnL3x47GPgBFARIuEDaoLa3dimkE+EmYB7IU/52CPiTxEBbCAtOG3OUm0iE8ftOYE4K9Vru3bRRnJDPOdXxLcAeYYdJOEvaorY5q41khHsUoWXgiHJvB/DForiW4GwaUA/EgSVFdkE+n0eJpGuZo9zjSBify22m7TOLUKNyb4jgZCEwQnCuG8gg6BtiEBZcyp0Ix5MIXrCM1iuprMwtnQQ+Mhy8L+N2J51lDmuJXYvbEsa1zkFIOJ2tCJ4Augij8cRD6aaJoLebqbPuP8LEBaHdYjTDxalqj7Wqr+qXm0R3LvCNoTMhOa4TbiEI/QT2MVbV20EW6NDnKlNni0p4mij0gEF4TIPwdeLr7TVD57SaPBQReZyH0Gli310acUaeaxJgGCL97GboXOW4RjjBEOwS3y4liNcgvEAZYVyuMXQmVMK9DMHDQCOh35gG4VFCn0bpC7X1rr+bPIRtYoXMDWh34juQE+gqTXgP20ZGboU/YoTFTkS038OESCtZ2OYWaZUwRyJOeL/7E2k5xNJOjRJLlwJTBF0PZcEwvFjaJluiNEq2lA20AuMWWZGNPaXuBPqeLdnkw+QFgRGQ7BbpoCwo5KQ8H1YqHr4uNJGteCg1rXcM5Ru7puUx29m4VUulwyDTUFUAZKuYPgx63mrBvWLgF8OYqISk+Uh2rbpCbcLX4g27tyR0MW13aO8Ph7h7uKRu08Du9ti/4xXUNPMTcAA6FrVGWHZsCOEY0i2LzRtM+QbK7iGVsJgJwwGSnVWzL3w+aKlfu7Vht2oni7DsXAGsBET4ssXWI4bsijx/EvOVsBToC4DsqLqy4/NZpnwfZ0OcSzhfJuh+tlOK/q3ABLNYkB8YYSnU6iPZe5q6W7lHHrwQzgQmfSArYuNCjdkzKU8HBEtYs16VNMPysD54Ok2bqvPS/+XQ+FwZ6fPSSgrp9UR8rcd3vPaJeMPcZP/z8FeAAQBbE7Co3hTfdgAAAABJRU5ErkJggg==';

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single, document, states, requestAnimationFrame, window, setTimeout */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _panelComponent = __webpack_require__(5);
	
	var _panelComponent2 = _interopRequireDefault(_panelComponent);
	
	var _flashStep = __webpack_require__(16);
	
	var _flashStep2 = _interopRequireDefault(_flashStep);
	
	var _zoomStep = __webpack_require__(20);
	
	var _zoomStep2 = _interopRequireDefault(_zoomStep);
	
	var _faceStep = __webpack_require__(22);
	
	var _faceStep2 = _interopRequireDefault(_faceStep);
	
	var _emotionStep = __webpack_require__(23);
	
	var _emotionStep2 = _interopRequireDefault(_emotionStep);
	
	var _backgroundStep = __webpack_require__(31);
	
	var _backgroundStep2 = _interopRequireDefault(_backgroundStep);
	
	var _haloStep = __webpack_require__(32);
	
	var _haloStep2 = _interopRequireDefault(_haloStep);
	
	var _chromeStep = __webpack_require__(33);
	
	var _chromeStep2 = _interopRequireDefault(_chromeStep);
	
	var _groupCircleStep = __webpack_require__(35);
	
	var _groupCircleStep2 = _interopRequireDefault(_groupCircleStep);
	
	var _multiAuraStep = __webpack_require__(36);
	
	var _multiAuraStep2 = _interopRequireDefault(_multiAuraStep);
	
	var _particles = __webpack_require__(34);
	
	var _particles2 = _interopRequireDefault(_particles);
	
	var _faceUtils = __webpack_require__(6);
	
	var faceUtils = _interopRequireWildcard(_faceUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _geometryUtils = __webpack_require__(8);
	
	var geometryUtils = _interopRequireWildcard(_geometryUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _imageConst = __webpack_require__(11);
	
	var imageConst = _interopRequireWildcard(_imageConst);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Timeline = __webpack_require__(14);
	
	var ImageElement = function (_PanelComponent) {
	  _inherits(ImageElement, _PanelComponent);
	
	  function ImageElement() {
	    var imgPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	    var jsonPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	    var readyCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	    _classCallCheck(this, ImageElement);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageElement).call(this));
	
	    _this.canvasWidth = single ? imageConst.BACKEND_CANVAS_WIDTH : imageConst.CANVAS_WIDTH;
	    _this.canvasHeight = single ? imageConst.BACKEND_CANVAS_HEIGHT : imageConst.CANVAS_HEIGHT;
	
	    _this.canvas = null;
	    _this.context = null;
	
	    _this.width = 0;
	    _this.height = 0;
	
	    _this.currentFrame = 0;
	
	    _this.imageElement = null;
	
	    _this.scrimAlpha = 0;
	
	    _this.backgroundFill = 'blue';
	
	    _this.eyeMidpoints = [];
	    _this.eyesMidpoint = new geometryUtils.Point();
	    _this.allEyesCenter = new geometryUtils.Point();
	
	    _this.canvasSnapshot = null;
	
	    _this.offsetX = 0;
	    _this.offsetY = 0;
	
	    _this.image = null;
	
	    _this.resizedImageOffset = null;
	    _this.subRect = {};
	
	    _this.imageScale = 1;
	
	    _this.faceBounds = null;
	
	    _this.facesAndEmotions = [];
	    _this.curFace = [];
	    _this.hexR = 1;
	
	    _this.tweens = [];
	    _this.timelines = [];
	
	    _this.treatments = {};
	
	    _this.resizedImageScale = 0;
	
	    _this.isDrawing = false;
	    _this.auraAnimations = null;
	    _this.readyCallback = readyCallback;
	
	    _this.hexVertices = [];
	
	    _this.allDone = false;
	    _this.shapesInit = false;
	
	    _this.init();
	    return _this;
	  }
	
	  _createClass(ImageElement, [{
	    key: 'init',
	    value: function init() {
	      if (this.imageElement) {
	        return;
	      }
	
	      this.imageElement = document.createElement('div');
	      this.imageElement.classList.add('image');
	
	      this.canvasUtils = new _canvasUtils2.default(this);
	
	      this.canvas = this.canvasUtils.createHiDPICanvas(this.canvasWidth, this.canvasHeight, 4);
	      this.canvas.classList.add('image-canvas');
	      this.canvas.width = this.canvasWidth;
	      this.canvas.height = this.canvasHeight;
	
	      this.imageElement.appendChild(this.canvas);
	
	      this.context = this.canvas.getContext('2d');
	
	      this.faceStep = new _faceStep2.default(this, this.canvas, this.context);
	      this.zoomStep = new _zoomStep2.default(this, this.canvas, this.context);
	
	      animationUtils.setSmoothing(this.context);
	    }
	  }, {
	    key: 'loadImage',
	    value: function loadImage(json, imgPath) {
	      if (!json) {
	        return;
	      }
	      this.canvasUtils.loadImage(json, imgPath);
	    }
	  }, {
	    key: 'startAnimations',
	    value: function startAnimations() {
	      var _this2 = this;
	
	      // No faces, skip animations
	      if (!this.facesAndEmotions.length) return;
	
	      if (single) {
	        this.zoom(0, true);
	        this.startAuraAnimations();
	      } else {
	        _get(Object.getPrototypeOf(ImageElement.prototype), 'startAnimations', this).call(this, function () {
	          _this2.startAuraAnimations();
	        });
	      }
	    }
	  }, {
	    key: 'startAuraAnimations',
	    value: function startAuraAnimations() {
	      var _this3 = this;
	
	      this.auraAnimations = new Timeline({
	        onComplete: function onComplete() {
	          _get(Object.getPrototypeOf(ImageElement.prototype), 'killTimeline', _this3).call(_this3, _this3.auraAnimations);
	        }
	      });
	
	      var auraAnimStates = this.faces.length === 1 ? states.STATES_AURA_SINGLE : states.STATES_AURA_MULTIPLE;
	
	      auraAnimStates.forEach(function (state) {
	        _this3.auraAnimations.to(_this3, Math.max(state.DURATION, animationUtils.MIN_DURATION), {
	          onStart: function onStart() {
	            if (_this3[state.NAME]) {
	              _this3[state.NAME](state.DURATION);
	            } else {
	              _this3.pause(state.DURATION);
	            }
	          }
	        });
	      });
	
	      this.timelines.push(this.auraAnimations);
	    }
	  }, {
	    key: 'reinitFaces',
	    value: function reinitFaces(json) {
	      var _this4 = this;
	
	      _get(Object.getPrototypeOf(ImageElement.prototype), 'reinitFaces', this).call(this, json, function () {
	        if (_this4.particles) {
	          _this4.particles.kill();
	          _this4.particles = null;
	        }
	
	        var stepsToKill = [_this4.zoomStep, _this4.faceStep, _this4.flashStep, _this4.emotionStep, _this4.backgroundStep, _this4.haloStep, _this4.chromeStep];
	        stepsToKill.forEach(function (step) {
	          if (step) {
	            step.kill();
	            step = null;
	          }
	        });
	
	        _this4.faceStep = new _faceStep2.default(_this4, _this4.canvas, _this4.context);
	        _this4.zoomStep = new _zoomStep2.default(_this4, _this4.canvas, _this4.context);
	
	        _this4.backgroundFill = 'blue';
	        _this4.totalEmotions = 0;
	        _this4.imageScale = 1;
	        _this4.hexVertices = [];
	        _this4.facesAndEmotions = faceUtils.generateFacesAndEmotions(_this4.faces);
	        _this4.facesAndStrongestEmotions = faceUtils.generateFacesAndEmotions(_this4.faces, true);
	        _this4.treatments = animationUtils.generateTreatments(_this4.facesAndStrongestEmotions);
	        _this4.eyeMidpoints = faceUtils.generateEyeMidpoints(_this4.faces);
	        _this4.faceBounds = faceUtils.generateFaceBounds(_this4.faces);
	        _this4.allEyesCenter = faceUtils.generateAllEyesCenter(_this4.faces);
	        var totalEmotions = 0;
	        _this4.facesAndEmotions.forEach(function (face) {
	          totalEmotions += Object.keys(face).length;
	        });
	        _this4.noEmotions = totalEmotions === 0;
	        _this4.totalEmotions = totalEmotions;
	        _this4.scrimAlpha = 0;
	        _this4.fills = [];
	        _this4.vignettePattern = null;
	        _this4.resizedImageOffset = null;
	        _this4.resizedImageScale = 0;
	        _this4.auraAnimations = null;
	        _this4.offsetX = 0;
	        _this4.offsetY = 0;
	        _this4.allDone = false;
	        _this4.currentFrame = 0;
	        _this4.shapesInit = false;
	      });
	    }
	  }, {
	    key: 'ifNotDrawing',
	    value: function ifNotDrawing(callback) {
	      var _this5 = this;
	
	      requestAnimationFrame(function () {
	        if (_this5.isDrawing) {
	          _this5.imageElement.ifNotDrawing(callback);
	        } else {
	          callback();
	        }
	      });
	    }
	
	    //
	
	  }, {
	    key: 'flash',
	    value: function flash() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.flashStep = new _flashStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'zoom',
	    value: function zoom() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	      var zoomOut = arguments[1];
	
	      this.zoomStep.zoom(duration, zoomOut);
	    }
	  }, {
	    key: 'face',
	    value: function face() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.face(duration);
	    }
	  }, {
	    key: 'forehead',
	    value: function forehead() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.forehead(duration);
	    }
	  }, {
	    key: 'eyes',
	    value: function eyes() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.eyes(duration);
	    }
	  }, {
	    key: 'ears',
	    value: function ears() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.ears(duration);
	    }
	  }, {
	    key: 'nose',
	    value: function nose() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.nose(duration);
	    }
	  }, {
	    key: 'mouth',
	    value: function mouth() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.mouth(duration);
	    }
	  }, {
	    key: 'chin',
	    value: function chin() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.chin(duration);
	    }
	  }, {
	    key: 'allFeatures',
	    value: function allFeatures() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.faceStep.allFeatures(duration);
	    }
	  }, {
	    key: 'zoomOut',
	    value: function zoomOut() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.zoomStep.zoom(duration, true);
	    }
	  }, {
	    key: 'emotion',
	    value: function emotion() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.emotionStep = new _emotionStep2.default(this, this.canvas, this.context, duration);
	    }
	  }, {
	    key: 'animateInBackground',
	    value: function animateInBackground() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      if (this.facesAndEmotions.length !== 1) {
	        this.groupCircleStep = new _groupCircleStep2.default(this, this.canvas, this.context, duration);
	      } else {
	        this.backgroundStep = new _backgroundStep2.default(this, this.canvas, this.context, duration);
	      }
	    }
	  }, {
	    key: 'animateInHalo',
	    value: function animateInHalo() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.haloStep = new _haloStep2.default(this, this.canvas, this.context, duration);
	      this.showParticles();
	    }
	  }, {
	    key: 'animateInHaloMulti',
	    value: function animateInHaloMulti() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.multiAuraStep = new _multiAuraStep2.default(this, this.canvas, this.context, duration);
	      this.showParticles();
	    }
	  }, {
	    key: 'showParticles',
	    value: function showParticles() {
	      var _this6 = this;
	
	      var checkTiming = window.location.href.split('timing=');
	      if (checkTiming.length > 1) {
	        if (checkTiming[1].split('&')[0] === 'finalOnlyNoChrome') {
	          this.particles = new _particles2.default(this, this.canvas, this.context);
	          setTimeout(function () {
	            _this6.context.globalAlpha = 1;
	            _this6.particles.drawParticles();
	          }, 1000);
	        }
	      }
	    }
	  }, {
	    key: 'chrome',
	    value: function chrome() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.chromeStep = new _chromeStep2.default(this, this.canvas, this.context, duration);
	    }
	  }]);
	
	  return ImageElement;
	}(_panelComponent2.default);
	
	exports.default = ImageElement;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _imageConst = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var BackgroundStep = function () {
	  function BackgroundStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, BackgroundStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.circleStarted = false;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInBackground(duration);
	  }
	
	  _createClass(BackgroundStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'animateInBackgroundFrame',
	    value: function animateInBackgroundFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      this.context.save();
	
	      this.canvasUtils.redrawBaseImage();
	
	      this.canvasUtils.createShapeBackground(progress * 0.75);
	
	      if (!this.circleStarted && progress !== 1) {
	        this.circleStarted = true;
	        this.canvasUtils.drawCircle();
	      } else {
	        if (this.imageElement.currentFrame >= _imageConst.TOTAL_CIRCLE_FRAMES) {
	          this.canvasUtils.createTopShapes(true, 0);
	        }
	      }
	
	      this.context.restore();
	    }
	  }, {
	    key: 'animateInBackground',
	    value: function animateInBackground() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var rEnd = this.canvas.width;
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInBackgroundFrame(1, rEnd);
	        });
	      } else {
	        (function () {
	          var active = null;
	          var backgroundTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(backgroundTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(backgroundTimeline);
	              _this.context.restore();
	            }
	          });
	
	          var rStart = _this.imageElement.hexR;
	          var progress = 0;
	          var currR = rStart;
	
	          backgroundTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              active = backgroundTimeline.getActive()[0];
	              _this.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              progress = active.progress();
	              currR = ease.exp(rStart, rEnd, progress);
	              _this.animateInBackgroundFrame(progress, currR);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return BackgroundStep;
	}();
	
	exports.default = BackgroundStep;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var HaloStep = function () {
	  function HaloStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, HaloStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInHalo(duration);
	  }
	
	  _createClass(HaloStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'animateInHaloFrame',
	    value: function animateInHaloFrame() {
	      var prg = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var progress = prg / 2;
	      var group = this.imageElement.facesAndEmotions.length !== 1;
	
	      this.canvasUtils.redrawBaseImage();
	      this.context.save();
	      this.canvasUtils.createShapeBackground(1);
	
	      if (!this.imageElement.noEmotions) {
	
	        if (this.imageElement.treatments.treatment) {
	          if (this.imageElement.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.imageElement.treatments.treatment.halo.innerColor === colorUtils.TRANSPARENT) {
	            this.canvasUtils.createTopShapes(false, prg);
	            return;
	          }
	        }
	
	        if (this.imageElement.totalEmotions === 1) {
	          var alpha = ease.expOut(0, 0.5, progress);
	          var r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);
	
	          var gradient = this.context.createRadialGradient(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, this.imageElement.hexR - 125, this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, r);
	
	          if (group) {
	            gradient.addColorStop(0, (0, _animationUtils.getStrongestColor)(this.imageElement)[1]);
	          } else {
	            gradient.addColorStop(0, this.imageElement.treatments.treatment.halo.innerColor);
	
	            if (this.imageElement.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
	              gradient.addColorStop(0.5, this.imageElement.treatments.treatment.halo.outerColor);
	            }
	          }
	          gradient.addColorStop(1, colorUtils.TRANSPARENT);
	
	          this.context.fillStyle = gradient;
	          this.context.globalCompositeOperation = 'source-over';
	          this.context.globalAlpha = alpha;
	
	          this.context.fill();
	
	          this.context.restore();
	        } else {
	          var _alpha = ease.expOut(0.2, 0.5, progress);
	          var _r = ease.expOut(0.1, 1.2, progress);
	
	          if (group) {
	            this.context.fillStyle = this.canvasUtils.createSimpleGradient((0, _animationUtils.getStrongestColor)(this.imageElement)[0], colorUtils.TRANSPARENT, _r, false);
	          } else {
	            this.context.fillStyle = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.halo.innerColor, this.imageElement.treatments.treatment.halo.outerColor, _r, false);
	          }
	
	          this.context.globalCompositeOperation = 'source-over';
	          this.context.globalAlpha = _alpha;
	
	          this.context.fill();
	
	          var alpha2 = ease.expOut(0, 0.5, progress);
	          var r2 = void 0;
	          if (group) {
	            r2 = ease.expOut(0, this.imageElement.hexR * 3 / this.canvas.height, progress);
	            this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha((0, _animationUtils.getStrongestColor)(this.imageElement)[1], 1), colorUtils.TRANSPARENT, r2, false); // 0.4, 1
	            this.context.globalAlpha = alpha2;
	            this.context.fill();
	          }
	
	          this.context.restore();
	        }
	      }
	      this.canvasUtils.createTopShapes(false, prg);
	    }
	  }, {
	    key: 'animateInHalo',
	    value: function animateInHalo() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var group = this.imageElement.facesAndEmotions.length !== 1;
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInHaloFrame();
	        });
	      } else {
	        (function () {
	          var active = null;
	          var progress = 0;
	
	          var haloTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(haloTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(haloTimeline);
	              _this.context.restore();
	              _this.imageElement.allDone = true;
	            }
	          });
	
	          haloTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              _this.context.save();
	              active = haloTimeline.getActive()[0];
	              _this.imageElement.tweens.push(active);
	              _this.context.restore();
	            },
	            onUpdate: function onUpdate() {
	              progress = active.progress();
	              if (!group) {
	                if (!_this.imageElement.treatments.treatment.noEmotionScrim) {
	                  _this.animateInHaloFrame(progress, _this.imageElement.treatments.treatment.halo.radius);
	                } else {
	                  _this.animateInHaloFrame(progress);
	                }
	              } else {
	                _this.animateInHaloFrame(progress);
	              }
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return HaloStep;
	}();
	
	exports.default = HaloStep;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single, Image, requestAnimationFrame, setTimeout */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _assets = __webpack_require__(29);
	
	var assets = _interopRequireWildcard(_assets);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _particles = __webpack_require__(34);
	
	var _particles2 = _interopRequireDefault(_particles);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var ChromeStep = function () {
	  function ChromeStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, ChromeStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.logoTop = 35;
	    this.logoLeft = 40;
	    this.logoWidth = 60;
	    this.logoHeight = 53;
	
	    this.logo = new Image();
	    this.logo.src = assets.googleLogoSrc;
	
	    this.chrome(duration);
	  }
	
	  _createClass(ChromeStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.killAnimation = true;
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'chrome',
	    value: function chrome() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
	
	      this.particles = new _particles2.default(this.imageElement, this.canvas, this.context);
	      this.drawChrome(duration);
	    }
	  }, {
	    key: 'drawParticles',
	    value: function drawParticles() {
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
	  }, {
	    key: 'drawChromeFrame',
	    value: function drawChromeFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var height = arguments.length <= 1 || arguments[1] === undefined ? 112 : arguments[1];
	      var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	      this.context.save();
	      this.context.globalCompositeOperation = 'source-over';
	      this.context.fillStyle = 'rgba(255, 255, 255, ' + progress + ')';
	      this.context.fillRect(0, this.canvas.height - height, this.canvas.width, height);
	      this.context.restore();
	
	      if (callback) {
	        callback();
	      }
	    }
	  }, {
	    key: 'drawChrome',
	    value: function drawChrome() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
	
	      if (this.killAnimation) {
	        return;
	      }
	      var height = 0;
	      if (single) {
	        height = animationUtils.CHROME_SHORT_HEIGHT;
	      } else {
	        height = this.imageElement.totalEmotions <= animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS ? animationUtils.CHROME_SHORT_HEIGHT : animationUtils.CHROME_TALL_HEIGHT;
	      }
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          if (!_this.imageElement || !_this.imageElement.totalEmotions) {
	            return;
	          }
	          if (_this.imageElement.totalEmotions > 0) {
	            _this.drawChromeFrame(1, height, function () {
	              var tick = 0;
	              _this.imageElement.facesAndEmotions.forEach(function (person) {
	                for (var emotion in person) {
	                  _this.drawChromeHex(height, emotion, person[emotion], tick, 1);
	                  tick++;
	                }
	              });
	            });
	          }
	
	          _this.context.globalAlpha = 1;
	          _this.particles.drawParticles();
	
	          _this.context.globalCompositeOperation = 'source-over';
	          _this.context.drawImage(_this.logo, _this.logoLeft, _this.logoTop, single ? _this.logoWidth * 1.5 : _this.logoWidth, single ? _this.logoHeight * 1.5 : _this.logoHeight);
	        });
	      } else {
	        (function () {
	          var timeline = new Timeline({
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(timeline);
	            }
	          });
	          var currActive = null;
	          if (_this.imageElement.totalEmotions > 0) {
	            timeline.to(_this, duration, {
	              onStart: function onStart() {
	                currActive = timeline.getActive()[0];
	                _this.imageElement.tweens.push(currActive);
	              },
	              onUpdate: function onUpdate() {
	                var progress = currActive.progress();
	                _this.canvasUtils.redrawCurrentCanvas();
	                _this.drawChromeFrame(progress, height);
	
	                _this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
	
	                _this.particles.drawParticles();
	
	                _this.context.drawImage(_this.logo, _this.logoLeft, _this.logoTop, _this.logoWidth, _this.logoHeight);
	
	                var tick = -1;
	
	                _this.imageElement.facesAndEmotions.forEach(function (person) {
	                  for (var emotion in person) {
	                    tick++;
	                    // animationUtils.EMOTION_HEX_FADE_DURATION / this.imageElement.timeFactor
	                    _this.drawChromeHex(height, emotion, person[emotion], tick, currActive.progress());
	                  }
	                });
	              },
	              onComplete: function onComplete() {
	                _this.imageElement.killTween(currActive);
	                setTimeout(function () {
	                  _this.drawParticles();
	                }, 100);
	              }
	            });
	          } else {
	            timeline.to(_this, duration, {
	              onStart: function onStart() {
	                currActive = timeline.getActive()[0];
	                _this.imageElement.tweens.push(currActive);
	              },
	              onUpdate: function onUpdate() {
	                _this.canvasUtils.redrawCurrentCanvas();
	                _this.context.globalAlpha = ease.exp(0, 1, currActive.progress());
	                _this.particles.drawParticles();
	              },
	              onComplete: function onComplete() {
	                _this.imageElement.killTween(currActive);
	                _this.drawParticles();
	              }
	            });
	          }
	
	          _this.imageElement.timelines.push(timeline);
	        })();
	      }
	    }
	  }, {
	    key: 'drawChromeHex',
	    value: function drawChromeHex(height, emotion, strength, num, progress) {
	      var radius = arguments.length <= 5 || arguments[5] === undefined ? animationUtils.CHROME_HEX_RADIUS : arguments[5];
	
	      if (num >= animationUtils.CHROME_MAX_ITEMS) {
	        return;
	      }
	
	      this.context.save();
	
	      this.canvasUtils.retraceCanvas();
	
	      var x = 0;
	      var y = 0;
	      if (single) {
	        x = animationUtils.CHROME_HORIZONTAL_PADDING + num % animationUtils.CHROME_MAX_ITEMS * animationUtils.BACKEND_CHROME_ITEM_WIDTH;
	        y = this.canvas.height - height + animationUtils.CHROME_VERTICAL_PADDING + Math.floor(num / animationUtils.CHROME_MAX_ITEMS) * animationUtils.CHROME_SINGLE_LINE_HEIGHT + Math.floor(num / animationUtils.CHROME_MAX_ITEMS) * animationUtils.CHROME_SPACE_BETWEEN_LINES;
	      } else {
	        x = animationUtils.CHROME_HORIZONTAL_PADDING + num % (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) * animationUtils.CHROME_ITEM_WIDTH;
	        y = this.canvas.height - height + animationUtils.CHROME_VERTICAL_PADDING + Math.floor(num / animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS) * animationUtils.CHROME_SINGLE_LINE_HEIGHT + Math.floor(num / (animationUtils.CHROME_MAX_ITEMS / animationUtils.CHROME_MAX_ROWS)) * animationUtils.CHROME_SPACE_BETWEEN_LINES;
	      }
	
	      this.context.beginPath();
	      var hexStartX = x + radius;
	      var hexStartY = y + radius;
	      this.context.arc(hexStartX, hexStartY, radius, 0, Math.PI * 2);
	      this.context.closePath();
	      this.context.globalAlpha = ease.exp(0, 1, progress);
	      var grad = this.context.createLinearGradient(x, y, x + radius * 2, y + radius * 2);
	      grad.addColorStop(0, colorUtils[emotion][0]);
	      grad.addColorStop(1, colorUtils[emotion][2]);
	      this.context.fillStyle = grad;
	      this.context.fill();
	      this.context.globalAlpha = 1;
	      this.context.font = '12px "Roboto Mono"';
	      this.context.fillStyle = 'rgba(0, 0, 0, ' + ease.exp(0, 0.38, progress) + ')';
	      this.context.fillText(emotion.toLowerCase() + ':' + strength, hexStartX + radius * 1.5, hexStartY + radius / 4);
	
	      this.context.restore();
	    }
	  }]);
	
	  return ChromeStep;
	}();
	
	exports.default = ChromeStep;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* global single */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PARTICLE_COUNT = 10;
	var BASE_RADIUS = 135;
	var BASE_GROUP_RADIUS = 225;
	var MAX_GROUP_RADIUS = 390;
	var RADIUS_LINE_OFFSET = 90;
	
	var Particles = function () {
	  function Particles(imageElement, canvas, context) {
	    _classCallCheck(this, Particles);
	
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
	
	  _createClass(Particles, [{
	    key: 'kill',
	    value: function kill() {
	      this.killParticles = true;
	      this.imageElement = null;
	      this.particles = null;
	      this.canvas = null;
	      this.context = null;
	    }
	  }, {
	    key: 'calculateWithScale',
	    value: function calculateWithScale(num) {
	      var radiusScale = this.imageElement.hexR / (225 * this.shapeScale);
	      if (radiusScale > 390 * this.shapeScale) {
	        radiusScale = 390 * this.shapeScale;
	      }
	      var total = num * this.shapeScale;
	      if (this.isGroup && this.imageElement.hexR > 225) {
	        total = num * radiusScale * this.shapeScale;
	      }
	      return total;
	    }
	  }, {
	    key: 'createParticles',
	    value: function createParticles() {
	      var i = 0;
	      var xPoint = 0;
	      var yPoint = 0;
	
	      for (i = 0; i < PARTICLE_COUNT; i++) {
	        var randomAngle = -0.5 + Math.random();
	        var particleLocation = i / PARTICLE_COUNT + randomAngle * .1;
	        var angle = Math.PI * 2 * particleLocation;
	        var radius = this.getParaticleRadius() + RADIUS_LINE_OFFSET;
	
	        xPoint = this.imageElement.eyesMidpoint.x + Math.cos(angle) * radius + Math.random() * 2;
	        yPoint = this.imageElement.eyesMidpoint.y + Math.sin(angle) * radius + Math.random() * 2;
	
	        this.particles.push({
	          x: xPoint,
	          y: yPoint,
	          size: 2 * this.shapeScale,
	          speed: (Math.random() * 0.5 + 0.5) / 60,
	          radius: Math.random() * 10 + 2
	        });
	      }
	    }
	  }, {
	    key: 'getParaticleRadius',
	    value: function getParaticleRadius() {
	      var baseRadius = BASE_RADIUS * this.shapeScale;
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
	  }, {
	    key: 'drawParticles',
	    value: function drawParticles() {
	      if (this.killParticles || single) {
	        return;
	      }
	
	      var i = 0;
	
	      this.context.save();
	
	      var emoColor = void 0;
	      var emoColorOffset = 0;
	
	      if (this.imageElement.noEmotions) {
	        emoColor = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.3);
	        emoColorOffset = 0.3;
	      } else {
	        emoColor = 'rgba(255, 255, 255, 1)';
	        emoColorOffset = 1;
	      }
	
	      var color = colorUtils.subAlpha(emoColor, this.particleFade * emoColorOffset);
	
	      this.context.fillStyle = color;
	
	      for (; i < PARTICLE_COUNT; i++) {
	        var p = this.particles[i];
	
	        var x = p.x + Math.sin(this.particleCount * p.speed) * p.radius;
	        var y = p.y + Math.cos(this.particleCount * p.speed) * p.radius;
	        var s = p.size;
	        this.context.beginPath();
	        this.context.arc(x, y, s, 0, Math.PI * 2);
	        this.context.fill();
	        this.context.closePath();
	      }
	
	      this.context.restore();
	
	      this.particleCount++;
	    }
	  }]);
	
	  return Particles;
	}();
	
	exports.default = Particles;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	var _imageConst = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var CircleStep = function () {
	  function CircleStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, CircleStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	
	    this.circleStarted = false;
	
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInCircle(duration);
	  }
	
	  _createClass(CircleStep, [{
	    key: 'kill',
	    value: function kill() {
	      this.imageElement = null;
	      this.canvas = null;
	      this.context = null;
	      this.canvasUtils = null;
	    }
	  }, {
	    key: 'animateInCircleFrame',
	    value: function animateInCircleFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      this.canvasUtils.redrawBaseImage();
	      if (!this.circleStarted && progress !== 1) {
	        this.circleStarted = true;
	        this.canvasUtils.drawCircle();
	      } else {
	        if (this.imageElement.currentFrame >= _imageConst.TOTAL_CIRCLE_FRAMES) {
	          this.canvasUtils.createTopShapes(true, 0);
	        }
	      }
	    }
	  }, {
	    key: 'animateInCircle',
	    value: function animateInCircle() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInCircleFrame(1);
	        });
	      } else {
	        (function () {
	          var active = null;
	          var backgroundTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(backgroundTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(backgroundTimeline);
	              _this.context.restore();
	            }
	          });
	
	          var progress = 0;
	
	          backgroundTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              active = backgroundTimeline.getActive()[0];
	              _this.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              progress = active.progress();
	              _this.animateInCircleFrame(progress);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }]);
	
	  return CircleStep;
	}();
	
	exports.default = CircleStep;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, single */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _easings = __webpack_require__(19);
	
	var ease = _interopRequireWildcard(_easings);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _colorUtils = __webpack_require__(10);
	
	var colorUtils = _interopRequireWildcard(_colorUtils);
	
	var _pointUtils = __webpack_require__(18);
	
	var _pointUtils2 = _interopRequireDefault(_pointUtils);
	
	var _canvasUtils = __webpack_require__(17);
	
	var _canvasUtils2 = _interopRequireDefault(_canvasUtils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timeline = __webpack_require__(14);
	
	var MultiAuraStep = function () {
	  function MultiAuraStep(imageElement, canvas, context, duration) {
	    _classCallCheck(this, MultiAuraStep);
	
	    this.imageElement = imageElement;
	    this.canvas = canvas;
	    this.context = context;
	    this.pointUtils = new _pointUtils2.default(imageElement);
	    this.canvasUtils = new _canvasUtils2.default(imageElement, canvas, context);
	
	    this.animateInMultiAura(duration);
	  }
	
	  _createClass(MultiAuraStep, [{
	    key: 'fillInFeatheredCircle',
	    value: function fillInFeatheredCircle(pattern, radius, feather) {
	      var reverse = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
	      var centered = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
	
	      var tempCanvas = this.canvasUtils.createHiDPICanvas();
	      tempCanvas.width = this.canvas.width;
	      tempCanvas.height = this.canvas.height;
	      var tempContext = tempCanvas.getContext('2d');
	      animationUtils.setSmoothing(tempContext);
	
	      var x = centered ? this.canvas.width / 2 : this.imageElement.eyesMidpoint.x;
	      var y = centered ? this.canvas.height / 2 : this.imageElement.eyesMidpoint.y;
	
	      var gradient = tempContext.createRadialGradient(x, y, 0, x, y, radius);
	
	      gradient.addColorStop(1 - feather / radius, reverse ? colorUtils.TRANSPARENT : colorUtils.BLACK);
	      gradient.addColorStop(1, reverse ? colorUtils.BLACK : colorUtils.TRANSPARENT);
	
	      tempContext.fillStyle = gradient;
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      tempContext.fillStyle = pattern;
	      tempContext.globalCompositeOperation = 'source-in';
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      var canvasPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	      return canvasPattern;
	    }
	  }, {
	    key: 'animateInMultiAuraFrame',
	    value: function animateInMultiAuraFrame() {
	      var progress = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	      var startR = arguments.length <= 1 || arguments[1] === undefined ? this.canvas.width : arguments[1];
	      var fill = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	      var comp = arguments.length <= 3 || arguments[3] === undefined ? animationUtils.BLEND_NORMAL : arguments[3];
	
	      if (!fill) {
	        return;
	      }
	
	      this.context.globalAlpha = ease.expOut(0, 1, progress);
	
	      this.imageElement.isDrawing = true;
	
	      var feather = ease.linear(0, startR, progress);
	
	      this.canvasUtils.redrawBaseImage();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, startR, feather);
	      // this.context.globalAlpha = ease.expOut(0.4, 1, progress);
	      this.context.globalCompositeOperation = comp;
	
	      this.canvasUtils.cutOutCircle();
	
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, ease.expOut(this.imageElement.hexR * 0.75, this.imageElement.hexR * 1.25, progress), ease.exp(this.imageElement.hexR * 0.25, this.imageElement.hexR * 0.75, progress));
	
	      // this.context.globalAlpha = ease.exp(0.3, 0.7, progress);
	      this.context.globalAlpha = ease.expOut(0, 1, progress);
	
	      this.context.globalCompositeOperation = 'screen';
	      this.context.fill();
	
	      this.context.globalCompositeOperation = 'color-burn';
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, ease.expOut(this.canvas.height * 2, this.canvas.height, progress), ease.exp(this.canvas.height, this.canvas.height - this.imageElement.hexR / 2, progress), true, false);
	
	      // this.context.globalAlpha = ease.exp(0, 0.6, progress);
	      this.context.globalAlpha = ease.expOut(0, 1, progress);
	
	      this.context.globalCompositeOperation = 'multiply';
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(colorUtils.BLACK, this.canvas.height, this.canvas.height / 6, true, true);
	      // this.context.globalAlpha = ease.exp(0, 0.05, progress);
	      this.context.globalAlpha = ease.expOut(0, 0.05, progress);
	      this.context.globalCompositeOperation = 'source-over';
	      this.context.fill();
	
	      this.context.fillStyle = this.fillInFeatheredCircle(fill, this.canvas.height * 1.2, this.canvas.height / 5, true, true);
	      // this.context.globalAlpha = ease.exp(0, 1, progress);
	      this.context.globalAlpha = ease.expOut(0, 1, progress);
	      this.context.globalCompositeOperation = 'hard-light';
	      this.context.fill();
	
	      this.context.globalCompositeOperation = 'source-over';
	      this.context.globalAlpha = 1;
	      this.canvasUtils.createTopShapes(false, progress);
	
	      this.imageElement.isDrawing = false;
	    }
	  }, {
	    key: 'animateInMultiAura',
	    value: function animateInMultiAura() {
	      var _this = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	      var fill = null;
	      var comp = this.imageElement.treatments.groupAuraColors.length > 0 ? 'screen' : 'lighten';
	      var startR = this.pointUtils.toGridCoords(this.imageElement.faceBounds.right - this.imageElement.faceBounds.left) / 2;
	
	      if (duration === 0) {
	        this.imageElement.ifNotDrawing(function () {
	          _this.animateInMultiAuraFrame(1, _this.canvas.width, _this.getMultiAuraFill(), comp);
	        });
	      } else {
	        (function () {
	          var active = null;
	
	          var auraTimeline = new Timeline({
	            onStart: function onStart() {
	              _this.imageElement.timelines.push(auraTimeline);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.killTimeline(auraTimeline);
	            }
	          });
	          auraTimeline.to(_this.canvas, duration, {
	            onStart: function onStart() {
	              active = auraTimeline.getActive()[0];
	              fill = _this.getMultiAuraFill();
	              _this.imageElement.fills = [fill];
	              _this.imageElement.isDrawing = false;
	              _this.imageElement.tweens.push(active);
	            },
	            onUpdate: function onUpdate() {
	              var progress = active.progress();
	              var r = ease.exp(startR, _this.canvas.width, progress);
	
	              _this.animateInMultiAuraFrame(progress, r, _this.imageElement.fills[0], comp);
	            },
	            onComplete: function onComplete() {
	              _this.imageElement.canvasSnapshot = _this.context.createPattern(_this.canvas, 'no-repeat');
	              _this.imageElement.killTween(active);
	            }
	          });
	        })();
	      }
	    }
	  }, {
	    key: 'getMultiAuraFill',
	    value: function getMultiAuraFill() {
	      var tempCanvas = this.canvasUtils.createHiDPICanvas(this.imageElement.canvasWidth, this.imageElement.canvasHeight);
	      tempCanvas.width = this.imageElement.canvasWidth;
	      tempCanvas.height = this.imageElement.canvasHeight;
	      var tempContext = tempCanvas.getContext('2d');
	      animationUtils.setSmoothing(tempContext);
	
	      var gradientColors = this.imageElement.treatments.groupAuraColors;
	
	      // no one in the group shows any emotion
	      if (gradientColors.length === 0) {
	        tempContext.save();
	        tempContext.fillStyle = colorUtils.subAlpha(colorUtils.NEUTRAL, 0.35);
	        tempContext.globalAlpha = 1;
	        tempContext.globalCompositeOperation = 'source-over';
	
	        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	        var solidPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	        tempContext.restore();
	
	        return solidPattern;
	      } else if (gradientColors.length === 1) {
	        // only one emotion in the entire group
	        var gradient = this.canvasUtils.createSimpleGradient(gradientColors[0], colorUtils.subAlpha(gradientColors[0], 0.2));
	
	        tempContext.save();
	        tempContext.fillStyle = gradient;
	        tempContext.globalAlpha = 1;
	        tempContext.globalCompositeOperation = 'source-over';
	
	        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	        var _gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	        tempContext.restore();
	
	        return _gradientPattern;
	      }
	
	      tempContext.save();
	      // get total number of emotions to display, and then tween between their colors, degree by degree
	      var degBetweenColors = 360 / gradientColors.length;
	      var currOffset = 0;
	      var offsetDeg = 30 - Math.floor(Math.random() * 36) + 135;
	      var startOffset = 360 + offsetDeg;
	      tempContext.globalCompositeOperation = animationUtils.BLEND_NORMAL;
	
	      tempContext.fillStyle = colorUtils.WHITE;
	      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
	
	      tempContext.translate(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y);
	      tempContext.lineWidth = 1;
	      tempContext.lineCap = 'round';
	
	      gradientColors.forEach(function (color, index, arr) {
	        var nextColor = arr[(index + 1) % arr.length];
	        var colorSplit = colorUtils.splitRGBA(color);
	        var nextColorSplit = colorUtils.splitRGBA(nextColor);
	        var rStep = (nextColorSplit.r - colorSplit.r) / degBetweenColors;
	        var gStep = (nextColorSplit.g - colorSplit.g) / degBetweenColors;
	        var bStep = (nextColorSplit.b - colorSplit.b) / degBetweenColors;
	        currOffset = degBetweenColors * index + startOffset;
	
	        for (var currDeg = 0; currDeg < degBetweenColors; currDeg += single ? 0.01 : 0.02) {
	          var actualCurrDeg = currDeg + currOffset + startOffset;
	          tempContext.save();
	          tempContext.rotate(Math.PI * actualCurrDeg * -1 / 180);
	          tempContext.translate(tempContext.lineWidth / 2 * -1, tempContext.lineWidth / 2);
	
	          var currR = parseInt(colorSplit.r + currDeg * rStep, 10);
	          var currG = parseInt(colorSplit.g + currDeg * gStep, 10);
	          var currB = parseInt(colorSplit.b + currDeg * bStep, 10);
	          var currA = 1;
	          var currStyle = 'rgba(' + currR + ', ' + currG + ', ' + currB + ', ' + currA + ')';
	
	          tempContext.globalAlpha = currA;
	
	          tempContext.fillStyle = currStyle;
	
	          tempContext.fillRect(0, 0, 0.8, Math.max(tempCanvas.width, tempCanvas.height) * 2);
	
	          tempContext.restore();
	        }
	      });
	
	      var gradientPattern = tempContext.createPattern(tempCanvas, 'no-repeat');
	
	      tempContext.restore();
	
	      return gradientPattern;
	    }
	  }]);
	
	  return MultiAuraStep;
	}();
	
	exports.default = MultiAuraStep;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* global require, document */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _panelComponent = __webpack_require__(5);
	
	var _panelComponent2 = _interopRequireDefault(_panelComponent);
	
	var _faceUtils = __webpack_require__(6);
	
	var faceUtils = _interopRequireWildcard(_faceUtils);
	
	var _animationUtils = __webpack_require__(9);
	
	var animationUtils = _interopRequireWildcard(_animationUtils);
	
	var _emotionUtils = __webpack_require__(7);
	
	var emotionUtils = _interopRequireWildcard(_emotionUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	__webpack_require__(12);
	var TimelineMax = __webpack_require__(14);
	
	var JsonElement = function (_PanelComponent) {
	  _inherits(JsonElement, _PanelComponent);
	
	  function JsonElement() {
	    var reqPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	    var respPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	
	    _classCallCheck(this, JsonElement);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(JsonElement).call(this));
	
	    _this.reqPath = reqPath;
	    _this.respPath = respPath;
	
	    _this.reqJson = null;
	    _this.json = null;
	
	    _this.title = 'Foo Bar Baz';
	
	    _this.mainElt = null;
	    _this.textWrap = null;
	
	    _this.scrim = null;
	    _this.jsonElement = null;
	    _this.titleElt = null;
	
	    _this.reqJson = null;
	    _this.resJson = null;
	
	    _this.init();
	    return _this;
	  }
	
	  _createClass(JsonElement, [{
	    key: 'init',
	    value: function init() {
	      var mainElt = document.createElement('div');
	      mainElt.classList.add('json');
	
	      this.textWrap = document.createElement('div');
	      this.textWrap.classList.add('json-text-wrap');
	
	      this.scrim = document.createElement('div');
	      this.scrim.classList.add('scrim');
	
	      this.mainElt = mainElt;
	      this.mainElt.appendChild(this.textWrap);
	      this.mainElt.appendChild(this.scrim);
	    }
	  }, {
	    key: 'loadJSON',
	    value: function loadJSON(reqJson, respJson) {
	      this.reqJson = reqJson;
	      this.reinitFaces(respJson);
	      this.killAnimations();
	    }
	  }, {
	    key: 'flash',
	    value: function flash() {
	      var _this2 = this;
	
	      var tl = new TimelineMax({
	        onComplete: function onComplete() {
	          _get(Object.getPrototypeOf(JsonElement.prototype), 'killTimeline', _this2).call(_this2, tl);
	        }
	      });
	      tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, { opacity: 1 });
	      this.timelines.push(tl);
	    }
	  }, {
	    key: 'analyze',
	    value: function analyze() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.reqJson, duration / this.timeFactor, 'Analyzing');
	    }
	  }, {
	    key: 'face',
	    value: function face() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.getFaceInfo(), duration / this.timeFactor, 'Face');
	    }
	  }, {
	    key: 'ears',
	    value: function ears() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EARS), duration / this.timeFactor, 'Ears');
	    }
	  }, {
	    key: 'forehead',
	    value: function forehead() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FOREHEAD), duration / this.timeFactor, 'Forehead');
	    }
	  }, {
	    key: 'nose',
	    value: function nose() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.NOSE), duration / this.timeFactor, 'Nose');
	    }
	  }, {
	    key: 'mouth',
	    value: function mouth() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.MOUTH), duration / this.timeFactor, 'Mouth');
	    }
	  }, {
	    key: 'chin',
	    value: function chin() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.CHIN), duration / this.timeFactor, 'Chin');
	    }
	  }, {
	    key: 'eyes',
	    value: function eyes() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EYES), duration / this.timeFactor, 'Eyes');
	    }
	  }, {
	    key: 'allFeatures',
	    value: function allFeatures() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FULL), duration / this.timeFactor, 'Face');
	    }
	  }, {
	    key: 'emotion',
	    value: function emotion() {
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.injectJSON([this.getEmotionInfo()], duration / this.timeFactor, 'Emotion', false, true);
	    }
	  }, {
	    key: 'complete',
	    value: function complete() {
	      var _this3 = this;
	
	      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      var json = [];
	      this.json.forEach(function (item, i) {
	        json.push(_this3.getEmotionInfo(i));
	      });
	      this.injectJSON(json, duration / this.timeFactor, 'Processing Complete', true, true);
	    }
	  }, {
	    key: 'updateAllText',
	    value: function updateAllText() {
	      this.injectTitle();
	      this.injectJSON();
	    }
	  }, {
	    key: 'updateJSON',
	    value: function updateJSON(guide) {
	      if (guide.TITLE) {
	        this.injectTitle(guide.TITLE);
	      }
	    }
	  }, {
	    key: 'injectTitle',
	    value: function injectTitle() {
	      var title = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      if (!title) {
	        return;
	      }
	
	      if (!this.titleElt) {
	        this.titleElt = document.createElement('h1');
	        this.titleElt.classList.add('json-title');
	        this.textWrap.insertBefore(this.titleElt, this.textWrap.children[0]);
	      }
	
	      while (this.titleElt.lastChild) {
	        this.titleElt.removeChild(this.titleElt.lastChild);
	      }
	
	      this.titleElt.appendChild(document.createTextNode(title));
	    }
	  }, {
	    key: 'addTypeEmphasis',
	    value: function addTypeEmphasis(json, html) {
	      json.forEach(function (item) {
	        if (item.type) {
	          var re = new RegExp('"' + item.type + '"', 'g');
	          html = html.replace(re, '<span class="json-text-em">' + item.type + '</span>');
	        }
	      });
	      return html;
	    }
	  }, {
	    key: 'syntaxHighlighting',
	    value: function syntaxHighlighting(json) {
	      var breakString = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
	
	      var html = JSON.stringify(json, null, breakString);
	      var re = new RegExp('{\n</br>', 'g');
	      html = html.replace(re, '{');
	      re = new RegExp('\n}', 'g');
	      html = html.replace(re, '}');
	
	      if (json.length) {
	        html = this.addTypeEmphasis(json, html);
	      } else {
	        for (var key in json) {
	          if (emotionUtils.EMOTION_LIKELIHOODS.indexOf(key) > -1) {
	            if (json[key] !== emotionUtils.EMOTION_STATES.VERY_UNLIKELY) {
	              var emotion = '"' + key + '": "' + json[key] + '"';
	              var emoRe = new RegExp(emotion, 'g');
	              html = html.replace(emoRe, '<span class="json-text-em_' + key.replace('Likelihood', '') + '">' + emotion + '</span>');
	            }
	          }
	          if (key === 'landmarks') {
	            html = this.addTypeEmphasis(json[key], html);
	          }
	        }
	      }
	      if (html[0] === '[') {
	        html = html.slice(1, html.length - 1);
	      }
	      return html;
	    }
	  }, {
	    key: 'injectJSON',
	    value: function injectJSON(json, duration, title, isFinal, isEmotion) {
	      var _this4 = this;
	
	      if (!this.jsonElement) {
	        this.jsonElement = document.createElement('div');
	        this.jsonElement.classList.add('json-text');
	        this.textWrap.appendChild(this.jsonElement);
	      }
	
	      if (!isEmotion) {
	        this.jsonElement.innerHTML = this.syntaxHighlighting(json);
	      } else {
	        this.jsonElement.innerHTML = '';
	        json.forEach(function (item) {
	          _this4.jsonElement.innerHTML += _this4.syntaxHighlighting(item, '</br>') + '</br></br>';
	        });
	      }
	      this.injectTitle(title);
	
	      if (this.jsonElement.innerHTML.length > 2000 || this.jsonElement.innerHTML.split('}').length > 5 && isFinal) {
	        // if (this.jsonElement.innerHTML.length > 2000) {
	        this.jsonElement.classList.add('json-text_long');
	      } else {
	        this.jsonElement.classList.remove('json-text_long');
	      }
	      var tl = new TimelineMax({
	        onComplete: function onComplete() {
	          _get(Object.getPrototypeOf(JsonElement.prototype), 'killTimeline', _this4).call(_this4, tl);
	        }
	      });
	      tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, {
	        opacity: 0
	      }).to(this.scrim, duration / this.timeFactor - animationUtils.POINTS_FADE_DURATION * 2, {
	        opacity: 0
	      });
	
	      if (!isFinal) {
	        tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, {
	          opacity: 1
	        });
	      }
	
	      this.timelines.push(tl);
	    }
	  }]);
	
	  return JsonElement;
	}(_panelComponent2.default);
	
	exports.default = JsonElement;

/***/ },
/* 38 */
/***/ function(module, exports) {

	/* global document, setTimeout */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Threeup = function () {
	  function Threeup() {
	    var imgPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	    _classCallCheck(this, Threeup);
	
	    this.threeup = null;
	    this.hero = null;
	    this.wrap = null;
	    this.imgPath = imgPath;
	
	    this.init();
	  }
	
	  _createClass(Threeup, [{
	    key: 'init',
	    value: function init() {}
	  }, {
	    key: 'manifest',
	    value: function manifest() {
	      var wrap = document.createElement('div');
	      wrap.classList.add('threeup-wrap');
	
	      var threeupElt = document.createElement('div');
	      threeupElt.classList.add('threeup');
	      this.threeup = threeupElt;
	
	      var heroElt = document.createElement('div');
	      heroElt.classList.add('threeup-hero');
	      this.hero = heroElt;
	
	      wrap.appendChild(this.threeup);
	      wrap.appendChild(this.hero);
	
	      this.wrap = wrap;
	
	      document.getElementById('historical').appendChild(wrap);
	
	      this.newImage();
	    }
	  }, {
	    key: 'newImage',
	    value: function newImage() {
	      var imageUrl = arguments.length <= 0 || arguments[0] === undefined ? this.imgPath : arguments[0];
	      var skip = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	
	      this.imgPath = imageUrl;
	
	      this.threeup.style.backgroundImage = 'url(' + imageUrl + ')';
	
	      if (!skip) {
	        this.newHero(imageUrl);
	      }
	    }
	  }, {
	    key: 'noMoreHeroes',
	    value: function noMoreHeroes() {
	      if (this.hero) {
	        this.wrap.removeChild(this.hero);
	        this.hero = null;
	      }
	    }
	  }, {
	    key: 'newHero',
	    value: function newHero() {
	      var _this = this;
	
	      var imageUrl = arguments.length <= 0 || arguments[0] === undefined ? this.imgPath : arguments[0];
	
	      this.noMoreHeroes();
	
	      var heroElt = document.createElement('hero');
	      heroElt.classList.add('threeup-hero');
	      this.hero = heroElt;
	
	      this.wrap.appendChild(this.hero);
	
	      this.hero.classList.add('threeup-hero-active');
	      this.hero.style.backgroundImage = 'url(' + imageUrl + ')';
	
	      setTimeout(function () {
	        if (_this.hero) {
	          _this.hero.classList.remove('threeup-hero-active');
	          setTimeout(function () {
	            _this.noMoreHeroes();
	          }, 2 * 1000);
	        }
	      }, 3 * 1000);
	    }
	  }]);
	
	  return Threeup;
	}();
	
	exports.default = Threeup;

/***/ },
/* 39 */
/***/ function(module, exports) {

	/* global document */
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Controls = function () {
	  function Controls() {
	    _classCallCheck(this, Controls);
	
	    this.controlsWrap = null;
	
	    this.init();
	  }
	
	  _createClass(Controls, [{
	    key: 'init',
	    value: function init() {
	      this.controlsWrap = document.createElement('div');
	      this.controlsWrap.classList.add('controls');
	
	      document.body.appendChild(this.controlsWrap);
	    }
	  }, {
	    key: 'genNewImage',
	    value: function genNewImage(callback, numEmotions) {
	      return function () {
	        callback(numEmotions);
	      };
	    }
	  }, {
	    key: 'genNewGroupImage',
	    value: function genNewGroupImage(callback, imgId) {
	      return function () {
	        callback(imgId);
	      };
	    }
	  }, {
	    key: 'addNewSingleImageButtons',
	    value: function addNewSingleImageButtons(callback) {
	      var wrap = document.createElement('span');
	
	      for (var i = 0; i <= 2; i++) {
	        var newSingleImageButton = document.createElement('button');
	        newSingleImageButton.innerHTML = 'Take Photo (' + i + ' emotion' + (i !== 1 ? 's' : '') + ')';
	        newSingleImageButton.classList.add('controls-button');
	        newSingleImageButton.onclick = this.genNewImage(callback, i);
	
	        wrap.appendChild(newSingleImageButton);
	      }
	
	      this.addNewControlsSection(wrap);
	    }
	  }, {
	    key: 'addNewGroupImageButtons',
	    value: function addNewGroupImageButtons(callback) {
	      var wrap = document.createElement('span');
	
	      for (var i = 0; i <= 3; i++) {
	        var newButton = document.createElement('button');
	        newButton.innerHTML = 'Take Group Photo (' + (i < 3 ? i : 'many') + ' emotion' + (i !== 1 ? 's' : '') + ')';
	        newButton.classList.add('controls-button');
	        newButton.onclick = this.genNewGroupImage(callback, i);
	        wrap.appendChild(newButton);
	      }
	
	      this.addNewControlsSection(wrap);
	    }
	  }, {
	    key: 'addViewPicker',
	    value: function addViewPicker() {
	      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	
	      var viewsWrap = document.createElement('div');
	
	      var latestWrap = document.createElement('div');
	      latestWrap.classList.add('controls-radio-wrap');
	      var latestRadio = document.createElement('input');
	      latestRadio.type = 'radio';
	      latestRadio.id = 'controls-views-latest';
	      latestRadio.name = 'controls-views';
	      latestRadio.classList.add('controls-views-choice');
	      latestRadio.checked = true;
	
	      if (callback) {
	        latestRadio.onchange = function () {
	          callback('latest');
	        };
	      }
	
	      var latestLabel = document.createElement('label');
	      latestLabel.classList.add('controls-views-label');
	      latestLabel.htmlFor = 'controls-views-latest';
	      latestLabel.innerHTML = 'Latest';
	
	      latestWrap.appendChild(latestRadio);
	      latestWrap.appendChild(latestLabel);
	      viewsWrap.appendChild(latestWrap);
	
	      var historicalWrap = document.createElement('div');
	      historicalWrap.classList.add('controls-radio-wrap');
	      var historicalRadio = document.createElement('input');
	      historicalRadio.type = 'radio';
	      historicalRadio.id = 'controls-views-historical';
	      historicalRadio.name = 'controls-views';
	      historicalRadio.classList.add('controls-views-choice');
	
	      if (callback) {
	        historicalRadio.onchange = function () {
	          callback('historical');
	        };
	      }
	
	      var historicalLabel = document.createElement('label');
	      historicalLabel.classList.add('controls-views-label');
	      historicalLabel.htmlFor = 'controls-views-historical';
	      historicalLabel.innerHTML = 'Historical';
	
	      historicalWrap.appendChild(historicalRadio);
	      historicalWrap.appendChild(historicalLabel);
	      viewsWrap.appendChild(historicalWrap);
	
	      this.addNewControlsSection(viewsWrap);
	    }
	  }, {
	    key: 'addNewControlsSection',
	    value: function addNewControlsSection(content) {
	      var newControlsSection = document.createElement('div');
	      newControlsSection.classList.add('controls-section');
	      newControlsSection.appendChild(content);
	      this.controlsWrap.appendChild(newControlsSection);
	    }
	  }]);
	
	  return Controls;
	}();
	
	exports.default = Controls;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-fast.js": 41,
		"./next/_timings-fast.js": 42
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 40;


/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 0.2
	}, {
	  NAME: 'forehead',
	  DURATION: 0.2
	}, {
	  NAME: 'eyes',
	  DURATION: 0.2
	}, {
	  NAME: 'ears',
	  DURATION: 0.2
	}, {
	  NAME: 'nose',
	  DURATION: 0.2
	}, {
	  NAME: 'mouth',
	  DURATION: 0.2
	}, {
	  NAME: 'chin',
	  DURATION: 0.2
	}, {
	  NAME: 'emotion',
	  DURATION: 0.2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 0.2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 0.3
	}, {
	  NAME: 'emotion',
	  DURATION: 0.2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 4
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 4
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];

/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 0.2
	}, {
	  NAME: 'forehead',
	  DURATION: 0.2
	}, {
	  NAME: 'eyes',
	  DURATION: 0.2
	}, {
	  NAME: 'ears',
	  DURATION: 0.2
	}, {
	  NAME: 'nose',
	  DURATION: 0.2
	}, {
	  NAME: 'mouth',
	  DURATION: 0.2
	}, {
	  NAME: 'chin',
	  DURATION: 0.2
	}, {
	  NAME: 'emotion',
	  DURATION: 0.2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 0.2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 0.3
	}, {
	  NAME: 'emotion',
	  DURATION: 0.2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 1
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 1
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 1
	}, {
	  NAME: 'chrome',
	  DURATION: 1
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 1
	}, {
	  NAME: 'pause',
	  DURATION: 0.5
	}, {
	  NAME: 'chrome',
	  DURATION: 0.2
	}];

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-finalOnly.js": 44,
		"./next/_timings-finalOnly.js": 45
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 43;


/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 0
	}, {
	  NAME: 'chrome',
	  DURATION: 0
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 0
	}, {
	  NAME: 'chrome',
	  DURATION: 0
	}];

/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 0
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 0
	}, {
	  NAME: 'chrome',
	  DURATION: 0
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 0
	}, {
	  NAME: 'pause',
	  DURATION: 0
	}, {
	  NAME: 'chrome',
	  DURATION: 0
	}];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-noFace.js": 47,
		"./next/_timings-noFace.js": 48
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 46;


/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 2
	}, {
	  NAME: 'chrome',
	  DURATION: 1
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 2
	}, {
	  NAME: 'chrome',
	  DURATION: 1
	}];

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 1
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 3
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 1
	}, {
	  NAME: 'pause',
	  DURATION: 0.5
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-noAura.js": 50,
		"./next/_timings-noAura.js": 51
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 49;


/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [];

/***/ },
/* 51 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [];

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-noChrome.js": 53,
		"./next/_timings-noChrome.js": 54
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 52;


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 4
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 4
	}];

/***/ },
/* 54 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 1
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 3
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 1
	}, {
	  NAME: 'pause',
	  DURATION: 0.5
	}];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings-finalOnlyNoChrome.js": 56,
		"./next/_timings-finalOnlyNoChrome.js": 57
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 55;


/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 0
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 0
	}];

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 0
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 0
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 0
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 0
	}];

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./horizon/_timings.js": 59,
		"./next/_timings.js": 60
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 58;


/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 2
	}, {
	  NAME: 'chrome',
	  DURATION: 1
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 2
	}, {
	  NAME: 'animateInHaloMulti',
	  DURATION: 2
	}, {
	  NAME: 'chrome',
	  DURATION: 1
	}];

/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';
	
	// All times are in seconds
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var STATES_INIT_FACE = exports.STATES_INIT_FACE = [{
	  NAME: 'flash',
	  DURATION: 0.5
	}, {
	  NAME: 'analyze',
	  DURATION: 1
	}];
	
	var STATES_FINAL_FACE = exports.STATES_FINAL_FACE = [{
	  NAME: 'zoomOut',
	  DURATION: 0.5
	}, {
	  NAME: 'complete',
	  DURATION: 0.2
	}];
	
	// times are in seconds.
	var STATES_SINGLE_FACE = exports.STATES_SINGLE_FACE = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'forehead',
	  DURATION: 2
	}, {
	  NAME: 'eyes',
	  DURATION: 2
	}, {
	  NAME: 'ears',
	  DURATION: 2
	}, {
	  NAME: 'nose',
	  DURATION: 2
	}, {
	  NAME: 'mouth',
	  DURATION: 2
	}, {
	  NAME: 'chin',
	  DURATION: 2
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_MULTIPLE_FACES = exports.STATES_MULTIPLE_FACES = [{
	  NAME: 'zoom',
	  DURATION: 0.5
	}, {
	  NAME: 'face',
	  DURATION: 2
	}, {
	  NAME: 'allFeatures',
	  DURATION: 5
	}, {
	  NAME: 'emotion',
	  DURATION: 2
	}];
	
	var STATES_AURA_SINGLE = exports.STATES_AURA_SINGLE = [{
	  NAME: 'animateInBackground',
	  DURATION: 1
	}, {
	  NAME: 'animateInVignette',
	  DURATION: 2
	}, {
	  NAME: 'animateInHalo',
	  DURATION: 3
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];
	
	var STATES_AURA_MULTIPLE = exports.STATES_AURA_MULTIPLE = [{
	  NAME: 'animateInMultiAura',
	  DURATION: 1
	}, {
	  NAME: 'pause',
	  DURATION: 0.5
	}, {
	  NAME: 'chrome',
	  DURATION: 2
	}];

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(62);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(64)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/sass-loader/index.js?sourceMap!./main.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/sass-loader/index.js?sourceMap!./main.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(63)();
	// imports
	
	
	// module
	exports.push([module.id, "#main {\n  transform-origin: 0% 0%; }\n\n#main, #latest, #historical {\n  width: 3240px;\n  height: 1823px;\n  overflow: hidden; }\n  #main.single, #latest.single, #historical.single {\n    min-width: 2048px;\n    width: 2048px;\n    height: 1280px; }\n    #main.single .third, #latest.single .third, #historical.single .third {\n      width: 2048px; }\n    #main.single .image, #latest.single .image, #historical.single .image {\n      height: 1280px; }\n    #main.single .image-canvas, #latest.single .image-canvas, #historical.single .image-canvas {\n      height: 1280px;\n      width: 2048px; }\n\n#latest, #historical {\n  cursor: none; }\n\nbody, html {\n  height: 100%; }\n  body::-webkit-scrollbar, html::-webkit-scrollbar {\n    width: 0 !important; }\n\nbody {\n  font-family: \"Roboto Mono\", \"Roboto\", sans-serif;\n  margin: 0;\n  background-color: #D7D7D7;\n  font-size: 16px; }\n\n#historical {\n  font-size: 0;\n  min-width: 3240px; }\n\n.show-latest #historical {\n  display: none; }\n\n.show-historical #latest {\n  display: none; }\n\n.controls {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  height: 3rem;\n  width: 100%;\n  background-color: rgba(250, 250, 250, 0.3);\n  border-top: solid 1px #aaa;\n  box-sizing: border-box;\n  padding: .5rem 1rem; }\n\n.controls-section {\n  display: inline-block;\n  border-right: solid 1px #ccc;\n  margin-right: 1rem;\n  padding-right: 1rem; }\n\n.controls-button {\n  -webkit-appearance: none;\n  font-family: \"Roboto Mono\", \"Roboto\", sans-serif;\n  border: 0;\n  height: 2rem;\n  height: 2rem;\n  box-sizing: border-box;\n  padding: 0 1rem;\n  color: #333;\n  background-color: #b3cee3;\n  cursor: pointer; }\n  .controls-button:not(:last-child) {\n    margin-right: 1rem; }\n  .controls-button:focus {\n    outline: none;\n    background-color: #69aadc; }\n  .controls-button:disabled {\n    background-color: #ccc;\n    opacity: .6;\n    cursor: default; }\n\n.controls-radio-wrap {\n  display: inline-block; }\n  .controls-radio-wrap:not(:first-child) {\n    margin-left: 1rem; }\n\n.controls-views-choice {\n  display: none; }\n  .controls-views-choice + .controls-views-label {\n    cursor: pointer;\n    background-color: #b3cee3; }\n    .controls-views-choice + .controls-views-label:hover, .controls-views-choice + .controls-views-label:focus {\n      background-color: #69aadc; }\n    .controls-views-choice + .controls-views-label::before {\n      content: 'View '; }\n    .controls-views-choice + .controls-views-label::after {\n      content: '?'; }\n  .controls-views-choice:checked + .controls-views-label {\n    cursor: default;\n    background-color: transparent; }\n    .controls-views-choice:checked + .controls-views-label:hover, .controls-views-choice:checked + .controls-views-label:focus {\n      background-color: transparent; }\n    .controls-views-choice:checked + .controls-views-label::before {\n      content: 'Now Viewing '; }\n    .controls-views-choice:checked + .controls-views-label::after {\n      content: ''; }\n\n.controls-views-label {\n  padding: 0 1em;\n  color: #333;\n  height: 2rem;\n  font-size: .75rem;\n  display: inline-block;\n  line-height: 2rem; }\n\n.third {\n  display: inline-block;\n  position: relative;\n  margin: 0;\n  width: 1080px;\n  height: 1823px;\n  background-color: white;\n  vertical-align: top; }\n  .third:not(:last-child) {\n    margin-right: 0px; }\n  .third:not(:first-child) {\n    margin-left: 0px; }\n\n.image {\n  height: 640px;\n  background-color: #D4E2E5; }\n\n.image-canvas {\n  width: 1080px;\n  height: 640px; }\n\n.json {\n  height: 1183px;\n  background-color: #232E35;\n  overflow: hidden;\n  padding: 63px 100px;\n  box-sizing: border-box;\n  position: relative; }\n\n.json-text {\n  color: #91969A;\n  font-size: 29px;\n  font-family: \"Roboto Mono\", monospace;\n  max-width: 100%;\n  word-break: break-word; }\n  .json-text_long {\n    font-size: 16px; }\n\n.json-text-em {\n  color: #fff; }\n  .json-text-em_joy {\n    color: #FFD600; }\n  .json-text-em_sorrow {\n    color: #2196F3; }\n  .json-text-em_anger {\n    color: #f44336; }\n  .json-text-em_surprise {\n    color: #AB47BC; }\n\n.json-title {\n  color: #fff;\n  font-weight: normal;\n  line-height: 1em;\n  margin: 0 0 1em 0;\n  font-size: 20px;\n  letter-spacing: 2px;\n  font-family: \"Roboto Light\", \"Roboto\", sans-serif; }\n\n.scrim {\n  background-color: #232E35;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0; }\n\n.threeup-wrap {\n  width: 1080px;\n  height: 607.66667px;\n  display: inline-block; }\n  .threeup-wrap:nth-child(1) .threeup-hero {\n    transform-origin: 0px 0px; }\n  .threeup-wrap:nth-child(2) .threeup-hero {\n    transform-origin: 1620px 0px; }\n  .threeup-wrap:nth-child(3) .threeup-hero {\n    transform-origin: 3240px 0px; }\n  .threeup-wrap:nth-child(4) .threeup-hero {\n    transform-origin: 0px 911.5px; }\n  .threeup-wrap:nth-child(5) .threeup-hero {\n    transform-origin: 1620px 911.5px; }\n  .threeup-wrap:nth-child(6) .threeup-hero {\n    transform-origin: 3240px 911.5px; }\n  .threeup-wrap:nth-child(7) .threeup-hero {\n    transform-origin: 0px 1823px; }\n  .threeup-wrap:nth-child(8) .threeup-hero {\n    transform-origin: 1620px 1823px; }\n  .threeup-wrap:nth-child(9) .threeup-hero {\n    transform-origin: 3240px 1823px; }\n  .threeup-wrap:nth-child(10) .threeup-hero {\n    transform-origin: 0px 2734.5px; }\n  .threeup-wrap:nth-child(3n-2) {\n    margin-right: 0px; }\n  .threeup-wrap:nth-child(3n-1) {\n    margin-left: 0px;\n    margin-right: 0px; }\n  .threeup-wrap:nth-child(3n) {\n    margin-left: 0px; }\n\n.threeup {\n  width: 1080px;\n  height: 607.66667px;\n  background-size: cover;\n  background-position: top left;\n  box-sizing: border-box; }\n\n.threeup-hero {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 3240px;\n  height: 1823px;\n  transform: scale(0.33333);\n  display: inline-block;\n  background-size: cover;\n  background-position: top left;\n  transition-property: transform;\n  transition-duration: 2s;\n  transform-origin: 0 0;\n  backface-visibility: hidden; }\n\n.threeup-hero-active {\n  transform: none; }\n", "", {"version":3,"sources":["/./ui/ui/styles/_base.scss","/./ui/ui/styles/_variables.scss","/./ui/ui/styles/_colors.scss","/./ui/ui/styles/_controls.scss","/./ui/ui/styles/_third.scss","/./ui/ui/styles/_image.scss","/./ui/ui/styles/_json.scss","/./ui/ui/styles/_threeup.scss"],"names":[],"mappings":"AAAA;EACE,wBAAwB,EACzB;;AAED;EACE,cAAmB;EACnB,eCFmB;EDGnB,iBAAiB,EAiBlB;EApBD;IAMI,kBAAuB;IACvB,cAAmB;IACnB,eAAqB,EAWtB;IAnBH;MAUM,cAAmB,EACpB;IAXL;MAaM,eAAqB,EACtB;IAdL;MAgBM,eAAqB;MACrB,cAAmB,EACpB;;AAIL;EACE,aAAa,EACd;;AAED;EACE,aAAa,EAId;EALD;IAGI,oBAAoB,EACrB;;AAGH;EACE,iDCtCyC;EDuCzC,UAAU;EACV,0BExCkB;EFyClB,gBAAgB,EACjB;;AAED;EACE,aAAa;EACb,kBAAuB,EACxB;;AAED;EAEI,cAAc,EACf;;AAGH;EAEI,cAAc,EACf;;AG1DH;EACE,gBAAgB;EAChB,UAAU;EACV,QAAQ;EACR,aAAa;EACb,YAAY;EACZ,2CAAsB;EACtB,2BAA2B;EAC3B,uBAAuB;EACvB,oBAAoB,EACrB;;AAED;EACE,sBAAsB;EACtB,6BAA6B;EAC7B,mBAAmB;EACnB,oBAAoB,EACrB;;AAED;EACE,yBAAyB;EACzB,iDFrByC;EEsBzC,UAAU;EACV,aAAa;EACb,aAAa;EACb,uBAAuB;EACvB,gBAAgB;EAChB,YAAY;EACZ,0BAA0B;EAC1B,gBAAgB,EAajB;EAvBD;IAYI,mBAAmB,EACpB;EAbH;IAeI,cAAc;IACd,0BAA0B,EAC3B;EAjBH;IAmBI,uBAAuB;IACvB,YAAY;IACZ,gBAAgB,EACjB;;AAGH;EACE,sBAAsB,EAIvB;EALD;IAGI,kBAAkB,EACnB;;AAGH;EACE,cAAc,EA2Bf;EA5BD;IAGI,gBAAgB;IAChB,0BAA0B,EAU3B;IAdH;MAMM,0BAA0B,EAC3B;IAPL;MASM,iBAAiB,EAClB;IAVL;MAYM,aAAa,EACd;EAbL;IAgBI,gBAAgB;IAChB,8BAA8B,EAU/B;IA3BH;MAmBM,8BAA8B,EAC/B;IApBL;MAsBM,wBAAwB,EACzB;IAvBL;MAyBM,YAAY,EACb;;AAIL;EACE,eAAe;EACf,YAAY;EACZ,aAAa;EACb,kBAAkB;EAClB,sBAAsB;EACtB,kBAAkB,EACnB;;ACxFD;EACE,sBAAsB;EACtB,mBAAmB;EACnB,UAAU;EACV,cHDkB;EGElB,eHDmB;EGEnB,wBAAwB;EACxB,oBAAoB,EAOrB;EAdD;IASI,kBHFO,EGGR;EAVH;IAYI,iBHLO,EGMR;;ACbH;EACE,cJSkB;EIRlB,0BAA0B,EAC3B;;AAED;EACE,cJHkB;EIIlB,cJGkB,EIFnB;;ACRD;EACE,eLUyB;EKTzB,0BJDe;EIEf,iBAAiB;EACjB,oBAAoB;EACpB,uBAAuB;EACvB,mBAAmB,EACpB;;AAED;EACE,eJPiB;EIQjB,gBAAgB;EAChB,sCAAsC;EACtC,gBAAgB;EAChB,uBAAuB,EAKxB;EAVD;IAQI,gBAAgB,EACjB;;AAGH;EACE,YJlBY,EImCb;EAlBD;IAII,eJnBc,EIoBf;EALH;IAQI,eJtBiB,EIuBlB;EATH;IAYI,eJzBgB,EI0BjB;EAbH;IAgBI,eJ5BmB,EI6BpB;;AAGH;EACE,YJtCY;EIuCZ,oBAAoB;EACpB,iBAAiB;EACjB,kBAAkB;EAClB,gBAAgB;EAChB,oBAAoB;EACpB,kDACD,EAAC;;AAEF;EACE,0BJnDe;EIoDf,YAAY;EACZ,aAAa;EACb,mBAAmB;EACnB,QAAQ;EACR,OAAO,EACR;;AC1DD;EACE,cNEkB;EMDlB,oBNG4B;EMF5B,sBAAsB,EAqBvB;EAxBD;IAUQ,0BAAuH,EACxH;EAXP;IAUQ,6BAAuH,EACxH;EAXP;IAUQ,6BAAuH,EACxH;EAXP;IAUQ,8BAAuH,EACxH;EAXP;IAUQ,iCAAuH,EACxH;EAXP;IAUQ,iCAAuH,EACxH;EAXP;IAUQ,6BAAuH,EACxH;EAXP;IAUQ,gCAAuH,EACxH;EAXP;IAUQ,gCAAuH,EACxH;EAXP;IAUQ,+BAAuH,EACxH;EAXP;IAeI,kBNPY,EMQb;EAhBH;IAkBI,iBNVY;IMWZ,kBNXY,EMYb;EApBH;IAsBI,iBNdY,EMeb;;AAGH;EACE,cNxBkB;EMyBlB,oBNvB4B;EMwB5B,uBAAuB;EACvB,8BAA8B;EAC9B,uBAAuB,EACxB;;AAED;EACE,mBAAmB;EACnB,OAAO;EACP,QAAQ;EACR,cAAmB;EACnB,eAAsB;EACtB,0BAAgB;EAChB,sBAAsB;EACtB,uBAAuB;EACvB,8BAA8B;EAC9B,+BAA+B;EAC/B,wBAAwB;EACxB,sBAAsB;EACtB,4BAA4B,EAC7B;;AAED;EACE,gBAAgB,EACjB","file":"main.scss","sourcesContent":["#main {\n  transform-origin: 0% 0%;\n}\n\n#main, #latest, #historical {\n  width: $third-width * 3 + $bezel * 4;\n  height: $third-height;\n  overflow: hidden;\n\n  &.single {\n    min-width: $third-width * 2 - 112px;\n    width: $third-width * 2 - 112px;\n    height: $image-height * 2;\n    .third {\n      width: $third-width * 2 - 112px;\n    }\n    .image {\n      height: $image-height * 2;\n    }\n    .image-canvas {\n      height: $image-height * 2;\n      width: $third-width * 2 - 112px;\n    }\n  }\n}\n\n#latest, #historical {\n  cursor: none;\n}\n\nbody, html {\n  height: 100%;\n  &::-webkit-scrollbar {\n    width: 0 !important;\n  }\n}\n\nbody {\n  font-family: $stack;\n  margin: 0;\n  background-color: $bezel-grey;\n  font-size: 16px;\n}\n\n#historical {\n  font-size: 0;\n  min-width: $third-width * 3 + $grid-bezel * 4;\n}\n\n.show-latest {\n  #historical {\n    display: none;\n  }\n}\n\n.show-historical {\n  #latest {\n    display: none;\n  }\n}\n","$stack: \"Roboto Mono\", \"Roboto\", sans-serif;\n\n\n$third-width: 1080px;\n$third-height: 1823px;\n$threeup-height: $third-height / 3;\n\n$bezel: 0px;\n$grid-bezel: 0px;\n\n$image-height: 640px;\n$json-height: $third-height - $image-height;\n","$bezel-grey: #D7D7D7;\n$json-bg: #232E35;\n\n$json-text: #91969A;\n$json-em: #fff;\n\n$json-joy: #FFD600;\n$json-sorrow: #2196F3;\n$json-anger: #f44336;\n$json-surprise: #AB47BC;\n",".controls {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  height: 3rem;\n  width: 100%;\n  background-color: rgba(250, 250, 250, .3);\n  border-top: solid 1px #aaa;\n  box-sizing: border-box;\n  padding: .5rem 1rem;\n}\n\n.controls-section {\n  display: inline-block;\n  border-right: solid 1px #ccc;\n  margin-right: 1rem;\n  padding-right: 1rem;\n}\n\n.controls-button {\n  -webkit-appearance: none;\n  font-family: $stack;\n  border: 0;\n  height: 2rem;\n  height: 2rem;\n  box-sizing: border-box;\n  padding: 0 1rem;\n  color: #333;\n  background-color: #b3cee3;\n  cursor: pointer;\n  &:not(:last-child) {\n    margin-right: 1rem;\n  }\n  &:focus {\n    outline: none;\n    background-color: #69aadc;\n  }\n  &:disabled {\n    background-color: #ccc;\n    opacity: .6;\n    cursor: default;\n  }\n}\n\n.controls-radio-wrap {\n  display: inline-block;\n  &:not(:first-child) {\n    margin-left: 1rem;\n  }\n}\n\n.controls-views-choice {\n  display: none;\n  + .controls-views-label {\n    cursor: pointer;\n    background-color: #b3cee3;\n    &:hover, &:focus {\n      background-color: #69aadc;\n    }\n    &::before {\n      content: 'View ';\n    }\n    &::after {\n      content: '?';\n    }\n  }\n  &:checked + .controls-views-label {\n    cursor: default;\n    background-color: transparent;\n    &:hover, &:focus {\n      background-color: transparent;\n    }\n    &::before {\n      content: 'Now Viewing ';\n    }\n    &::after {\n      content: '';\n    }\n  }\n}\n\n.controls-views-label {\n  padding: 0 1em;\n  color: #333;\n  height: 2rem;\n  font-size: .75rem;\n  display: inline-block;\n  line-height: 2rem;\n}\n",".third {\n  display: inline-block;\n  position: relative;\n  margin: 0;\n  width: $third-width;\n  height: $third-height;\n  background-color: white;\n  vertical-align: top;\n  &:not(:last-child) {\n    margin-right: $bezel;\n  }\n  &:not(:first-child) {\n    margin-left: $bezel;\n  }\n}\n",".image {\n  height: $image-height;\n  background-color: #D4E2E5;\n}\n\n.image-canvas {\n  width: $third-width;\n  height: $image-height;\n}\n",".json {\n  height: $json-height;\n  background-color: $json-bg;\n  overflow: hidden;\n  padding: 63px 100px;\n  box-sizing: border-box;\n  position: relative;\n}\n\n.json-text {\n  color: $json-text;\n  font-size: 29px;\n  font-family: \"Roboto Mono\", monospace;\n  max-width: 100%;\n  word-break: break-word;\n\n  &_long {\n    font-size: 16px;\n  }\n}\n\n.json-text-em {\n  color: $json-em;\n\n  &_joy {\n    color: $json-joy;\n  }\n\n  &_sorrow {\n    color: $json-sorrow;\n  }\n\n  &_anger {\n    color: $json-anger;\n  }\n\n  &_surprise {\n    color: $json-surprise;\n  }\n}\n\n.json-title {\n  color: $json-em;\n  font-weight: normal;\n  line-height: 1em;\n  margin: 0 0 1em 0;\n  font-size: 20px;\n  letter-spacing: 2px;\n  font-family: \"Roboto Light\", \"Roboto\", sans-serif\n}\n\n.scrim {\n  background-color: $json-bg;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n",".threeup-wrap {\n  width: $third-width;\n  height: $threeup-height;\n  display: inline-block;\n\n  @for $i from 0 through 9 {\n    $col: $i % 3;\n    $row: floor(( 9 - (9 - $i)) / 3);\n    &:nth-child(#{ $i + 1}) {\n      .threeup-hero {\n        transform-origin: #{ $third-width * ( $col * 1.5 ) + ( $col * $grid-bezel * 2 ) } #{ $threeup-height * ( $row * 1.5 ) };\n      }\n    }\n  }\n  &:nth-child(3n-2) {\n    margin-right: $grid-bezel;\n  }\n  &:nth-child(3n-1) {\n    margin-left: $grid-bezel;\n    margin-right: $grid-bezel;\n  }\n  &:nth-child(3n) {\n    margin-left: $grid-bezel;\n  }\n}\n\n.threeup {\n  width: $third-width;\n  height: $threeup-height;\n  background-size: cover;\n  background-position: top left;\n  box-sizing: border-box;\n}\n\n.threeup-hero {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: $third-width * 3 + $grid-bezel * 4;\n  height: (($third-width * 3 + $grid-bezel * 4) / ($third-width * 3)) * $third-height;\n  transform: scale(0.33333333);\n  display: inline-block;\n  background-size: cover;\n  background-position: top left;\n  transition-property: transform;\n  transition-duration: 2s;\n  transform-origin: 0 0;\n  backface-visibility: hidden;\n}\n\n.threeup-hero-active {\n  transform: none;\n}\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 63 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map