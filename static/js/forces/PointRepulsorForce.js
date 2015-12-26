var PMath = Particulate.Math;
App.PointRepulsorForce = PointRepulsorForce;

function PointRepulsorForce(position, opts) {
  opts = opts || {};
  Particulate.Force.apply(this, arguments);

  this.position = this.vector;
  this.intensity = opts.intensity != null ? opts.intensity : 0.05;
  this.setRadius(opts.radius || 0);
}

PointRepulsorForce.create = Particulate.ctor(PointRepulsorForce);
PointRepulsorForce.prototype = Object.create(Particulate.Force.prototype);
PointRepulsorForce.prototype.constructor = PointRepulsorForce;

PointRepulsorForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointRepulsorForce.prototype.applyForce = function (ix, f0, p0, p1) {
  var v0 = this.vector;
  var iy = ix + 1;
  var iz = ix + 2;

  var dx = p0[ix] - v0[0];
  var dy = p0[iy] - v0[1];
  var dz = p0[iz] - v0[2];

  var dist = dx * dx + dy * dy + dz * dz;
  var diff = PMath.clamp(0.001, 100,
    dist - this._radius2 * this.intensity);
  var diffInv = 1 / diff;
  var scale = PMath.clamp(0, 10,
    diffInv * diffInv * diffInv);

  f0[ix] += dx * scale;
  f0[iy] += dy * scale;
  f0[iz] += dz * scale;
};
