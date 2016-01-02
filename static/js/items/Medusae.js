var PTCL = Particulate;
var GEOM = App.Geometry;
var LINKS = App.Links;
var FACES = App.Faces;
var Tweens = App.Tweens;

var Vec3 = PTCL.Vec3;
var PointConstraint = PTCL.PointConstraint;
var DistanceConstraint = PTCL.DistanceConstraint;
var AxisConstraint = PTCL.AxisConstraint;

var sin = Math.sin;
var cos = Math.cos;
// var tan = Math.tan;
var round = Math.round;
var log = Math.log;
var floor = Math.floor;
var PI = Math.PI;
var PI_HALF = PI * 0.5;

var push = Array.prototype.push;

// ..................................................
// Medusae
// ..................................................

App.Medusae = Medusae;
function Medusae(opts) {
  this.pxRatio = opts.pxRatio || 1;
  this.animTime = 0;

  this.size = 40;
  this.yOffset = 20;

  this.segmentsCount = 4;
  this.totalSegments = this.segmentsCount * 3 * 3;

  this.ribsCount = 20;
  this.ribRadius = 15;

  this.tentacleGroupStart = 6;
  this.tentacleGroupOffset = 4;
  this.tentacleGroupCount = 3;
  this.tentacleSegments = 120;
  this.tentacleSegmentLength = 1.5;
  this.tentacleWeightFactor = 1.25;

  this.tailRibsCount = 15;
  this.tailRibRadiusFactor = 20;
  this.tailLinkOffset = 2;

  this.tailArmSegments = 100;
  this.tailArmSegmentLength = 1;
  this.tailArmWeight = 0.5;

  this.createTempBuffers();
  this.createGeometry();
  this.createSystem();
  this.createSceneItem();
  this.removeTempBuffers();
  this.initTweens();
}

Medusae.create = App.ctor(Medusae);
App.Dispatcher.extend(Medusae.prototype);

Medusae.tempBuffers = [
  'queuedConstraints',
  'verts',
  'links',
  'weights',
  'bulbFaces',
  'tailFaces',
  'mouthFaces',
  'uvs',
  'tentacles',
  'tentLinks',
  'innerLinks',
  'skins'
];

Medusae.prototype.createTempBuffers = function () {
  var names = Medusae.tempBuffers;
  var name;

  for (var i = names.length - 1; i >= 0; i --) {
    name = names[i];
    this[name] = [];
  }
};

Medusae.prototype.removeTempBuffers = function () {
  var names = Medusae.tempBuffers;
  var name;

  for (var i = names.length - 1; i >= 0; i --) {
    name = names[i];
    delete this[name];
  }
};

Medusae.prototype.createGeometry = function () {
  this.createCore();
  this.createBulb();
  this.createTail();
  this.createMouth();
  this.createTentacles();
};

// ..................................................
// Core
//

// TODO: Minimize top spine connection deformation
// Perhaps by constraining top few rib rows to top center point
Medusae.prototype.createCore = function () {
  var verts = this.verts;
  var uvs = this.uvs;
  var segments = this.totalSegments;
  var size = this.size;

  var pinTop = this.pinTop = 0;
  var pinMid = this.pinMid = 1;
  var pinBottom = this.pinBottom = 2;
  this.pinTail = 3;
  this.pinTentacle = 4;

  var indexTop = this.indexTop = 5;
  var indexMid = this.indexMid = 6;
  var indexBottom = this.indexBottom = 7;
  var topStart = this.topStart = 8;

  var rangeTop = [0, size * 0.5];
  var rangeMid = [size * 0.5, size * 0.7];
  var rangeTopBottom = [size, size * 2];
  var rangeBottom = [0, size * 0.5];

  var spineA = DistanceConstraint.create(rangeTop, [pinTop, indexTop]);
  var spineB = DistanceConstraint.create(rangeMid, [indexTop, indexMid]);
  var spineC = DistanceConstraint.create(rangeBottom, [pinBottom, indexBottom]);
  var spineD = DistanceConstraint.create(rangeTopBottom, [indexTop, indexBottom]);
  var axis = AxisConstraint.create(pinTop, pinMid, [indexTop, indexMid, indexBottom]);

  var yOffset = this.yOffset;
  var posTop = this.posTop = yOffset + size;
  var posMid = this.posMid = yOffset;
  var posBottom = this.posBottom = yOffset - size;
  var posTail = this.posTail = yOffset - this.tailArmSegments * this.tailArmSegmentLength;
  var posTentacle = this.posTentacle = yOffset - this.tentacleSegments * this.tentacleSegmentLength * 1.5;

  var offsets = [
    posTop, posMid, posBottom, posTail, posTentacle, // Pin offsets
    size * 1.5, -size * 0.5, -size // Floating pin offsets
  ];

  for (var i = 0, il = offsets.length; i < il; i ++) {
    GEOM.point(0, offsets[i], 0, verts);
    uvs.push(0, 0);
  }

  this.queueConstraints(spineA, spineB, spineC, spineD, axis);
  FACES.radial(indexTop, topStart, segments, this.bulbFaces);
};

