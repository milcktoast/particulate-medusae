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
var log = Math.log;
var floor = Math.floor;
var PI = Math.PI;

var _push = Array.prototype.push;

// ..................................................
// Medusae
// ..................................................

App.Medusae = Medusae;
function Medusae(opts) {
  this.pxRatio = opts.pxRatio || 1;
  this.lineWidth = this.pxRatio;
  this.animTime = 0;

  this.size = 40;
  this.yOffset = 20;

  this.segmentsCount = 4;
  this.totalSegments = this.segmentsCount * 3 * 3;

  this.ribsCount = 20;
  this.ribRadius = 25;

  this.tentacleGroupStart = 0;
  this.tentacleGroupOffset = 2;
  this.tentacleGroupCount = 6;
  this.tentacleSegments = 100;
  this.tentacleSegmentLength = 1.5;
  this.tentacleWeightFactor = 1;

  this.tailRibsCount = 10;
  this.tailRibRadiusFactor = 20;
  // this.tailCount = 30;
  // this.tailSegments = 50;
  // this.tailSegmentSize = 1;
  // this.tailRadius = 9;
  // this.tailWeightFactor = 0.25;

  this.createTempBuffers();
  this.createGeometry();
  this.createSystem();
  this.createSceneItem();
  this.removeTempBuffers();
  this.initTweens();
}

Medusae.create = App.ctor(Medusae);

Medusae.tempBuffers = [
  'queuedConstraints',
  'verts',
  'links',
  'weights',
  'bulbFaces',
  'tailFaces',
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
  // var ribsCount = this.ribsCount;
  var size = this.size;
  // var radius = this.ribRadius;
  var offsets = [size, 0, -size * 2, 0, -size * 0.5, -size];

  var topStart = this.topStart = offsets.length;
  var indexTop = this.indexTop = topStart - 3;
  var indexMid = this.indexMid = topStart - 2;
  var indexBottom = this.indexBottom = topStart - 1;

  var pinTop = this.pinTop = 0;
  var pinMid = this.pinMid = 1;
  var pinBottom = this.pinBottom = 2;

  var rangeTop = [0, size * 0.5];
  var rangeMid = [size * 0.5, size * 0.7];
  var rangeTopBottom = [size * 1.5, size * 2];
  var rangeBottom = [0, size * 0.5];

  var spineA = DistanceConstraint.create(rangeTop, [pinTop, indexTop]);
  var spineB = DistanceConstraint.create(rangeMid, [indexTop, indexMid]);
  var spineC = DistanceConstraint.create(rangeBottom, [pinBottom, indexBottom]);
  var spineD = DistanceConstraint.create(rangeTopBottom, [indexTop, indexBottom]);
  var axis = AxisConstraint.create(pinTop, pinMid, [indexTop, indexMid, indexBottom]);

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
  return sin(PI - PI * 0.55 * t * 1.8) + log(t * 100 + 2) / 3 + 1;
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
  var radius = radiusT * 10 + 0.5;

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
  var spine, spineCenter;
  if (isTop || isBottom) {
    spineCenter = index === 0 ? this.indexTop : this.indexBottom;
    spine = DistanceConstraint.create([radius * 0.8, radius],
      LINKS.radial(spineCenter, start, segments, []));

    this.queueConstraints(spine);
    if (index === 0) {
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
    yParam : yParam,
    yPos : yPos,
    outer : outerRib,
    inner : innerRib,
    spine : spine
  });
};

Medusae.prototype.createSkin = function (r0, r1) {
  var segments = this.totalSegments;
  var rib0 = this.ribs[r0];
  var rib1 = this.ribs[r1];

  var dist = Vec3.distance(this.verts, rib0.start, rib1.start);
  var skin = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib0.start, rib1.start, segments, []));

  this.queueConstraints(skin);
  this.addLinks(skin.indices);

  FACES.rings(rib0.start, rib1.start, segments, this.bulbFaces);

  this.skins.push({
    a : r0,
    b : r1
  });
};

