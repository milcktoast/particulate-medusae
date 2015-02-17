var PTCL = Particulate;
var GEOM = App.Geometry;
var LINKS = App.Links;
var FACES = App.Faces;

var Vec3 = PTCL.Vec3;
var PointConstraint = PTCL.PointConstraint;
var DistanceConstraint = PTCL.DistanceConstraint;
var AngleConstraint = PTCL.AngleConstraint;
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

  this.segmentsCount = 4;
  this.ribsCount = 20;
  this.size = 20;
  this._totalSegments = this.segmentsCount * 3 * 3;

  this.tentacleGroupCount = 4;
  this.tentacleGroupOffset = 1;
  this.tentacleSegments = 140;
  this.tentacleSegmentLength = 1;
  this.tentacleWeightFactor = 0.5;

  this.tailCount = 10;
  this.tailSegments = 50;
  this.tailSegmentSize = 1;
  this.tailRadius = 9;

  this.ribs = [];

  this.item = new THREE.Object3D();
  this.createTempBuffers();
  this.createGeometry();
  this.createSystem();
  this.createMaterials();
  this.removeTempBuffers();
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
  'tentacleIndices',
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
  this.createTentacles();
  this.createTail();
};

// ..................................................
// Core
//

function spineAngleIndices(a, b, start, howMany) {
  var indices = [];
  for (var i = 0; i < howMany; i ++) {
    indices.push(a, b, start + i);
  }
  return indices;
}

Medusae.prototype.createCore = function () {
  var verts = this.verts;
  var uvs = this.uvs;
  var segments = this._totalSegments;
  var ribsCount = this.ribsCount;
  var size = this.size;
  var topStart = this.topStart = 4;

  GEOM.point(0, size, 0, verts);
  uvs.push(0, 0);

  for (var i = 0, il = topStart - 1; i < il; i ++) {
    GEOM.point(0, 0, 0, verts);
    uvs.push(0, 0);
  }

  var spine = DistanceConstraint.create([20, size], [0, 2]);
  var axis = AxisConstraint.create(0, 1, 2);

  var bottomStart = segments * (ribsCount - 1) + topStart;
  var topAngle = AngleConstraint.create([PI * 0.35, PI * 0.65],
    spineAngleIndices(1, 0, topStart, segments));
  var bottomAngle = AngleConstraint.create([PI * 0.45, PI * 0.65],
    spineAngleIndices(0, 2, bottomStart, segments));

  this.queueConstraints(spine, axis);
  this.queueConstraints(topAngle, bottomAngle);

  FACES.radial(0, topStart, segments, this.bulbFaces);
};

// ..................................................
// Bulb
//

Medusae.prototype.createBulb = function () {
  var ribsCount = this.ribsCount;

  for (var i = 0, il = ribsCount; i < il; i ++) {
    this.createRib(i, ribsCount);
    if (i > 0) {
      this.createSkin(i - 1, i);
    }
  }
};

function ribRadius(t) {
  // return sin(PI - PI * 0.55 * t * 1.5);
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
    st = (i + 1) / (howMany - 1);
    su = (st <= 0.5 ? st : 1 - st) * 2;
    buffer.push(su, sv);
  }
  buffer.push(0, sv);
  return buffer;
}

Medusae.prototype.createInnerRib = function (start, length) {
  var segmentGroups = this.segmentsCount;
  var segments = this._totalSegments;
  var indices = [];

  for (var i = 0, il = segmentGroups; i < il; i ++) {
    innerRibIndices(i * 3, start, segments, indices);
  }

  return DistanceConstraint.create([length * 0.8, length], indices);
};

Medusae.prototype.createRib = function (index, total) {
  var segments = this._totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;
  var size = this.size;
  var yParam = index / total;
  var yPos = size - yParam * size;

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
  var spine, spineCenter;
  if (index === 0 || index === total - 1) {
    spineCenter = index === 0 ? 0 : 2;
    spine = DistanceConstraint.create([radius * 0.8, radius],
      LINKS.radial(spineCenter, start, segments, []));

    this.queueConstraints(spine);
    if (index === 0) {
      this.addLinks(spine.indices);
    }
  }

  this.queueConstraints(outerRib, innerRib);

  this.ribs.push({
    start : start,
    radius : radius,
    yParam : yParam,
    outer : outerRib,
    inner : innerRib,
    spine : spine
  });
};

