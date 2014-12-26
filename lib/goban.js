'use strict';

/*
 * Module dependencies
 */

var debounce = require('debounce');
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

  this.setFocus = debounce(this.setFocus, 1000, true);
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

  this.focus = {row: row, col: col, blinking: true};  
  this.draw(true);

  setTimeout(function () {
    that.focus.blinking = false;
    that.draw(true);
  }, this.conf.focusTime);

  setTimeout(function () {
    that.focus.blinking = true;
    that.draw(true);
  }, this.conf.focusTime * 2);

  setTimeout(function () {
    that.focus = null;
    that.draw(true);
  }, this.conf.focusTime * 3);
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

  if (!!this.focus && this.focus.row === index && this.focus.blinking) {
    this.ctx.strokeStyle = this.conf.focusColor;
  } else {
    this.ctx.strokeStyle = this.conf.boardColor;
  
    if (!!this.focus) this.ctx.globalAlpha = this.conf.focusContrast;
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
  
  if (!!this.focus && this.focus.col === index && this.focus.blinking) {
    this.ctx.strokeStyle = this.conf.focusColor;
  } else  {
    this.ctx.strokeStyle = this.conf.boardColor;

    if (!!this.focus) this.ctx.globalAlpha = this.conf.focusContrast;
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