Medusae.prototype.updateRibs = function (ribs, delta) {
  var time = this.animTime;
  var phase = (sin(time * 3) + 1) * 0.5;
  var radiusOffset = 15;

  var segments = this.totalSegments;
  var rib, radius, radiusOuter, outerLen, innerLen;

  for (var i = 0, il = ribs.length; i < il; i ++) {
    rib = ribs[i];
    radius = rib.radius + rib.yParam * phase * radiusOffset;
    radiusOuter = (rib.radiusOuter || rib.radius) + rib.yParam * phase * radiusOffset;

    outerLen = 2 * PI * radiusOuter / segments;
    innerLen = 2 * PI * radius / 3;

    if (rib.outer) {
      rib.outer.setDistance(outerLen * 0.9, outerLen);
    }

    if (rib.inner) {
      rib.inner.setDistance(innerLen * 0.8, innerLen);
    }

    if (rib.spine) {
      rib.spine.setDistance(radius * 0.8, radius * 1.2);
    }
  }
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
  var rib = this.tentacleRib(index);
  var ratio = index / total;
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
};

Medusae.prototype.tentacleRib = function (groupIndex) {
  var ribs = this.ribs;
  var tailRibs = this.tailRibs;
  var groupOffset = this.tentacleGroupStart + this.tentacleGroupOffset * groupIndex;

  return tailRibs[tailRibs.length - groupOffset - 1] ||
    ribs[ribs.length - groupOffset + tailRibs.length - 1];
};

function tentacleUvs(howMany, buffer) {
  for (var i = 0, il = howMany; i < il; i ++) {
    buffer.push(0, 0);
  }
  return buffer;
}

Medusae.prototype.createTentacleSegment = function (groupIndex, index, total, rib) {
  var segments = this.totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;

  var radius = rib.radius * (0.25 * sin(index * 0.25) + 0.5);
  var yPos = - index * this.tentacleSegmentLength + this.yOffset;
  var start = verts.length / 3;

  GEOM.circle(segments, radius, yPos, verts);
  tentacleUvs(segments, uvs);
  this.queueWeights(start, segments, index / total * this.tentacleWeightFactor);

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
};

// ..................................................
// Tail / mouth
//

Medusae.prototype.createTail = function () {
  var ribsCount = this.tailRibsCount;
  // var finsCount = this.tailCount;

  this.tailRibs = [];

  for (var i = 0, il = ribsCount; i < il; i ++) {
    this.createTailRib(i, ribsCount);
    this.createTailSkin(i - 1, i);
  }

  // for (i = 0, il = finsCount; i < il; i ++) {
  //   this.createTailFin(i, finsCount);
  // }
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
    // this.addLinks(spine.indices);
  }

  this.queueConstraints(mainRib, innerRib);
  // this.addLinks(mainRib.indices);

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
  this.addLinks(skin.indices);

  FACES.rings(rib0.start, rib1.start, segments, this.tailFaces);
};

