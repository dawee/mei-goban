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
  this.ctx.globalAlpha = this.opacity;
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
  this.ctx.globalAlpha = 0.3 * this.opacity;
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
  this.ctx.globalAlpha = this.conf[this.color + 'StoneLight'] * this.opacity;
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
  this.ctx.globalAlpha = this.conf[this.color + 'StoneLight'] * this.opacity;
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

  this.drawBase();
  this.drawShadow();
  this.drawLight();
  this.drawLightLine();
};
