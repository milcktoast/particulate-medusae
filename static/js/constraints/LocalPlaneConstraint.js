App.LocalPlaneConstraint = LocalPlaneConstraint;
function LocalPlaneConstraint(planeA, planeB, planeC, a) {
  Particulate.PlaneConstraint.apply(this, arguments);
  this.distance = 0;
}

LocalPlaneConstraint.create = Particulate.ctor(LocalPlaneConstraint);
LocalPlaneConstraint.prototype = Object.create(Particulate.PlaneConstraint.prototype);
LocalPlaneConstraint.prototype.constructor = LocalPlaneConstraint;

LocalPlaneConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var b0 = this.bufferVec3;
  var ii = this.indices;
  var bi = ii[1], pi = ii[index + 3];

  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var pix = pi * 3, piy = pix + 1, piz = pix + 2;

  if (index === 0) {
    this._calculateNormal(index, p0);
  }

  if (!this._hasNormal) { return; }

  // N (plane normal vector)
  var nX = b0[0];
  var nY = b0[1];
  var nZ = b0[2];

  // BP (B -> P)
  var opX = p0[pix] - p0[bix];
  var opY = p0[piy] - p0[biy];
  var opZ = p0[piz] - p0[biz];

  // Project BP onto normal vector N
  var pt = opX * nX + opY * nY + opZ * nZ;
  if (pt > this.distance) { return; }

  p0[pix] -= nX * pt;
  p0[piy] -= nY * pt;
  p0[piz] -= nZ * pt;
};