Medusae.prototype.createSkin = function (r0, r1) {
  var segments = this._totalSegments;
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

Medusae.prototype.updateBulb = function (delta) {
  var time = this.animTime;
  var phase = (sin(time) + 1) * 0.5;
  var radiusOffset = 15;

  var segments = this._totalSegments;
  var ribs = this.ribs;
  var rib, radius, outerLen, innerLen;

  for (var i = 0, il = ribs.length; i < il; i ++) {
    rib = ribs[i];
    radius = rib.radius + rib.yParam * phase * radiusOffset;

    outerLen = 2 * PI * radius / segments;
    innerLen = 2 * PI * radius / 3;

    rib.outer.setDistance(outerLen * 0.9, outerLen);
    rib.inner.setDistance(innerLen * 0.8, innerLen);

    if (rib.spine) {
      rib.spine.setDistance(radius * 0.8, radius);
    }
  }
};

// ..................................................
// Tentacles
//

Medusae.prototype.createTentacles = function () {
  var tentacleGroupCount = this.tentacleGroupCount;

  for (var i = 0, il = tentacleGroupCount; i < il; i ++) {
    this.createTentacleGroup(i);
  }
};

Medusae.prototype.createTentacleGroup = function (groupIndex) {
  var tentacleSegments = this.tentacleSegments;

  for (var i = 0, il = tentacleSegments; i < il; i ++) {
    this.createTentacleSegment(groupIndex, i, tentacleSegments);
    if (i > 0) {
      this.linkTentacle(groupIndex, i - 1, i);
    } else {
      this.attachTentacles(groupIndex);
    }
  }
};

function tentacleUvs(howMany, buffer) {
  for (var i = 0, il = howMany; i < il; i ++) {
    buffer.push(0, 0);
  }
  return buffer;
}

Medusae.prototype.createTentacleSegment = function (groupIndex, index, total) {
  var segments = this._totalSegments;
  var verts = this.verts;
  var uvs = this.uvs;

  var radius = 20 * (0.25 * sin(index * 0.1) + 0.5);
  var yPos = - index * this.tentacleSegmentLength;
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

Medusae.prototype.attachTentacles = function (groupIndex) {
  var segments = this._totalSegments;
  var groupOffset = groupIndex * this.tentacleGroupOffset;
  var rib = this.ribs[this.ribs.length - groupOffset - 1];
  var tent = this.tentacles[groupIndex][0];
  var dist = this.tentacleSegmentLength;

  var tentacle = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib.start, tent.start, segments, []));

  this.queueConstraints(tentacle);
  this.addLinks(tentacle.indices, this.tentacleIndices);
};

Medusae.prototype.linkTentacle = function (groupIndex, i0, i1) {
  var segments = this._totalSegments;
  var tentacleGroup = this.tentacles[groupIndex];
  var tent0 = tentacleGroup[i0];
  var tent1 = tentacleGroup[i1];
  var dist = this.tentacleSegmentLength;

  var tentacle = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(tent0.start, tent1.start, segments, []));

  this.queueConstraints(tentacle);
  this.addLinks(tentacle.indices, this.tentacleIndices);
};

// ..................................................
// Tail / mouth
//

Medusae.prototype.createTail = function () {
  var tailCount = this.tailCount;

  for (var i = 0, il = tailCount; i < il; i ++) {
    this.createTailSection(i, tailCount);
  }
};