// ..................................................
// Bulb
//

Medusae.prototype.createBulb = function () {
  var ribsCount = this.ribsCount;

  this.ribs = [];

  for (var i = 0, il = ribsCount; i < il; i ++) {
    this.createRib(i, ribsCount);
    if (i > 0) {
      this.createSkin(i - 1, i);
    }
  }
};

function ribRadius(t) {
  return sin(PI - PI * 0.55 * t * 1.8) + log(t * 100 + 2) / 3;
}

function innerRibIndices(offset, start, segments, buffer) {
  var step = floor(segments / 3);
  var a, b;
  for (var i = 0; i < 3; i ++) {
    a = offset + step * i;
    b = offset + step * (i + 1);

    buffer.push(
      start + a % segments,
      start + b % segments);
  }
  return buffer;
}

function ribUvs(sv, howMany, buffer) {
  var st, su;
  for (var i = 1, il = howMany; i < il; i ++) {
    st = i / howMany;
    su = (st <= 0.5 ? st : 1 - st) * 2;
    buffer.push(su, sv);
  }
  buffer.push(0, sv);
  return buffer;
}

Medusae.prototype.createInnerRib = function (start, length) {
  var segmentGroups = this.segmentsCount;
  var segments = this.totalSegments;
  var indices = [];

  for (var i = 0, il = segmentGroups; i < il; i ++) {
    innerRibIndices(i * 3, start, segments, indices);
  }

  return DistanceConstraint.create([length * 0.8, length], indices);
};

Medusae.prototype.createRib = function (index, total) {
  var segments = this.totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;
  var size = this.size;
  var yParam = index / total;
  var yPos = size + this.yOffset - yParam * size;

  var start = index * segments + this.topStart;
  var radiusT = ribRadius(yParam);
  var radius = radiusT * this.ribRadius;

  GEOM.circle(segments, radius, yPos, verts);
  ribUvs(yParam, segments, uvs);

  // Outer rib structure
  var ribIndices = LINKS.loop(start, segments, []);
  var outerLen = 2 * PI * radius / segments;
  var outerRib = DistanceConstraint.create([outerLen * 0.9, outerLen], ribIndices);

  // Inner rib sub-structure
  var innerLen = 2 * PI * radius / 3;
  var innerRib = this.createInnerRib(start, innerLen);

  // Attach bulb to spine
  var isTop = index === 0;
  var isBottom = index === total - 1;
  var spine, spineCenter, radiusSpine;
  if (isTop || isBottom) {
    spineCenter = index === 0 ? this.indexTop : this.indexBottom;
    radiusSpine = index === 0 ? radius * 1.25 : radius;
    spine = DistanceConstraint.create([radius * 0.5, radiusSpine],
      LINKS.radial(spineCenter, start, segments, []));

    this.queueConstraints(spine);
    if (isTop) {
      this.addLinks(spine.indices);
    } else {
      this.addLinks(spine.indices, this.innerLinks);
    }
  }

  this.addLinks(outerRib.indices, this.innerLinks);
  this.addLinks(innerRib.indices, this.innerLinks);
  this.queueConstraints(outerRib, innerRib);

  this.ribs.push({
    start : start,
    radius : radius,
    radiusSpine : radiusSpine,
    yParam : yParam,
    yPos : yPos,
    outer : outerRib,
    inner : innerRib,
    spine : spine,
  });
};

