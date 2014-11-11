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
var GRAVITY = -0.001;

var _push = Array.prototype.push;

var gravityForce = PTCL.DirectionalForce.create();

// Medusae geometry
// ---------------

function Medusae() {
  this.segments = 3 * 9;
  this.ribsCount = 20;
  this.tailCount = 10;
  this.tailSegments = 50;
  this.size = 20;

  this._queuedConstraints = [];
  this.verts = [];
  this.links = [];
  this.bulbFaces = [];
  this.tailFaces = [];
  this.uvs = [];

  this.ribs = [];
  this.skins = [];

  this.item = new THREE.Object3D();
  this.createGeometry();
  this.createSystem();
  this.createMaterials();
}

Medusae.prototype.createGeometry = function () {
  var ribsCount = this.ribsCount;
  var tailCount = this.tailCount;
  var i, il;

  this.createCore();

  for (i = 0, il = ribsCount; i < il; i ++) {
    this.createRib(i, ribsCount);
    if (i > 0) {
      this.createSkin(i - 1, i);
    }
  }

  for (i = 0, il = tailCount; i < il; i ++) {
    this.createTail(i, tailCount);
  }
};

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
  var segments = this.segments;
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

Medusae.prototype.createRib = function (index, total) {
  var segments = this.segments;
  var verts = this.verts;
  var uvs = this.uvs;
  var size = this.size;
  var yPos = size - (index / total) * size;

  var start = index * segments + this.topStart;
  var radiusT = ribRadius(index / total);
  var radius = radiusT * 10 + 0.5;

  GEOM.circle(segments, radius, yPos, verts);
  ribUvs(index / total, segments, uvs);

  // Outer rib structure
  var ribIndices = LINKS.loop(start, segments, []);
  var ribLen = 2 * PI * radius / segments;
  var rib = DistanceConstraint.create([ribLen * 0.9, ribLen], ribIndices);

  // Inner rib sub-structure
  // TODO: Parmeterize sub-structure divisions
  var innerIndices = [];
  innerRibIndices(0, start, segments, innerIndices);
  innerRibIndices(3, start, segments, innerIndices);
  innerRibIndices(6, start, segments, innerIndices);

  var innerRibLen = 2 * PI * radius / 3;
  var innerRib = DistanceConstraint.create([innerRibLen * 0.8, innerRibLen], innerIndices);

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

  this.queueConstraints(rib, innerRib);

  this.ribs.push({
    start : start,
    radius : radius
  });
};