Medusae.prototype.createTailSection = function (index, total) {
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
  var innerIndices = LINKS.line(innerStart, segments, [0, innerStart]);
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
  var axis = AxisConstraint.create(0, 1, innerIndices);
  var pin = DistanceConstraint.create([0, bottomPinMax], innerEnd, 3);

  this.queueConstraints(inner, outer, brace, axis, pin);
  this.queueConstraints(linkConstraints);

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

  system.setWeight(0, 0);
  system.setWeight(1, 0);
  system.setWeight(3, 0);

  system.addPinConstraint(PointConstraint.create([0, this.size, 0], 0));
  system.addPinConstraint(PointConstraint.create([0, 0, 0], 1));
  // TODO: Derive position from parameter
  system.addPinConstraint(PointConstraint.create([0, -40, 0], 3));
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

Medusae.prototype.addLinks = function (indices, buffer) {
  buffer = buffer || this.links;
  _push.apply(buffer, indices);
};

Medusae.prototype.addFaces = function (faceIndices) {
  _push.apply(this.bulbFaces, faceIndices);
};

Medusae.prototype.createMaterials = function () {
  var position = new THREE.BufferAttribute(this.system.positions, 3);
  var positionPrev = new THREE.BufferAttribute(this.system.positionsPrev, 3);
  var uvs = new THREE.BufferAttribute(new Float32Array(this.uvs), 2);
  var indices = new THREE.BufferAttribute(new Uint16Array(this.links), 1);

  // Connections
  var linesGeom = new THREE.BufferGeometry();
  linesGeom.addAttribute('position', position);
  // linesGeom.addAttribute('positionPrev', positionPrev);
  linesGeom.addAttribute('index', indices);

  this.linesFaint = new THREE.Line(linesGeom,
    new THREE.LineBasicMaterial({
      color : 0xffffff,
      opacity : 0.1,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      depthTest : false
    }), THREE.LinePieces);

  this.linesFore = new THREE.Line(linesGeom,
    new App.TentacleMaterial({
      diffuse : 0xf99ebd,
      area : 200,
      opacity : 0.3,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      depthTest : true
    }), THREE.LinePieces);

  this.linesFaint.scale.multiplyScalar(1.1);
  this.linesFore.scale.multiplyScalar(1.1);

  // Tentacles
  var tentacleGeom = new THREE.BufferGeometry();
  var tentacleIndices = new THREE.BufferAttribute(new Uint16Array(this.tentacleIndices), 1);
  tentacleGeom.addAttribute('position', position);
  tentacleGeom.addAttribute('positionPrev', positionPrev);
  tentacleGeom.addAttribute('index', tentacleIndices);

  this.tentacleFore = new THREE.Line(tentacleGeom,
    new App.TentacleMaterial({
      diffuse : 0xf99ebd,
      area : 200,
      linewidth : this.lineWidth,
      transparent : true,
      blending: THREE.AdditiveBlending,
      opacity : 0.5,
      depthTest : true
    }), THREE.LinePieces);

  this.tentacleFore.scale.multiplyScalar(0.8);

  // Faces
  var faceGeom = new THREE.BufferGeometry();
  var faceIndices = new THREE.BufferAttribute(new Uint16Array(this.bulbFaces), 1);

  faceGeom.addAttribute('position', position);
  faceGeom.addAttribute('index', faceIndices);
  faceGeom.addAttribute('uv', uvs);
  faceGeom.computeVertexNormals();

  this.skinMesh = new THREE.Mesh(faceGeom,
    new App.BulbMaterial({
      diffuse : 0x411991
    }));

  // this.innerMesh = new THREE.Mesh(faceGeom,
  //   new App.BulbMaterial({
  //     side : THREE.BackSide
  //   }));
  // this.innerMesh.scale.multiplyScalar(0.8);

  var tailFaceGeom = new THREE.BufferGeometry();
  var tailFaceIndices = new THREE.BufferAttribute(new Uint16Array(this.tailFaces), 1);

  tailFaceGeom.addAttribute('position', position);
  tailFaceGeom.addAttribute('index', tailFaceIndices);
  tailFaceGeom.addAttribute('uv', uvs);

  this.tailMesh = new THREE.Mesh(tailFaceGeom,
    new App.TailMaterial({
      diffuse : 0xffffff,
      transparent : true,
      blending : THREE.AdditiveBlending,
      opacity : 0.5,
      side : THREE.DoubleSide
    }));
  this.tailMesh.scale.multiplyScalar(1.1);

  // Parent object
  var item = this.item;
  // item.add(this.linesFaint);
  // item.add(this.linesFore);
  item.add(this.tentacleFore);
  // item.add(this.skinMesh);
  // item.add(this.tailMesh);

  this.positionAttr = tentacleGeom.attributes.position;
  this.positionPrevAttr = tentacleGeom.attributes.positionPrev;
  this.tentacleTime = this.tentacleFore.material.uniforms.time;
};

Medusae.prototype.addTo = function (scene) {
  scene.add(this.item);
};

Medusae.prototype.update = function (delta) {
  this.animTime += delta * 0.001;
  this.updateBulb(delta);
  this.system.tick(1);

  this.positionAttr.needsUpdate = true;
  this.positionPrevAttr.needsUpdate = true;
};

Medusae.prototype.updateGraphics = function (delta, stepProgress) {
  this.tentacleTime.value = stepProgress;
};
