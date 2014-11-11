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

  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');

  this.set('width', opts.width || 500);
  this.set('height', opts.height || 500);
  this.set('size', opts.size || 19);
  this.set('border', opts.border || 10);
  this.set('boardColor', opts.boardColor || '#333');
  this.set('blackStoneColor', opts.blackStoneColor || '#27160f');
  this.set('whiteStoneColor', opts.whiteStoneColor || '#f9f2ef');

  this.draw();
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
  stone.draw();
};

Goban.prototype.removeStone = function (row, col) {
  this.stones[row + ':' + col] = null;
  this.draw();
};

Goban.prototype.drawHorizontalLine = function (index) {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var y = this.conf.border + parseInt(boardHeight * index / (this.conf.size - 1), 10);

  this.ctx.beginPath();
  this.ctx.moveTo(this.conf.border, y);
  this.ctx.lineTo(boardWidth + this.conf.border, y);
  this.ctx.strokeStyle = this.conf.boardColor;
  this.ctx.stroke();
};

Goban.prototype.drawVerticalLine = function (index) {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var x = this.conf.border + parseInt(boardWidth * index / (this.conf.size - 1), 10);

  this.ctx.beginPath();
  this.ctx.moveTo(x, this.conf.border);
  this.ctx.lineTo(x, boardHeight + this.conf.border);
  this.ctx.strokeStyle = this.conf.boardColor;
  this.ctx.stroke();
};

Goban.prototype.drawHoshiAt = function (row, col) {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var x = this.conf.border + parseInt(boardWidth * col / (this.conf.size - 1), 10);
  var y = this.conf.border + parseInt(boardHeight * row / (this.conf.size - 1), 10);

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
  this.ctx.clearRect(0, 0, this.conf.width, this.conf.height);
  this.drawlines();
  this.drawHoshis();
  this.drawStones();
};
