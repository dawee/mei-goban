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

};

Stone.prototype.draw = function () {
  this.conf.stoneRay = parseInt(this.conf.intersectionWidth * 0.98 / 2, 10);

  this.x = this.conf.border + this.conf.intersectionWidth * this.col;
  this.y = this.conf.border + this.conf.intersectionWidth * this.row;

  this.drawBase();
};
