var Stone = module.exports = function (opts) {
  this.ctx = opts.ctx;
  this.conf = opts.conf;
  this.row = opts.row;
  this.col = opts.col;
  this.color = opts.color;
};

Stone.prototype.draw = function () {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var x = this.conf.border + parseInt(boardWidth * this.col / (this.conf.size - 1), 10);
  var y = this.conf.border + parseInt(boardHeight * this.row / (this.conf.size - 1), 10);

  this.ctx.beginPath();
  this.ctx.arc(x, y, 10, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fillStyle = this.color;
  this.ctx.fill();
};
