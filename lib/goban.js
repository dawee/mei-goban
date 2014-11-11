var Goban = module.exports = function (opts) {
  opts = opts || {};

  this.conf = {};
  this.conf.width = opts.width || 500;
  this.conf.height = opts.height || 500;
  this.conf.size = opts.size || 19;
  this.conf.border = opts.border || 10;

  this.el = document.createElement('canvas');
  this.el.setAttribute('width', this.conf.width);
  this.el.setAttribute('height', this.conf.height);
  this.ctx = this.el.getContext('2d');
  this.ctx.save();
  this.draw();
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
