var MicroEvent = require('microevent');
var Stone = require('./stone');


var triggers = {};

triggers.height = triggers.width = function (val) {
  this.conf.width = val;
  this.conf.height = val;

  this.el.setAttribute('width', val);
  this.el.setAttribute('height', val);

  this.conf.curleft = 0;
  this.conf.curtop = 0;

  var element = this.el;

  while (element) {
      this.conf.curleft += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      this.conf.curtop += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
  }

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
  this.forwardEvent('mouseenter');
  this.forwardEvent('mouseleave');
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

    x -= that.conf.curleft;
    y -= that.conf.curtop;

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

Goban.prototype.setStoneProperty = function (row, col, key, val) {
  if (!!this.stones[row + ':' + col]) {
    this.stones[row + ':' + col].set(key, val);
    this.draw();
  }
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
