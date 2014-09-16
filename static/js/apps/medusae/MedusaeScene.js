var PTCL = Particulate;
var GEOM = App.Geometry;
var LINKS = App.Links;

var Vec3 = PTCL.Vec3;
var PointConstraint = PTCL.PointConstraint;
var DistanceConstraint = PTCL.DistanceConstraint;
var AngleConstraint = PTCL.AngleConstraint;
var AxisConstraint = PTCL.AxisConstraint;

var sin = Math.sin;
var PI = Math.PI;
var GRAVITY = -0.001;

var _push = Array.prototype.push;

var gravityForce = PTCL.DirectionalForce.create();

// Medusae geometry
// ---------------

function Medusae() {
  this.segments = 9;
  this.ribsCount = 40;

  this._queuedConstraints = [];
  this.verts = [];
  this.links = [];

  this.ribs = [];
  this.skins = [];

  this.createGeometry();
  this.createSystem();
  this.createMaterials();
}

Medusae.prototype.createGeometry = function () {
  var ribsCount = this.ribsCount;

  this.createCore();

  for (var i = 0; i < ribsCount; i ++) {
    this.createRib(i, ribsCount);
    if (i > 0) {
      this.createSkin(i - 1, i);
    }
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
  var segments = this.segments;
  var ribsCount = this.ribsCount;

  GEOM.point(0, 0, 0, verts);
  GEOM.point(0, 0, -30, verts);
  GEOM.point(0, 0, -30, verts);

  var topStart = 3;
  var top = DistanceConstraint.create([3, 5],
    LINKS.radial(0, topStart, segments, []));

  var spine = DistanceConstraint.create([20, 50], [0, 2]);
  var axis = AxisConstraint.create(0, 1, 2);

  var bottomStart = segments * (ribsCount - 1) + 3;
  var bottom = DistanceConstraint.create([15, 25],
    LINKS.radial(2, bottomStart, segments, []));

  // TODO: Add Plane3Constraint
  // To project points onto plane defined by 3 points
  var topAngle = AngleConstraint.create(PI * 0.5,
    spineAngleIndices(1, 0, topStart, segments));
  var bottomAngle = AngleConstraint.create(PI * 0.5,
    spineAngleIndices(0, 2, bottomStart, segments));

  this.queueConstraints(top, bottom);
  this.queueConstraints(spine, axis);
  this.queueConstraints(topAngle, bottomAngle);

  // this.addLinks(top.indices);
  // this.addLinks(bottom.indices);
  this.addLinks(spine.indices);

  this.core = {
    top : top,
    bottom : bottom
  };

  // debugger;
};

function ribRadius(t) {
  return sin(PI - PI * 0.5 * t * 1.5);
}

Medusae.prototype.createRib = function (index, total) {
  var segments = this.segments;
  var verts = this.verts;
  var yPos = -(index / total) * 30;

  var start = index * segments + 3;
  var radius = ribRadius(index / total) * 20 + 5;

  GEOM.circle(segments, radius, yPos, verts);

  var circumf = 2 * PI * radius / segments;
  var rib = DistanceConstraint.create([circumf * 0.9, circumf],
    LINKS.loop(start, segments, []));

  var angle = (segments - 2) * PI / segments;
  var membrane = AngleConstraint.create([angle * 0.8, angle * 1.1],
    LINKS.loop3(start, segments, []));

  this.queueConstraints(rib, membrane);
  this.addLinks(rib.indices);

  this.ribs.push({
    start : start
  });

  // debugger;
};

Medusae.prototype.createSkin = function (r0, r1) {
  var segments = this.segments;
  var rib0 = this.ribs[r0];
  var rib1 = this.ribs[r1];

  var dist = Vec3.distance(this.verts, rib0.start, rib1.start);
  var skin = DistanceConstraint.create([dist * 0.5, dist],
    LINKS.rings(rib0.start, rib1.start, segments, []));

  this.queueConstraints(skin);
  // this.addLinks(skin.indices);

  this.skins.push({
    a : r0,
    b : r1
  });
};

Medusae.prototype.queueConstraint = function (constraint) {
  this._queuedConstraints.push(constraint);
};

Medusae.prototype.queueConstraints = function () {
  _push.apply(this._queuedConstraints, arguments);
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
  system.addPinConstraint(PointConstraint.create([0, 0, 0], 0));
  system.addPinConstraint(PointConstraint.create([0, -30, 0], 1));

  system.addForce(gravityForce);
};

Medusae.prototype.addLinks = function (indices) {
  _push.apply(this.links, indices);
};

Medusae.prototype.createMaterials = function () {
  var vertices = new THREE.BufferAttribute();
  vertices.array = this.verts;
  vertices.itemSize = 3;

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

  this.lines = new THREE.Line(linesGeom,
    new THREE.LineBasicMaterial());

  this.positionAttr = dotsGeom.attributes.position;

  // var indicesDotted = new THREE.BufferAttribute();
  // indicesDotted.array = new Uint16Array(dottedLineIndices);

  // var distancesDotted = new THREE.BufferAttribute();
  // distancesDotted.array = uniformFloatArray(vertices.length / 3, 30);
  // distancesDotted.array[0] = 0;
  // distancesDotted.itemSize = 1;

  // var linesDotted = new THREE.BufferGeometry();
  // linesDotted.addAttribute('position', vertices);
  // linesDotted.addAttribute('index', indicesDotted);
  // linesDotted.addAttribute('lineDistance', distancesDotted);

  // var visConnectorsDots = new THREE.Line(linesDotted,
  //   new THREE.LineDashedMaterial({
  //     linewidth : 1,
  //     dashSize : 0.5,
  //     gapSize : 3
  //   }), THREE.LinePieces);
};

Medusae.prototype.addTo = function (scene) {
  // scene.add(this.dots);
  scene.add(this.lines);
};

Medusae.prototype.updateCore = function (delta) {
  var t = sin(delta * 0.01) * 0.5 + 0.5;
  var radius = t * 10 + 15;
  // console.log(t);
  this.core.bottom.setDistance(radius * 0.7, radius);
};

Medusae.prototype.update = function (delta) {
  // this.updateCore(delta);
  this.system.tick(1);
  this.positionAttr.needsUpdate = true;
};

var medusae = new Medusae();

// Visualization
// -------------

var demo = PTCL.DemoScene.create();
demo.camera.position.set(200, 100, 0);

// Medusae
medusae.addTo(demo.scene);

// Bounds
// var box = new THREE.Mesh(
//   new THREE.BoxGeometry(200, 200, 200, 1, 1, 1),
//   new THREE.MeshBasicMaterial({
//     wireframe : true
//   }));
// demo.scene.add(box);

var up = demo.controls.object.up;
// var animateFrame = 0;
demo.animate(function () {
  gravityForce.set(up.x * GRAVITY, up.y * GRAVITY, up.z * GRAVITY);
  medusae.update();
  demo.update();
  demo.render();
});
