var ENABLE_ZOOM = true;
var ENABLE_PAN = false;
var DEBUG_NUDGE = false;

App.MainScene = MainScene;
function MainScene() {
  var scene = this.scene = new THREE.Scene();
  var camera = this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);
  var el = this.el = document.getElementById('container');

  this.mouse = new THREE.Vector2();
  this.raycaster = new THREE.Raycaster();

  this.pxRatio = window.devicePixelRatio;
  this.gravity = -0.9;

  this.initRenderer();
  this.initFxComposer();
  this.addPostFx();
  this.initControls();
  this.onWindowResize();

  camera.position.set(200, 100, 0);
  camera.lookAt(scene.position);

  this.loop = App.Looper.create(this, 'update', 'render', 1 / 30 * 1000);

  el.addEventListener('mousedown', this.onMouseDown.bind(this), false);
  el.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  el.addEventListener('mouseup', this.onMouseUp.bind(this), false);

  document.addEventListener('keyup', this.onDocumentKey.bind(this), false);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

MainScene.create = App.ctor(MainScene);

// ..................................................
// Graphics
//

MainScene.prototype.initRenderer = function () {
  var renderer = this.renderer = new THREE.WebGLRenderer({
    devicePixelRatio : this.pxRatio,
    antialias : false
  });

  renderer.setClearColor(0x111111, 1);
  renderer.autoClear = false;
};

MainScene.prototype.appendRenderer = function () {
  var canvas = this.renderer.domElement;

  this.el.appendChild(canvas);
  setTimeout(function () {
    canvas.className = 'active';
  }, 0);
};

MainScene.prototype.initFxComposer = function () {
  var renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
    minFilter : THREE.LinearFilter,
    magFilter : THREE.LinearMipMapLinearFilter,
    format : THREE.RGBAFormat
  });

  this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
  this._passIndex = {};
};

// TODO: Tweak bloom fidelity
MainScene.prototype.addPostFx = function () {
  var bloomKernel = 25;
  var bloomSigma = 4;
  var bloomRes = 8;

  this.addPass(new THREE.RenderPass(this.scene, this.camera));
  this.addPass(new THREE.BloomPass(0.75, bloomKernel, bloomSigma, Math.pow(2, bloomRes)));
  this.addPass(new THREE.ShaderPass(THREE.CopyShader), true);
};

MainScene.prototype.addPass = function (name, pass, renderToScreen) {
  if (typeof name === 'string') {
    this._passIndex[name] = pass;
  } else {
    renderToScreen = pass;
    pass = name;
  }

  pass.renderToScreen = renderToScreen || false;
  this.composer.addPass(pass);
  return pass;
};

MainScene.prototype.getPass = function (name) {
  return this._passIndex[name];
};

MainScene.prototype.enablePass = function (name) {
  var pass = this.getPass(name);
  if (!pass) { return; }
  pass.enabled = true;
};

MainScene.prototype.disablePass = function (name) {
  var pass = this.getPass(name);
  if (!pass) { return; }
  pass.enabled = false;
};

MainScene.prototype.initItems = function () {
  var medusae = this.medusae = App.Medusae.create({
    pxRatio : this.pxRatio
  });

  var dust = this.dust = App.Dust.create({
    pxRatio : this.pxRatio
  });

  medusae.addTo(this.scene);
  dust.addTo(this.scene);
};

MainScene.prototype.onWindowResize = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var pxRatio = this.pxRatio;
  var postWidth = width * pxRatio;
  var postHeight = height * pxRatio;

  this.width = width;
  this.height = height;

  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(width, height);
  this.composer.setSize(postWidth, postHeight);
};

// ..................................................
// Forces
//

MainScene.prototype.initForces = function () {
  var medusae = this.medusae;
  var gravityForce = this.gravityForce = Particulate.DirectionalForce.create();
  var nudgeRadius = 50;
  var nudgeForce = this.nudgeForce = App.PointRepulsorForce.create([20, 5, 0], {
    radius : nudgeRadius,
    intensity : 0
  });

  medusae.system.addForce(gravityForce);
  medusae.relax(100);
  medusae.system.addForce(nudgeForce);

  if (DEBUG_NUDGE) { this.initDebugNudge(nudgeRadius); }
};

