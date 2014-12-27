!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Goban=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/goban');
},{"./lib/goban":2}],2:[function(require,module,exports){
'use strict';

/*
 * Module dependencies
 */

var Stone = require('./stone');


/*
 * Triggers
 *
 * Called after each 'set'
 */

var triggers = {};


/* height trigger setup DOM element */

triggers.height = triggers.width = function (val) {
  this.conf.width = val;
  this.conf.height = val;

  this.el.setAttribute('width', val);
  this.el.setAttribute('height', val);
  this.draw();
};

/* size trigger check value in [9,13,19] and redraw */

triggers.size = function (val) {
  if ([19, 13, 9].indexOf(val) < 0) return;

  this.conf.size = val;
  this.draw();
};

/*
 * Goban constructor
 */

var Goban = module.exports = function (opts) {
  opts = opts || {};
  this.conf = {};
  this.stones = {};

  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');

  this.set('width', opts.width || 500);
  this.set('height', opts.height || 500);
  this.set('size', opts.size || 19);
  this.set('boardColor', opts.boardColor || '#63605e');
  this.set('focusColor', opts.focusColor || '#d34656');
  this.set('focusContrast', opts.focusColor || 0.3);
  this.set('focusTime', opts.focusTime || 200);
  this.set('blackStoneColor', opts.blackStoneColor || '#27160f');
  this.set('whiteStoneColor', opts.whiteStoneColor || '#f9f2ef');
  this.set('blackStoneLight', opts.blackStoneLight || 0.1);
  this.set('whiteStoneLight', opts.whiteStoneLight || 0.4);

  this.forwardEvent('mousedown');
  this.forwardEvent('mousemove');
  this.forwardEvent('mouseup');
  this.forwardEvent('click');

  this.drawEnabled  = true;
  this.draw();
};

/* Bind custom event via element emitter */

Goban.prototype.on = function (name, callback) {
  this.el.addEventListener(name, callback);
};

/* Forward all mouse events with row/col values */

Goban.prototype.forwardEvent = function (name) {
  var that = this;

  this.el.addEventListener(name, function (evt) {
    var x;
    var y;
    var eventName;
    var event;
    var rect = that.el.getBoundingClientRect();


    if (evt.pageX || evt.pageY) { 
      x = evt.pageX;
      y = evt.pageY;
    }
    else { 
      x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 

    x -= rect.left;
    y -= rect.top;
    event = new CustomEvent('intersection:' + name);
    event.row = parseInt(Math.round((y - that.conf.border) / that.conf.intersectionWidth), 10);
    event.col = parseInt(Math.round((x - that.conf.border) / that.conf.intersectionWidth), 10);
    eventName = name + ':' + event.row + ':' + event.col;
 
    if (that.lastEvent !== eventName) {
      that.el.dispatchEvent(event);
      that.lastEvent = eventName;
    }
  });
};

/* Setup a property value */

Goban.prototype.set = function (key, val) {
  if (this.conf[key] === val) return;

  this.drawEnabled  = true;

  if (key in triggers) {
    triggers[key].apply(this, [val]);
  } else {
    this.conf[key] = val;
  }
};

Goban.prototype.setFocus = function (row, col) {
  var that = this;

  if (!!this.conf.focus) return;

  this.conf.focus = {row: row, col: col, blinking: false};  
  this.draw(true);

  setTimeout(function () {
    that.conf.focus.blinking = true;
    that.draw(true);
  }, this.conf.focusTime * 2);

  setTimeout(function () {
    that.conf.focus.blinking = false;
    that.draw(true);
  }, this.conf.focusTime * 3);

  setTimeout(function () {
    that.conf.focus.blinking = true;
    that.draw(true);
  }, this.conf.focusTime * 4);

  setTimeout(function () {
    that.conf.focus = null;
    that.draw(true);
  }, this.conf.focusTime * 6);
};

/* Set maximum possible width to fit in parent and still be squared */

Goban.prototype.maximize = function () {
  var area = this.el.parentNode.getBoundingClientRect();
  var width = area.width < area.height ? area.width : area.height;

  this.set('width', width);
};

/* Put a stone on goban and redraw */

Goban.prototype.putStone = function (row, col, color, opts) {
  opts = opts || {};

  var force = 'force' in opts ? opts.force : true;
  var stone = new Stone({
    conf: this.conf,
    ctx: this.ctx,
    row: row,
    col: col,
    color: color
  });

  this.stones[row + ':' + col] = stone;
  this.draw(force);
};

/* Remove a stone from goban and redraw */

Goban.prototype.removeStone = function (row, col, opts) {
  opts = opts || {};

  var force = 'force' in opts ? opts.force : true;

  this.stones[row + ':' + col] = null;
  this.draw(force);
};

/* Setup a stone property */

Goban.prototype.setStoneProperty = function (row, col, key, val) {
  if (!!this.stones[row + ':' + col]) {
    this.stones[row + ':' + col].set(key, val);
    this.draw(true);
  }
};

/* Pixel alignments and pre-calculations for intersections */

Goban.prototype.calcBoardValues = function () {
  this.conf.idealBorder = parseInt(this.conf.width / ((this.conf.size + 1) * 2), 10);
  this.conf.idealBoardWidth = this.conf.width - 2 * this.conf.idealBorder;
  this.conf.intersectionWidth = parseInt(this.conf.idealBoardWidth / (this.conf.size - 1), 10);
  this.conf.boardWidth = this.conf.intersectionWidth * (this.conf.size - 1);
  this.conf.border = parseInt((this.conf.width - this.conf.boardWidth) / 2, 10);
};


/* Draw one horizontal line at index [0...18] */

Goban.prototype.drawHorizontalLine = function (index) {
  var y = this.conf.border + this.conf.intersectionWidth * index;

  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.moveTo(this.conf.border, y);
  this.ctx.lineTo(this.conf.boardWidth + this.conf.border, y);

  if (!!this.conf.focus && this.conf.focus.row === index && this.conf.focus.blinking) {
    this.ctx.strokeStyle = this.conf.focusColor;
  } else {
    this.ctx.strokeStyle = this.conf.boardColor;
  
    if (!!this.conf.focus) this.ctx.globalAlpha = this.conf.focusContrast;
  }

  this.ctx.stroke();
  this.ctx.restore();
};

/* Draw one vertical line at index [0...18] */

Goban.prototype.drawVerticalLine = function (index) {
  var x = this.conf.border + this.conf.intersectionWidth * index;

  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.moveTo(x, this.conf.border);
  this.ctx.lineTo(x, this.conf.boardWidth + this.conf.border);
  
  if (!!this.conf.focus && this.conf.focus.col === index && this.conf.focus.blinking) {
    this.ctx.strokeStyle = this.conf.focusColor;
  } else  {
    this.ctx.strokeStyle = this.conf.boardColor;

    if (!!this.conf.focus) this.ctx.globalAlpha = this.conf.focusContrast;
  }

  this.ctx.stroke();
  this.ctx.restore();
};

/* Draw a hoshi (star) */

Goban.prototype.drawHoshiAt = function (row, col) {
  var x = this.conf.border + this.conf.intersectionWidth * col;
  var y = this.conf.border + this.conf.intersectionWidth * row;

  this.ctx.beginPath();
  this.ctx.arc(x, y, 3, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fillStyle = this.conf.boardColor;
  this.ctx.fill();
};

/* Draw all hoshis (stars) */

Goban.prototype.drawHoshis = function () {
  var gap = (this.conf.size === 9 ? 2 : 3);
  var backGap = this.conf.size - gap - 1;
  var middle = parseInt(Math.floor(this.conf.size / 2.0), 10);

  // Corner hoshis

  this.drawHoshiAt(gap, gap);
  this.drawHoshiAt(gap, backGap);
  this.drawHoshiAt(backGap, backGap);
  this.drawHoshiAt(backGap, gap);

  if (this.conf.size !== 9) {
    this.drawHoshiAt(middle, gap);
    this.drawHoshiAt(gap, middle);
    this.drawHoshiAt(middle, backGap);
    this.drawHoshiAt(backGap, middle);
    this.drawHoshiAt(middle, middle);
  }
};

/* Draw all lines */

Goban.prototype.drawlines = function () {
  var index = 0;

  for (index = 0; index < this.conf.size; index++) {
    this.drawHorizontalLine(index);
    this.drawVerticalLine(index);
  }
};

/* Draw all stones */

Goban.prototype.drawStones = function () {
  var stones = this.stones;

  Object.keys(stones).forEach(function (pos) {
    var stone = stones[pos];
    if (stone !== null) stone.draw();
  });
};

/* Draw cycle : clear, draw lines, hoshis and stones */

Goban.prototype.draw = function (force) {
  if (!force && !this.drawEnabled) return;

  this.calcBoardValues();
  this.ctx.clearRect(0, 0, this.conf.width, this.conf.height);
  this.drawlines();
  this.drawHoshis();
  this.drawStones();

  this.drawEnabled = false;
};

},{"./stone":3}],3:[function(require,module,exports){
'use strict';

/*
 * Stone constructor
 */

var Stone = module.exports = function (opts) {
  this.ctx = opts.ctx;
  this.conf = opts.conf;
  this.row = opts.row;
  this.col = opts.col;
  this.color = opts.color;
  this.opacity = 1;
};

/* Setup a property value */

Stone.prototype.set = function (key, val) {
  this[key] = val;
};

/* Draw the first plain circle */

Stone.prototype.drawBase = function () {
  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.globalAlpha = this.computedOpacity;
  this.ctx.shadowColor   = '#000';
  this.ctx.shadowOffsetX = 2;
  this.ctx.shadowOffsetY = 2;
  this.ctx.shadowBlur    = 2;
  this.ctx.arc(this.x, this.y, this.conf.stoneRay, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fillStyle = this.conf[this.color + 'StoneColor'];
  this.ctx.fill();
  this.ctx.restore();  
};

/* Darken the first circle with another black one */

Stone.prototype.drawShadow = function () {
  this.ctx.save();
  this.ctx.fillStyle = '#000';
  this.ctx.globalAlpha = 0.3 * this.computedOpacity;
  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, this.conf.stoneRay, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};

/* Intersect plain circle with another light circle (-20%,-20%) */

Stone.prototype.drawLight = function () {
  var lightX = parseInt(this.x - 0.2 * this.conf.intersectionWidth, 10);
  var lightY = parseInt(this.y - 0.2 * this.conf.intersectionWidth, 10);

  this.ctx.save();
  this.ctx.fillStyle = '#fff';
  this.ctx.globalAlpha = this.conf[this.color + 'StoneLight'] * this.computedOpacity;
  this.ctx.beginPath();

  this.ctx.arc(this.x, this.y, this.conf.stoneRay, Math.PI - 1.072, 2 * Math.PI - 0.499);
  this.ctx.arc(lightX, lightY, this.conf.stoneRay, 2 * Math.PI - 0.499, Math.PI - 1.072);

  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};

/* Draw a light arc on top left */

Stone.prototype.drawLightLine = function () {
  var lightX = parseInt(this.x - 0.2 * this.conf.intersectionWidth, 10);
  var lightY = parseInt(this.y - 0.2 * this.conf.intersectionWidth, 10);

  this.ctx.save();
  this.ctx.fillStyle = '#fff';
  this.ctx.globalAlpha = this.conf[this.color + 'StoneLight'] * this.computedOpacity;
  this.ctx.beginPath();

  this.ctx.arc(this.x, this.y, this.conf.stoneRay, Math.PI - 1.072, 2 * Math.PI - 0.499);
  this.ctx.arc(this.x + 2, this.y + 2, this.conf.stoneRay - 1, 2 * Math.PI - 0.499, 3 * Math.PI - 1.072, true);

  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};

/* Draw cycle : base, shadow, light, light line */

Stone.prototype.draw = function () {
  this.conf.stoneRay = parseInt(this.conf.intersectionWidth * 0.98 / 2, 10);

  this.x = this.conf.border + this.conf.intersectionWidth * this.col;
  this.y = this.conf.border + this.conf.intersectionWidth * this.row;

  if (!!this.conf.focus && (this.conf.focus.row !== this.row || this.conf.focus.col !== this.col)) {
    this.computedOpacity = this.conf.focusContrast;
  } else {
    this.computedOpacity = this.opacity;
  }

  this.drawBase();
  this.drawShadow();
  this.drawLight();
  this.drawLightLine();
};

},{}]},{},[1])(1)
});