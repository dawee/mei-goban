var Stone = module.exports = function (opts) {
  this.ctx = opts.ctx;
  this.conf = opts.conf;
  this.row = opts.row;
  this.col = opts.col;
  this.color = opts.color;
};

Stone.prototype.drawBase = function () {
  var boardHeight = this.conf.height - 2 * this.conf.border;
  var boardWidth = this.conf.width - 2 * this.conf.border;
  var intersectionWidth = parseInt(boardWidth / this.conf.size, 10);
  var stoneRay = parseInt(intersectionWidth * 0.98 / 2, 10)
  var x = this.conf.border + parseInt(boardWidth * this.col / (this.conf.size - 1), 10);
  var y = this.conf.border + parseInt(boardHeight * this.row / (this.conf.size - 1), 10);

  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.shadowColor   = '#000';
  this.ctx.shadowOffsetX = 2;
  this.ctx.shadowOffsetY = 2;
  this.ctx.shadowBlur    = 2;
  this.ctx.arc(x, y, stoneRay, 0, Math.PI * 2, true); 
  this.ctx.closePath();
  this.ctx.fillStyle = this.conf[this.color + 'StoneColor'];
  this.ctx.fill();
  this.ctx.restore();  
}

Stone.prototype.draw = function () {
  this.drawBase();
};