MainScene.prototype.initDebugNudge = function (radius) {
  // var force = this.nudgeForce;
  var item = this.debugNudge = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 6),
    new THREE.MeshBasicMaterial({
      color : 0xffffff,
      wireframe : true
    }));

  this.scene.add(item);
};

MainScene.prototype.updateDebugNudge = function () {
  var force = this.nudgeForce;
  var position = force.position;
  var intensity = Math.max(force.intensity, 0.0001);
  var item = this.debugNudge;

  item.scale.set(intensity, intensity, intensity);
  item.position.set(position[0], position[1], position[2]);
};

// ..................................................
// Controls
//

MainScene.prototype.initControls = function () {
  var controls = new THREE.TrackballControls(this.camera, this.el);

  controls.rotateSpeed = 0.75;
  controls.zoomSpeed = 0.75;
  controls.panSpeed = 0.6;

  controls.noZoom = !ENABLE_ZOOM;
  controls.noPan = !ENABLE_PAN;
  controls.staticMoving = false;

  controls.dynamicDampingFactor = 0.2;
  controls.keys = [65, 17, 16];

  this.controls = controls;
  this.controlsUp = controls.object.up;
};

MainScene.prototype.onDocumentKey = function (event) {
  switch (event.which) {
  case 32:
    this.loop.toggle();
    event.preventDefault();
    break;
  }
};

// ..................................................
// Interaction
//

MainScene.prototype.onMouseDown = function (event) {
  this.didDrag = false;
};

MainScene.prototype.onMouseMove = function (event) {
  this.didDrag = true;
};

MainScene.prototype.onMouseUp = function (event) {
  if (this.didDrag) { return; }
  var mouse = this.mouse;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  this.nudgeMedusae();
  event.preventDefault();
};

MainScene.prototype.nudgeMedusae = (function () {
  var offset = new THREE.Vector3();

  return function () {
    var raycaster = this.raycaster;
    raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = raycaster.intersectObject(this.medusae.bulbMesh);
    if (!intersects.length) { return; }
    var nudge = this.nudgeForce;
    var point = intersects[0].point;
    var sound = Math.random() > 0.5 ? 'bubbles1' : 'bubbles2';

    offset.copy(point).normalize().multiplyScalar(20);
    point.add(offset);

    nudge.intensity = 1;
    nudge.set(point.x, point.y, point.z);

    this.audio.playSound(sound, 0.15);
  };
}());

// ..................................................
// Audio
//

MainScene.prototype.initAudio = function () {
  var audio = this.audio = App.AudioController.create({
    baseUrl : App.STATIC_URL + 'audio/',
    volume : 0.8
  });

  audio.addSound('bg-loop', 'bgLoop');
  audio.addSound('bubbles-1', 'bubbles1');
  audio.addSound('bubbles-2', 'bubbles2');

  audio.createSound('bgLoop', {
    loop : true,
    volume : 0
  });
};

MainScene.prototype.beginAudio = function () {
  var audio = this.audio;

  audio.playSound('bgLoop');
  audio.setVolume('bgLoop', 1);
  this._audioIsPlaying = true;
};

MainScene.prototype.pauseAudio = function () {
  var audio = this.audio;

  audio.setVolume('bgLoop', 0);
  this._audioIsPlaying = false;
};

MainScene.prototype.toggleAudio = function () {
  if (this._audioIsPlaying) {
    this.pauseAudio();
  } else {
    this.beginAudio();
  }
};

// ..................................................
// Vis
//

MainScene.prototype.toggleDots = function () {
  if (!this.medusae) { return; }
  this.medusae.toggleDots();
};

// ..................................................
// Loop
//

MainScene.prototype.update = function (delta) {
  var up = this.controlsUp;
  var gravity = this.gravity;
  var gravityForce = this.gravityForce;
  var nudgeForce = this.nudgeForce;

  gravityForce.set(up.x * gravity, up.y * gravity, up.z * gravity);
  nudgeForce.intensity *= 0.8;

  this.medusae.update(delta);
  this.audio.update(delta);

  if (DEBUG_NUDGE) { this.updateDebugNudge(delta); }
};

MainScene.prototype.render = function (delta, stepProgress) {
  // this.renderer.render(this.scene, this.camera);
  this.controls.update();
  this.medusae.updateGraphics(delta, stepProgress);
  this.dust.updateGraphics(delta, stepProgress);
  this.composer.render(0.01);
};