Medusae.prototype.createSkin = function (r0, r1) {
  var segments = this.totalSegments;
  var rib0 = this.ribs[r0];
  var rib1 = this.ribs[r1];

  var dist = Vec3.distance(this.verts, rib0.start, rib1.start);
  var skin = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib0.start, rib1.start, segments, []));

  // FIXME
  // var distCross = Vec3.distance(this.verts, rib0.start, rib1.start + 1);
  // var skinCross0 = DistanceConstraint.create([distCross * 0.5, distCross],
  //   LINKS.rings(rib0.start, rib1.start + 1, segments - 1, [rib0.start + segments - 1, rib1.start]));
  // var skinCross1 = DistanceConstraint.create([distCross * 0.5, distCross],
  //   LINKS.rings(rib0.start + 1, rib1.start, segments - 1, [rib0.start, rib1.start + segments - 1]));

  this.queueConstraints(skin);
  // this.queuedConstraints(skinCross0, skinCross1);

  this.addLinks(skin.indices);
  // this.addLinks(skinCross0.indices, this.innerLinks);
  // this.addLinks(skinCross1.indices, this.innerLinks);

  FACES.rings(rib0.start, rib1.start, segments, this.bulbFaces);

  this.skins.push({
    a : r0,
    b : r1
  });
};

Medusae.prototype.updateRibs = function (ribs, phase) {
  var radiusOffset = 15;

  var segments = this.totalSegments;
  var rib, radius, radiusOuter, radiusSpine, outerLen, innerLen;

  for (var i = 0, il = ribs.length; i < il; i ++) {
    rib = ribs[i];
    radius = rib.radius + rib.yParam * phase * radiusOffset;
    radiusOuter = (rib.radiusOuter || rib.radius) + rib.yParam * phase * radiusOffset;
    radiusSpine = (rib.radiusSpine || rib.radius) + rib.yParam * phase * radiusOffset;

    if (rib.outer) {
      outerLen = 2 * PI * radiusOuter / segments;
      rib.outer.setDistance(outerLen * 0.9, outerLen);
    }

    if (rib.inner) {
      innerLen = 2 * PI * radius / 3;
      rib.inner.setDistance(innerLen * 0.8, innerLen);
    }

    if (rib.spine) {
      rib.spine.setDistance(radius * 0.8, radiusSpine);
    }
  }
};

Medusae.prototype.ribAt = function (index) {
  var ribs = this.ribs;
  var tailRibs = this.tailRibs;

  return tailRibs[tailRibs.length - index - 1] ||
    ribs[ribs.length - index + tailRibs.length - 1];
};

// ..................................................
// Tentacles
//

Medusae.prototype.createTentacles = function () {
  var tentacleGroupCount = this.tentacleGroupCount;

  for (var i = 0, il = tentacleGroupCount; i < il; i ++) {
    this.createTentacleGroup(i, tentacleGroupCount);
  }
};

Medusae.prototype.createTentacleGroup = function (index, total) {
  var ribIndex = this.tentacleGroupStart + this.tentacleGroupOffset * index;
  var rib = this.ribAt(ribIndex);
  var ratio = 1 - index / total;
  var segments = this.tentacleSegments;
  var count = segments * ratio * 0.25 + segments * 0.75;

  for (var i = 0, il = count; i < il; i ++) {
    this.createTentacleSegment(index, i, count, rib);

    if (i > 0) {
      this.linkTentacle(index, i - 1, i);
    } else {
      this.attachTentacles(index, rib);
    }
  }

  this.attachTentaclesSpine(index);
};

function tentacleUvs(howMany, buffer) {
  for (var i = 0, il = howMany; i < il; i ++) {
    buffer.push(0, 0);
  }
  return buffer;
}

function tentacleWeight(t) {
  return t * t * t;
}

Medusae.prototype.createTentacleSegment = function (groupIndex, index, total, rib) {
  var segments = this.totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;

  var radius = rib.radius * (0.25 * sin(index * 0.25) + 0.5);
  var yPos = - index * this.tentacleSegmentLength + this.yOffset;
  var start = verts.length / 3;
  var weight = tentacleWeight(index / total) * this.tentacleWeightFactor;

  GEOM.circle(segments, radius, yPos, verts);
  tentacleUvs(segments, uvs);
  this.queueWeights(start, segments, weight);

  if (index === 0) {
    this.tentacles.push([]);
  }

  this.tentacles[groupIndex].push({
    start : start
  });
};

