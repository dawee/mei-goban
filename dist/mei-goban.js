!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Goban=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/goban');
},{"./lib/goban":2}],2:[function(require,module,exports){
var MicroEvent = require('microevent');
var Stone = require('./stone');


var triggers = {};

triggers.height = triggers.width = function (val) {
  this.conf.width = val;
  this.conf.height = val;

  this.el.setAttribute('width', val);
  this.el.setAttribute('height', val);
  this.draw();
};

triggers.size = function (val) {
  if ([19, 13, 9].indexOf(val) < 0) return;

  this.conf.size = val;
  this.draw();
};

var Goban = module.exports = function (opts) {
  opts = opts || {};
  this.conf = {};
  this.stones = {};

  this.on = this.bind;
  this.off = this.unbind;

  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');

  this.set('width', opts.width || 500);
  this.set('height', opts.height || 500);
  this.set('size', opts.size || 19);
  this.set('boardColor', opts.boardColor || '#63605e');
  this.set('blackStoneColor', opts.blackStoneColor || '#27160f');
  this.set('whiteStoneColor', opts.whiteStoneColor || '#f9f2ef');
  this.set('blackStoneLight', opts.blackStoneLight || 0.1);
  this.set('whiteStoneLight', opts.whiteStoneLight || 0.4);

  this.forwardEvent('mousedown');
  this.forwardEvent('mouseup');
  this.forwardEvent('click');

  this.draw();
};

MicroEvent.mixin(Goban);

Goban.prototype.forwardEvent = function (name) {
  var that = this;

  this.el.addEventListener(name, function (evt) {
    var x;
    var y;
    var intersection = {};

    if (evt.pageX || evt.pageY) { 
      x = evt.pageX;
      y = evt.pageY;
    }
    else { 
      x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 

    x -= that.el.offsetLeft;
    y -= that.el.offsetTop;

    that.trigger(name, {
      row: parseInt(Math.round((y - that.conf.border) / that.conf.intersectionWidth), 10),
      col: parseInt(Math.round((x - that.conf.border) / that.conf.intersectionWidth), 10)
    })
  });

};

Goban.prototype.set = function (key, val) {
  if (this.conf[key] === val) return;
  if (key in triggers) {
    triggers[key].apply(this, [val]);
  } else {
    this.conf[key] = val;
  }
};

Goban.prototype.putStone = function (row, col, color) {
  var stone = new Stone({
    conf: this.conf,
    ctx: this.ctx,
    row: row,
    col: col,
    color: color
  });

  this.stones[row + ':' + col] = stone;
  this.draw();
};

Goban.prototype.removeStone = function (row, col) {
  this.stones[row + ':' + col] = null;
  this.draw();
};

Goban.prototype.calcBoardValues = function () {
  this.conf.idealBorder = parseInt(this.conf.width / ((this.conf.size + 1) * 2), 10);
  this.conf.idealBoardWidth = this.conf.width - 2 * this.conf.idealBorder;
  this.conf.intersectionWidth = parseInt(this.conf.idealBoardWidth / (this.conf.size - 1), 10);
  this.conf.boardWidth = this.conf.intersectionWidth * (this.conf.size - 1);
  this.conf.border = parseInt((this.conf.width - this.conf.boardWidth) / 2, 10);
};

Goban.prototype.drawHorizontalLine = function (index) {
  var y = this.conf.border + this.conf.intersectionWidth * index;

  this.ctx.beginPath();
  this.ctx.moveTo(this.conf.border, y);
  this.ctx.lineTo(this.conf.boardWidth + this.conf.border, y);
  this.ctx.strokeStyle = this.conf.boardColor;
  this.ctx.stroke();
};

Goban.prototype.drawVerticalLine = function (index) {
  var x = this.conf.border + this.conf.intersectionWidth * index;

  this.ctx.beginPath();
  this.ctx.moveTo(x, this.conf.border);
  this.ctx.lineTo(x, this.conf.boardWidth + this.conf.border);
  this.ctx.strokeStyle = this.conf.boardColor;
  this.ctx.stroke();
};

Goban.prototype.drawHoshiAt = function (row, col) {
  var x = this.conf.border + this.conf.intersectionWidth * col;
  var y = this.conf.border + this.conf.intersectionWidth * row;

  this.ctx.beginPath();
  this.ctx.arc(x, y, 3, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fillStyle = this.conf.boardColor;
  this.ctx.fill();
};

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

Goban.prototype.drawlines = function () {
  var index = 0;

  for (index = 0; index < this.conf.size; index++) {
    this.drawHorizontalLine(index);
    this.drawVerticalLine(index);
  }
};

Goban.prototype.drawStones = function () {
  var stones = this.stones;

  Object.keys(stones).forEach(function (pos) {
    var stone = stones[pos];
    if (stone !== null) stone.draw();
  });
};

Goban.prototype.draw = function () {
  this.calcBoardValues();
  this.ctx.clearRect(0, 0, this.conf.width, this.conf.height);
  this.drawlines();
  this.drawHoshis();
  this.drawStones();
};

},{"./stone":3,"microevent":4}],3:[function(require,module,exports){
var Stone = module.exports = function (opts) {
  this.ctx = opts.ctx;
  this.conf = opts.conf;
  this.row = opts.row;
  this.col = opts.col;
  this.color = opts.color;
};

Stone.prototype.drawBase = function () {
  this.ctx.save();
  this.ctx.beginPath();
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

Stone.prototype.drawShadow = function () {
  this.ctx.save();
  this.ctx.fillStyle = '#000';
  this.ctx.globalAlpha = 0.3;
  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, this.conf.stoneRay, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};

Stone.prototype.drawLight = function () {
  var lightX = parseInt(this.x - 0.2 * this.conf.intersectionWidth, 10);
  var lightY = parseInt(this.y - 0.2 * this.conf.intersectionWidth, 10);

  this.ctx.save();
  this.ctx.fillStyle = '#fff';
  this.ctx.globalAlpha = this.conf[this.color + 'StoneLight'];
  this.ctx.beginPath();

  this.ctx.arc(this.x, this.y, this.conf.stoneRay, Math.PI - 1.072, 2 * Math.PI - 0.499);
  this.ctx.arc(lightX, lightY, this.conf.stoneRay, 2 * Math.PI - 0.499, Math.PI - 1.072, false);

  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};


Stone.prototype.draw = function () {
  this.conf.stoneRay = parseInt(this.conf.intersectionWidth * 0.98 / 2, 10);

  this.x = this.conf.border + this.conf.intersectionWidth * this.col;
  this.y = this.conf.border + this.conf.intersectionWidth * this.row;

  this.drawBase();
  this.drawShadow();
  this.drawLight();
};

},{}],4:[function(require,module,exports){
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent	= function(){}
MicroEvent.prototype	= {
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}

},{}]},{},[1])(1)
});