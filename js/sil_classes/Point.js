var x, y;

Point.prototype.translate = function(x, y) {
  return new Point(this.x + x, this.y + y);
}
Point.prototype.polar = function(len, angle) {
  return new Point(len*Math.cos(angle), len*Math.sin(angle));
}
function Point(x, y) {
  this.x = x;
  this.y = y;
}