Medusae.prototype.attachTentacles = function (groupIndex, rib) {
  var tent = this.tentacles[groupIndex][0];
  var segments = this.totalSegments;
  var dist = this.tentacleSegmentLength;

  var tentacle = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib.start, tent.start, segments, []));

  this.queueConstraints(tentacle);
  this.addLinks(tentacle.indices, this.tentLinks);
};

Medusae.prototype.attachTentaclesSpine = function (groupIndex) {
  var group = this.tentacles[groupIndex];
  var tent = group[group.length - 1];
  var start = tent.start;
  var center = this.pinTentacle;
  var segments = this.totalSegments;
  var dist = this.tentacleSegments * this.tentacleSegmentLength;

  var spine = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.radial(center, start, segments, []));

  this.queueConstraints(spine);
  // this.addLinks(spine.indices, this.innerLinks);
};

Medusae.prototype.linkTentacle = function (groupIndex, i0, i1) {
  var segments = this.totalSegments;
  var tentacleGroup = this.tentacles[groupIndex];
  var tent0 = tentacleGroup[i0];
  var tent1 = tentacleGroup[i1];
  var dist = this.tentacleSegmentLength;

  var tentacle = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(tent0.start, tent1.start, segments, []));

  this.queueConstraints(tentacle);
  this.addLinks(tentacle.indices, this.tentLinks);
  this.addLinks(tentacle.indices, this.innerLinks);
};

// ..................................................
// Tail
//

Medusae.prototype.createTail = function () {
  var ribsCount = this.tailRibsCount;

  this.tailRibs = [];

  for (var i = 0, il = ribsCount; i < il; i ++) {
    this.createTailRib(i, ribsCount);
    this.createTailSkin(i - 1, i);
  }
};

function tailRibRadius(t) {
  return sin(0.25 * t * PI + 0.5 * PI) * (1 - 0.9 * t);
}

// function tailRibUvs(sv, howMany, buffer) {
//   var su;
//   for (var i = 1, il = howMany; i < il; i ++) {
//     su = i % 2;
//     buffer.push(su, sv);
//   }
//   buffer.push(0, sv);
//   return buffer;
// }

Medusae.prototype.createTailRib = function (index, total) {
  var lastRib = this.ribs[this.ribs.length - 1];
  var segments = this.totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;
  var size = this.size;
  var yParam = index / total;
  var yPos = lastRib.yPos - yParam * size * 0.8;

  var start = this.verts.length / 3;
  var radiusT = tailRibRadius(yParam);
  var radius = radiusT * lastRib.radius;
  var radiusOuter = radius + yParam * this.tailRibRadiusFactor;

  GEOM.circle(segments, radius, yPos, verts);
  ribUvs(yParam, segments, uvs);

  // Main folding structure
  var mainIndices = LINKS.loop(start, segments, []);
  var mainLen = 2 * PI * radiusOuter / segments;
  var mainRib = DistanceConstraint.create([mainLen * 0.9, mainLen * 1.5], mainIndices);

  // Inner rib sub-structure
  var innerLen = 2 * PI * radius / 3;
  var innerRib = this.createInnerRib(start, innerLen);

  // Attach to spine
  var spine, spineCenter;
  if (index === total - 1) {
    spineCenter = this.indexMid;
    spine = DistanceConstraint.create([radius * 0.8, radius],
      LINKS.radial(spineCenter, start, segments, []));

    this.queueConstraints(spine);
    this.addLinks(spine.indices, this.innerLinks);
  }

  this.queueConstraints(mainRib, innerRib);
  if (index > this.tailLinkOffset) {
    this.addLinks(mainRib.indices);
  }

  this.tailRibs.push({
    start : start,
    yParam : 1 - yParam,
    radius : radius,
    radiusOuter : radiusOuter,
    inner : innerRib,
    outer : mainRib,
    spine : spine
  });
};

Medusae.prototype.createTailSkin = function (r0, r1) {
  var segments = this.totalSegments;
  var rib0 = r0 < 0 ? this.ribs[this.ribs.length - 1] : this.tailRibs[r0];
  var rib1 = this.tailRibs[r1];

  var dist = Vec3.distance(this.verts, rib0.start, rib1.start);
  var skin = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib0.start, rib1.start, segments, []));

  this.queueConstraints(skin);
  this.addLinks(skin.indices, this.innerLinks);

  FACES.rings(rib0.start, rib1.start, segments, this.tailFaces);
};