Medusae.prototype.createTailFin = function (index, total) {
  var size = this.size;
  var segments = this.tailSegments;
  var innerSize = this.tailSegmentSize;
  var outerSize = innerSize * 1.8;
  var linkSizeScale = this.tailRadius;
  var bottomPinMax = 20;
  var startOffset = size;

  var verts = this.verts;
  var uvs = this.uvs;
  var innerStart = verts.length / 3;
  var innerEnd = innerStart + segments - 1;
  var outerStart = innerStart + segments;
  var innerIndices = LINKS.line(innerStart, segments, [this.indexMid, innerStart]);
  var outerIndices = LINKS.line(outerStart, segments, []);

  var linkConstraints = [];
  var linkIndices = [];
  var braceIndices = [];

  var outerAngle = Math.PI * 2 * index / total;
  var outerX, outerY, outerZ;
  var innerIndex, outerIndex;
  var linkSize;

  for (var i = 0; i < segments; i ++) {
    GEOM.point(0, startOffset - i * innerSize, 0, verts);
    uvs.push(0, i / (segments - 1));
  }

  for (i = 0; i < segments; i ++) {
    innerIndex = innerStart + i;
    outerIndex = outerStart + i;

    linkSize = sin(i / (segments - 1) * PI * 0.8) * linkSizeScale;
    outerX = cos(outerAngle) * linkSize;
    outerZ = sin(outerAngle) * linkSize;
    outerY = startOffset - i * outerSize;

    GEOM.point(outerX, outerY, outerZ, verts);
    uvs.push(1, i / (segments - 1));

    linkIndices.push(innerIndex, outerIndex);
    linkConstraints.push(DistanceConstraint.create(
      linkSize, innerIndex, outerIndex));

    if (i > 10) {
      braceIndices.push(innerIndex - 10, outerIndex);
    }

    if (i > 1) {
      FACES.quad(innerIndex - 1, outerIndex - 1, outerIndex, innerIndex, this.tailFaces);
    }
  }

  var inner = DistanceConstraint.create([innerSize * 0.25, innerSize], innerIndices);
  var outer = DistanceConstraint.create([outerSize * 0.25, outerSize], outerIndices);
  var brace = DistanceConstraint.create([linkSize * 0.5, Infinity], braceIndices);
  var pin = DistanceConstraint.create([0, bottomPinMax], innerEnd, this.pinBottom);

  this.queueConstraints(inner, outer, brace, pin);
  this.queueConstraints(linkConstraints);

  this.queueWeights(innerStart, segments * 2, index / total * this.tailWeightFactor);

  this.addLinks(outerIndices);
  // this.addLinks(linkIndices);
};

// ..................................................
// Physics simulation
//

Medusae.prototype.queueConstraints = function (constraints) {
  _push.apply(this.queuedConstraints, constraints.length ? constraints : arguments);
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
  var size = this.size;
  var yOffset = this.yOffset;

  for (var i = 0, il = queuedConstraints.length; i < il; i ++) {
    system.addConstraint(queuedConstraints[i]);
  }

  for (i = 0, il = queuedWeights.length; i < il; i ++) {
    system.weights[i] = queuedWeights[i];
  }

  system.setWeight(0, 0);
  system.setWeight(1, 0);
  system.setWeight(2, 0);

  system.addPinConstraint(PointConstraint.create([0, size + yOffset, 0], 0));
  system.addPinConstraint(PointConstraint.create([0, yOffset, 0], 1));
  system.addPinConstraint(PointConstraint.create([0, -size + yOffset, 0], 2));
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
    _push.apply(buffer, items);
  };
}

Medusae.prototype.addLinks = pushToBuffer('links');
Medusae.prototype.addFaces = pushToBuffer('bulbFaces');

Medusae.prototype.addTimeAttr = function (item) {
  if (!this.timeAttrs) { this.timeAttrs = []; }
  this.timeAttrs.push(item.material.uniforms.time);
};

Medusae.prototype.createSceneItem = function () {
  this.item = new THREE.Group();
  this.position = new THREE.BufferAttribute(this.system.positions, 3);
  this.positionPrev = new THREE.BufferAttribute(this.system.positionsPrev, 3);
  this.uvs = new THREE.BufferAttribute(new Float32Array(this.uvs), 2);

  this.timeAttrs = [];
  this.createMaterialsDots();
  this.createMaterialsLines();
  this.createMaterialsInnerLines();
  this.createMaterialsTentacles();
  this.createMaterialsBulb();
  this.createMaterialsTail();

  this.positionAttr = this.linesFore.geometry.attributes.position;
  this.positionPrevAttr = this.linesFore.geometry.attributes.positionPrev;

  this.item.position.setY(20);
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

  var dots = this.dots = new THREE.PointCloud(geom,
    new THREE.PointCloudMaterial({
      size : this.pxRatio * 2,
      map : this.createTextureDots(),
      transparent : true,
      depthTest : false,
      depthWrite : false
    }));

  this.item.add(dots);
};

