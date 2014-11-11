!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Goban=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/goban');
},{"./lib/goban":2}],2:[function(require,module,exports){

var triggers = {};

triggers.height = triggers.width = function (val) {
  this.conf.width = val;
  this.conf.height = val;

  this.el.setAttribute('width', val);
  this.el.setAttribute('height', val);
  this.draw();
};

triggers.size = function (val) {
  this.draw();
};

var Goban = module.exports = function (opts) {
  opts = opts || {};
  this.conf = {};

  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');

  this.set('width', opts.width || 500);
  this.set('height', opts.height || 500);
  this.set('size', opts.size || 19);
  this.set('border', opts.border || 10);

  this.ctx.save();
  this.draw();
};

Goban.prototype.set = function (key, val) {
  if (this.conf[key] === val) return;
  this.conf[key] = val;
  if (key in triggers) triggers[key].apply(this, [val]);
};

Goban.prototype.drawHorizontalLine = function (index) {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var y = this.conf.border + parseInt(boardHeight * index / (this.conf.size - 1), 10);

  this.ctx.beginPath();
  this.ctx.moveTo(this.conf.border, y);
  this.ctx.lineTo(boardWidth + this.conf.border, y);
  this.ctx.stroke();
};

Goban.prototype.drawVerticalLine = function (index) {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var x = this.conf.border + parseInt(boardWidth * index / (this.conf.size - 1), 10);

  this.ctx.beginPath();
  this.ctx.moveTo(x, this.conf.border);
  this.ctx.lineTo(x, boardHeight + this.conf.border);
  this.ctx.stroke();
};

Goban.prototype.drawlines = function () {
  var index = 0;

  for (index = 0; index < this.conf.size; index++) {
    this.drawHorizontalLine(index);
    this.drawVerticalLine(index);
  }
};

Goban.prototype.draw = function () {
  this.ctx.restore();
  this.drawlines();
};

},{}]},{},[1])(1)
});