// ..................................................
// Mouth
//

Medusae.prototype.createMouth = function () {
  // this.createMouthArmGroup(1, 3, s12, s12);
  this.createMouthArmGroup(1.0, 0, 4, 3);
  this.createMouthArmGroup(0.8, 1, 8, 3, 3);
  this.createMouthArmGroup(0.5, 7, 9, 6);
};

Medusae.prototype.createMouthArmGroup = function (vScale, r0, r1, count, offset) {
  for (var i = 0, il = count; i < il; i ++) {
    this.createMouthArm(vScale, r0, r1, i, count, offset);
  }
};

Medusae.prototype.createMouthArm = function (vScale, r0, r1, index, total, offset) {
  var tParam = index / total;
  var verts = this.verts;
  var uvs = this.uvs;
  var startOffset = this.posMid;

  var ribInner = this.ribAt(r0);
  var ribOuter = this.ribAt(r1);
  var ribSegments = this.totalSegments;
  var ribIndex = (round(ribSegments * tParam) + (offset || 0)) % ribSegments;

  var innerPin = ribInner.start + ribIndex;
  var outerPin = ribOuter.start + ribIndex;
  var scale = Vec3.distance(verts, innerPin, outerPin);

  var maxSegments = this.tailArmSegments;
  var segments = round(vScale * maxSegments);
  var innerSize = this.tailArmSegmentLength;
  var outerSize = innerSize * 2.4;
  var bottomPinMax = 20 + (maxSegments - segments) * this.tailArmSegmentLength;

  var innerStart = verts.length / 3;
  var innerEnd = innerStart + segments - 1;
  var outerStart = innerStart + segments;
  // var outerEnd = outerStart + segments - 1;

  var innerIndices = LINKS.line(innerStart, segments, [innerPin, innerStart]);
  var outerIndices = LINKS.line(outerStart, segments, [outerPin, outerStart]);

  var linkConstraints = [];
  var braceIndices = [];
  var linkIndices = [];

  var outerAngle = Math.PI * 2 * tParam;
  var baseX = cos(outerAngle);
  var baseZ = sin(outerAngle);

  var outerX, outerY, outerZ;
  var innerIndex, outerIndex;
  var linkSize, t;

  for (var i = 0; i < segments; i ++) {
    t = i / (segments - 1);

    GEOM.point(0, startOffset - i * innerSize, 0, verts);
    uvs.push(t, 0);
  }

  for (i = 0; i < segments; i ++) {
    t = i / (segments - 1);
    innerIndex = innerStart + i;
    outerIndex = outerStart + i;

    linkSize = scale *
      (sin(PI_HALF + 10 * t) * 0.25 + 0.75) *
      (sin(PI_HALF + 20 * t) * 0.25 + 0.75) *
      (sin(PI_HALF + 26 * t) * 0.15 + 0.85) *
      (sin(PI_HALF + PI * 0.45 * t));

    outerX = baseX * linkSize;
    outerZ = baseZ * linkSize;
    outerY = startOffset - i * innerSize;

    GEOM.point(outerX, outerY, outerZ, verts);
    uvs.push(t, 1);

    linkConstraints.push(DistanceConstraint.create(
      linkSize, innerIndex, outerIndex));

    if (i > 10) {
      braceIndices.push(innerIndex - 10, outerIndex);
    }

    if (i > 1) {
      linkIndices.push(innerIndex - 1, outerIndex);
    }

    if (i > 1) {
      FACES.quadDoubleSide(innerIndex - 1, outerIndex - 1, outerIndex, innerIndex, this.mouthFaces);
    }
  }

  var inner = DistanceConstraint.create([innerSize * 0.25, innerSize], innerIndices);
  var outer = DistanceConstraint.create([outerSize * 0.25, outerSize], outerIndices);
  var brace = DistanceConstraint.create([linkSize * 0.5, Infinity], braceIndices);
  var pin = DistanceConstraint.create([0, bottomPinMax], innerEnd, this.pinTail);

  this.queueConstraints(inner, outer, brace, pin);
  this.queueConstraints(linkConstraints);

  this.queueWeights(innerStart, segments * 2, this.tailArmWeight);

  this.addLinks(innerIndices);
  this.addLinks(outerIndices);

  this.addLinks(linkIndices, this.tentLinks);
  this.addLinks(braceIndices, this.tentLinks);

  this.addLinks(innerIndices, this.innerLinks);
  this.addLinks(outerIndices, this.innerLinks);
  this.addLinks(linkIndices, this.innerLinks);
  this.addLinks(braceIndices, this.innerLinks);
  this.addLinks(pin.indices, this.innerLinks);
};