Medusae.prototype.createSkin = function (r0, r1) {
  var segments = this.segments;
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

Medusae.prototype.createTail = function (index, total) {
  var size = this.size;
  var segments = this.tailSegments;
  var innerSize = 1;
  var outerSize = innerSize * 1.8;
  var linkSizeScale = segments * 0.25;
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
  this.addLinks(linkIndices);
};

Medusae.prototype.queueConstraint = function (constraint) {
  this._queuedConstraints.push(constraint);
};

Medusae.prototype.queueConstraints = function (constraints) {
  _push.apply(this._queuedConstraints, constraints.length ? constraints : arguments);
};

Medusae.prototype.createSystem = function () {
  var queuedConstraints = this._queuedConstraints;
  var system = this.system = PTCL.ParticleSystem.create(this.verts, 2);
  this.verts = this.system.positions;

  for (var i = 0, il = queuedConstraints.length; i < il; i ++) {
    system.addConstraint(queuedConstraints[i]);
  }

  system.setWeight(0, 0);
  system.setWeight(1, 0);
  system.setWeight(3, 0);

  system.addPinConstraint(PointConstraint.create([0, this.size, 0], 0));
  system.addPinConstraint(PointConstraint.create([0, 0, 0], 1));
  // TODO: Derive position from parameter
  system.addPinConstraint(PointConstraint.create([0, -40, 0], 3));

  system.addForce(gravityForce);

  // Resolve constraints before starting animation
  for (i = 0, il = 200; i < il; i ++) {
    system.tick(1);
  }
};

Medusae.prototype.addLinks = function (indices) {
  _push.apply(this.links, indices);
};

Medusae.prototype.addFaces = function (faceIndices) {
  _push.apply(this.bulbFaces, faceIndices);
};

Medusae.prototype.createMaterials = function () {
  var vertices = new THREE.BufferAttribute();
  vertices.array = this.verts;
  vertices.itemSize = 3;

  var uvs = new THREE.BufferAttribute();
  uvs.array = new Float32Array(this.uvs);
  uvs.itemSize = 2;

  var indices = new THREE.BufferAttribute();
  indices.array = new Uint16Array(this.links);

  // Particles
  var dotsGeom = new THREE.BufferGeometry();
  dotsGeom.addAttribute('position', vertices);

  this.dots = new THREE.ParticleSystem(dotsGeom,
    new THREE.ParticleSystemMaterial({size: 2}));

  // Connections
  var linesGeom = new THREE.BufferGeometry();
  linesGeom.addAttribute('position', vertices);
  linesGeom.addAttribute('index', indices);

  this.linesFaint = new THREE.Line(linesGeom,
    new THREE.LineBasicMaterial({
      color : 0xffffff,
      transparent : true,
      blending: THREE.AdditiveBlending,
      opacity : 0.05,
      depthTest : false
    }));

  this.linesFore = new THREE.Line(linesGeom,
    new THREE.LineBasicMaterial({
      color : 0xffffff,
      transparent : true,
      blending: THREE.AdditiveBlending,
      opacity : 0.25,
      depthTest : true
    }));

  this.linesFaint.scale.multiplyScalar(1.1);
  this.linesFore.scale.multiplyScalar(1.1);

  // Faces
  var faceGeom = new THREE.BufferGeometry();
  var faceIndices = new THREE.BufferAttribute();
  faceIndices.array = new Uint16Array(this.bulbFaces);

  faceGeom.addAttribute('position', vertices);
  faceGeom.addAttribute('index', faceIndices);
  faceGeom.addAttribute('uv', uvs);
  faceGeom.computeVertexNormals();

  this.skinMesh = new THREE.Mesh(faceGeom,
    new App.BulbMaterial({
      diffuse : 0x411991
    }));

  this.innerMesh = new THREE.Mesh(faceGeom,
    new App.BulbMaterial({
      side : THREE.BackSide
    }));
  this.innerMesh.scale.multiplyScalar(0.8);

  var tailFaceGeom = new THREE.BufferGeometry();
  var tailFaceIndices = new THREE.BufferAttribute();
  tailFaceIndices.array = new Uint16Array(this.tailFaces);
  tailFaceGeom.addAttribute('position', vertices);
  tailFaceGeom.addAttribute('index', tailFaceIndices);
  tailFaceGeom.addAttribute('uv', uvs);

  this.tailMesh = new THREE.Mesh(tailFaceGeom,
    new App.UVMaterial({
      transparent : true,
      blending : THREE.AdditiveBlending,
      opacity : 0.05,
      side : THREE.DoubleSide
    }));
  this.tailMesh.scale.multiplyScalar(1.1);

  // Parent object
  var item = this.item;
  // item.add(this.dots);
  item.add(this.linesFaint);
  item.add(this.linesFore);
  item.add(this.skinMesh);
  // item.add(this.innerMesh);
  item.add(this.tailMesh);

  this.positionAttr = linesGeom.attributes.position;
};

Medusae.prototype.addTo = function (scene) {
  scene.add(this.item);
};

Medusae.prototype.update = function (delta) {
  this.system.tick(1);
  this.positionAttr.needsUpdate = true;
};

var medusae = new Medusae();

// Visualization
// -------------

var demo = PTCL.DemoScene.create();
demo.camera.position.set(200, 100, 0);

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(200, 100, 0);
demo.scene.add(light);

// Medusae
medusae.addTo(demo.scene);

var up = demo.controls.object.up;
demo.animate(function () {
  gravityForce.set(up.x * GRAVITY, up.y * GRAVITY, up.z * GRAVITY);
  medusae.update();
  demo.update();
  demo.render();
});