Medusae.prototype.createMaterialsLines = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.links), 1);

  var area = 600;
  var scale = 1.1;

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('index', indices);

  var faint = this.linesFaint = new THREE.Line(geom,
    new App.TentacleMaterial({
      color : 0xffffff,
      area : area,
      opacity : 0.25,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      depthTest : false,
      depthWrite : false
    }), THREE.LinePieces);

  var fore = this.linesFore = new THREE.Line(geom,
    new App.TentacleMaterial({
      diffuse : 0xf99ebd,
      area : area,
      opacity : 0.5,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      // depthTest : true,
      // depthWrite : false
    }), THREE.LinePieces);

  faint.scale.multiplyScalar(scale);
  fore.scale.multiplyScalar(scale);

  this.addTimeAttr(faint);
  this.addTimeAttr(fore);

  this.item.add(faint);
  this.item.add(fore);
};

Medusae.prototype.createMaterialsInnerLines = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.innerLinks), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('index', indices);

  var inner = this.linesInner = new THREE.Line(geom,
    new App.TentacleMaterial({
      diffuse : 0xf99ebd,
      area : 500,
      linewidth : this.lineWidth,
      transparent : true,
      blending : THREE.AdditiveBlending,
      depthTest : false,
      depthWrite : false
    }), THREE.LinePieces);

  this.linesInnerOpacity = inner.material.uniforms.opacity;
  this.addTimeAttr(inner);
  this.item.add(inner);
};

Medusae.prototype.createMaterialsTentacles = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.tentLinks), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('index', indices);

  var tentacle = this.tentacleFore = new THREE.Line(geom,
    new App.TentacleMaterial({
      diffuse : 0xf99ebd,
      area : 800,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      opacity : 0.25,
      depthTest : true,
      depthWrite : false
    }), THREE.LinePieces);

  // this.tentacleFore.scale.multiplyScalar(0.8);
  this.addTimeAttr(tentacle);
  this.item.add(tentacle);
};

Medusae.prototype.createMaterialsBulb = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.bulbFaces), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('uv', this.uvs);
  geom.addAttribute('index', indices);

  var bulb = this.bulbMesh = new THREE.Mesh(geom,
    new App.BulbMaterial({
      diffuse : new THREE.Color(1.6, 1.0, 1.2)
    }));

  this.bulbOpacity = bulb.material.uniforms.opacity;
  this.addTimeAttr(bulb);
  this.item.add(bulb);
};

Medusae.prototype.createMaterialsTail = function () {
  var geom = new THREE.BufferGeometry();
  var indices = new THREE.BufferAttribute(new Uint16Array(this.tailFaces), 1);

  geom.addAttribute('position', this.position);
  geom.addAttribute('positionPrev', this.positionPrev);
  geom.addAttribute('uv', this.uvs);
  geom.addAttribute('index', indices);

  var tail = this.tailMesh = new THREE.Mesh(geom,
    new App.TailMaterial({
      diffuse : new THREE.Color(1.6, 1.0, 1.2)
    }));

  // this.tailMesh.scale.multiplyScalar(1.1);
  this.tailOpacity = tail.material.uniforms.opacity;
  this.addTimeAttr(tail);
  this.item.add(tail);
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

  this.bulbOpacity.value = meshOpacity;
  this.tailOpacity.value = meshOpacity;
  this.linesInnerOpacity.value = dotOpacity * 0.25;
  this.dots.material.opacity = dotOpacity * 0.5;

  this.linesInner.visible = dotsAreVisible;
  this.dots.visible = dotsAreVisible;

  this.needsRender = Math.abs(dotOpacity - this._dotsOpacity) > 0.001;
};

Medusae.prototype.update = function (delta) {
  this.animTime += delta * 0.001;
  this.updateRibs(this.ribs, delta);
  this.updateRibs(this.tailRibs, delta);
  this.system.tick(delta * 0.001);

  this.positionAttr.needsUpdate = true;
  this.positionPrevAttr.needsUpdate = true;
};

Medusae.prototype.updateGraphics = function (delta, stepProgress) {
  var timeAttrs = this.timeAttrs;
  for (var i = 0; i < timeAttrs.length; i++) {
    timeAttrs[i].value = stepProgress;
  }
};