// ..................................................
// Physics simulation
//

Medusae.prototype.queueConstraints = function (constraints) {
  push.apply(this.queuedConstraints, constraints.length ? constraints : arguments);
};

Medusae.prototype.queueWeights = function (start, howMany, weight) {
  var weights = this.weights;
  var end = start + howMany;
  var i, il;

  if (weights.length - 1 < end) {
    for (i = 0, il = end - weights.length; i < il; i ++) {
      weights.push(1);
    }
  }

  for (i = start, il = end; i < il; i ++) {
    weights[i] = weight;
  }
};

// TODO: Improve constraining system world position
// Switch from absolute pin to axis constraints
// Pin top end of axis, allow bottom to be affected by forces
Medusae.prototype.createSystem = function () {
  var queuedConstraints = this.queuedConstraints;
  var queuedWeights = this.weights;
  var system = this.system = PTCL.ParticleSystem.create(this.verts, 2);

  for (var i = 0, il = queuedConstraints.length; i < il; i ++) {
    system.addConstraint(queuedConstraints[i]);
  }

  for (i = 0, il = queuedWeights.length; i < il; i ++) {
    system.weights[i] = queuedWeights[i];
  }

  system.setWeight(this.pinTop, 0);
  system.setWeight(this.pinMid, 0);
  system.setWeight(this.pinBottom, 0);
  system.setWeight(this.pinTail, 0);

  system.addPinConstraint(PointConstraint.create([0, this.posTop, 0], this.pinTop));
  system.addPinConstraint(PointConstraint.create([0, this.posMid, 0], this.pinMid));
  system.addPinConstraint(PointConstraint.create([0, this.posBottom, 0], this.pinBottom));
  system.addPinConstraint(PointConstraint.create([0, this.posTail, 0], this.pinTail));
  system.addPinConstraint(PointConstraint.create([0, this.posTentacle, 0], this.pinTentacle));
};

Medusae.prototype.relax = function (iterations) {
  var system = this.system;

  for (var i = 0; i < iterations; i ++) {
    system.tick(1);
  }
};

// ..................................................
// Mesh rendering
//

function pushToBuffer(attr) {
  return function (items, buffer) {
    buffer = buffer || this[attr];
    push.apply(buffer, items);
  };
}

Medusae.prototype.addLinks = pushToBuffer('links');
Medusae.prototype.addFaces = pushToBuffer('bulbFaces');

Medusae.prototype.addTimeAttr = function (item) {
  if (!this.timeAttrs) { this.timeAttrs = []; }
  this.timeAttrs.push(item.material.uniforms.time);
};

Medusae.prototype.addStepAttr = function (item) {
  if (!this.stepAttrs) { this.stepAttrs = []; }
  this.stepAttrs.push(item.material.uniforms.stepProgress);
};

Medusae.prototype.createSceneItem = function () {
  this.item = new THREE.Group();
  this.position = new THREE.BufferAttribute(this.system.positions, 3);
  this.positionPrev = new THREE.BufferAttribute(this.system.positionsPrev, 3);
  this.uvs = new THREE.BufferAttribute(new Float32Array(this.uvs), 2);

  this.colors = [];
  this.stepAttrs = [];
  this.createMaterialsDots();
  this.createMaterialsTentacles();
  this.createMaterialsLines();
  this.createMaterialsInnerLines();
  this.createMaterialsTail();
  this.createMaterialsMouth();
  this.createMaterialsBulb();

  this.item.position.setY(20);
};

Medusae.prototype.addColor = function (label, material, path) {
  path = path || 'diffuse';
  var uniform = material.uniforms[path];

  this.colors.push({
    label : label,
    uniform : uniform
  });
};

Medusae.prototype.createTextureDots = function () {
  var canvas = document.createElement('canvas');
  var texture = new THREE.Texture(canvas);
  var ctx = canvas.getContext('2d');

  var size = Math.pow(2, 6);
  var center = size * 0.5;
  var offset = 0;

  canvas.width = canvas.height = size;

  ctx.lineWidth = size * 0.25;
  ctx.strokeStyle = '#fff';

  ctx.beginPath();
  ctx.moveTo(center, offset);
  ctx.lineTo(center, size - offset);
  ctx.moveTo(offset, center);
  ctx.lineTo(size - offset, center);
  ctx.stroke();

  texture.needsUpdate = true;
  return texture;
};

Medusae.prototype.createMaterialsDots = function () {
  var geom = new THREE.BufferGeometry();

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);

  var dots = this.dots = new THREE.Points(geom,
    new App.LerpPointMaterial({
      psColor : 0xffffff,
      size : this.pxRatio * 2000,
      map : this.createTextureDots(),
      transparent : true,
      depthTest : false,
      depthWrite : false
    }));

  this.dotsOpacity = dots.material.uniforms.opacity;
  this.addStepAttr(dots);
  this.item.add(dots);
};

Medusae.prototype.createMaterialsLines = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.links), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.setIndex(indices);

  var fore = this.linesFore = new THREE.LineSegments(geom,
    new App.TentacleMaterial({
      diffuse : 0xffdde9,
      area : 1200,
      transparent : true,
      blending: THREE.AdditiveBlending,
      depthTest : false,
      depthWrite : false
    }));

  this.linesForeOpacity = fore.material.uniforms.opacity;
  this.addStepAttr(fore);
  this.addColor('Hood Contour', fore.material);
  this.item.add(fore);
};

Medusae.prototype.createMaterialsInnerLines = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.innerLinks), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.setIndex(indices);

  var inner = this.linesInner = new THREE.LineSegments(geom,
    new App.LerpMaterial({
      diffuse : 0xf99ebd,
      transparent : true,
      blending : THREE.AdditiveBlending,
      depthTest : false,
      depthWrite : false
    }));

  this.linesInnerOpacity = inner.material.uniforms.opacity;
  this.addStepAttr(inner);
  // this.addColor('System Debug', inner.material);
  this.item.add(inner);
};

Medusae.prototype.createMaterialsTentacles = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.tentLinks), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.setIndex(indices);

  var tentacle = this.tentacleFore = new THREE.LineSegments(geom,
    new App.TentacleMaterial({
      diffuse : 0x997299,
      area : 2000,
      transparent : true,
      // blending : THREE.AdditiveBlending,
      depthTest : false,
      depthWrite : false
    }));

  this.tentacleOpacity = tentacle.material.uniforms.opacity;
  this.addStepAttr(tentacle);
  this.addColor('Tentacles', tentacle.material);
  this.item.add(tentacle);
};

Medusae.prototype.createMaterialsBulb = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.bulbFaces), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('uv', this.uvs);
  geom.setIndex(indices);

  var bulb = this.bulbMesh = new THREE.Mesh(geom,
    new App.BulbMaterial({
      diffuse : 0xFFA9D2,
      diffuseB : 0x70256C,
      transparent : true
    }));

  var bulbFaint = new THREE.Mesh(geom,
    new App.GelMaterial({
      diffuse : 0x415AB5,
      blending : THREE.AdditiveBlending,
      transparent : true,
      depthTest : false,
      depthWrite : false
    }));

  bulb.scale.multiplyScalar(0.95);
  bulbFaint.scale.multiplyScalar(1.05);

  this.bulbFaintOpacity = bulbFaint.material.uniforms.opacity;
  this.bulbOpacity = bulb.material.uniforms.opacity;

  this.addStepAttr(bulbFaint);
  this.addStepAttr(bulb);
  this.addTimeAttr(bulb);

  this.addColor('Hood Primary', bulb.material);
  this.addColor('Hood Secondary', bulb.material, 'diffuseB');
  this.addColor('Hood Tertiary', bulbFaint.material);

  this.item.add(bulbFaint);
  this.item.add(bulb);
};

Medusae.prototype.createMaterialsTail = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.tailFaces), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('uv', this.uvs);
  geom.setIndex(indices);

  var tail = this.tailMesh = new THREE.Mesh(geom,
    new App.TailMaterial({
      diffuse : 0xE4BBEE,
      diffuseB : 0x241138,
      scale : 20,
      transparent : true
    }));

  this.tailMesh.scale.multiplyScalar(0.95);
  this.tailOpacity = tail.material.uniforms.opacity;
  this.addStepAttr(tail);
  this.addColor('Belly Primary', tail.material);
  this.addColor('Belly Secondary', tail.material, 'diffuseB');
  this.item.add(tail);
};

Medusae.prototype.createMaterialsMouth = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.mouthFaces), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('uv', this.uvs);
  geom.setIndex(indices);

  var mouth = this.mouthMesh = new THREE.Mesh(geom,
    new App.TailMaterial({
      diffuse : 0xEFA6F0,
      diffuseB : 0x4A67CE,
      scale : 3,
      // blending : THREE.AdditiveBlending,
      transparent : true
    }));

  this.mouthOpacity = mouth.material.uniforms.opacity;
  this.addStepAttr(mouth);
  this.addColor('Mouth Primary', mouth.material);
  this.addColor('Mouth Secondary', mouth.material, 'diffuseB');
  this.item.add(mouth);
};

Medusae.prototype.addTo = function (scene) {
  scene.add(this.item);
};

Medusae.prototype.toggleDots = function () {
  var visible = this._dotsAreVisible = !this._dotsAreVisible;

  this._meshOpacity = visible ? 0.1 : 1;
  this._dotsOpacity = visible ? 1 : 0;
};

// ..................................................
// Animation
//

Medusae.prototype.initTweens = function () {
  this._tweens = {};
  this.tween = Tweens.factorTween(this._tweens, 0.05);
};

Medusae.prototype.updateTweens = function (delta) {
  var meshOpacity = this.tween('mesh', this._meshOpacity || 1);
  var dotOpacity = this.tween('dots', this._dotsOpacity || 0);
  var dotsAreVisible = dotOpacity > 0.001;

  this.bulbOpacity.value = meshOpacity * 0.75;
  this.bulbFaintOpacity.value = meshOpacity * 0.25;
  this.tentacleOpacity.value = meshOpacity * 0.25;
  this.tailOpacity.value = meshOpacity * 0.75;
  this.mouthOpacity.value = meshOpacity * 0.65;
  this.linesForeOpacity.value = meshOpacity * 0.35;

  this.linesInnerOpacity.value = dotOpacity * 0.15;
  this.dotsOpacity.value = dotOpacity * 0.25;

  this.linesInner.visible = dotsAreVisible;
  this.dots.visible = dotsAreVisible;

  this.needsRender = Math.abs(dotOpacity - this._dotsOpacity) > 0.001;
};

Medusae.prototype.updateLineWidth = function (lineWidth) {
  var thin = round(lineWidth);
  var thick = round(lineWidth * 2);

  this.linesFore.material.linewidth = thin;
  this.linesInner.material.linewidth = thin;
  this.tentacleFore.material.linewidth = thick;
};

Medusae.prototype.PHASE_ZERO = 0.001;
Medusae.prototype.PHASE_OFFSET = 0.485;

Medusae.prototype.timePhase = function (time) {
  return (sin(time * Math.PI - Math.PI * 0.5) + 1) * 0.5;
};

Medusae.prototype.update = function (delta) {
  var time = this.animTime += delta * 0.001;
  var phase = this.timePhase(time);
  var phaseOffset = this.timePhase(time - this.PHASE_OFFSET);

  if (!this._didPhaseTop && 1 - phaseOffset < this.PHASE_ZERO) {
    this.triggerListeners('phase:top');
    this._didPhaseTop = true;
  }

  if (phaseOffset < this.PHASE_ZERO) {
    this.triggerListeners('phase:bottom');
    this._didPhaseTop = false;
  }

  this.updateRibs(this.ribs, phase);
  this.updateRibs(this.tailRibs, phase);
  this.system.tick(delta * 0.001);

  this.position.needsUpdate = true;
  this.positionPrev.needsUpdate = true;
};

Medusae.prototype.updateGraphics = function (delta, stepProgress) {
  var timeAttrs = this.timeAttrs;
  var stepAttrs = this.stepAttrs;
  var time = this.animTime;
  var i;

  for (i = 0; i < timeAttrs.length; i++) {
    timeAttrs[i].value = time;
  }

  for (i = 0; i < stepAttrs.length; i++) {
    stepAttrs[i].value = stepProgress;
  }
};
