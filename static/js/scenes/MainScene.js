var ENABLE_ZOOM = true;
var ENABLE_PAN = false;

App.MainScene = MainScene;
function MainScene() {
  var scene = this.scene = new THREE.Scene();
  var camera = this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);

  this.el = document.getElementById('container');
  this.pxRatio = window.devicePixelRatio;
  this.gravity = -0.9;

  this.initRenderer();
  this.initFxComposer();
  this.addPostFx();
  this.onWindowResize();

  this.initControls();
  this.initItems();

  camera.position.set(200, 100, 0);
  camera.lookAt(scene.position);

  this.loop = App.Looper.create(this, 'update', 'render', 1 / 30 * 1000);

  document.addEventListener('keyup', this.onDocumentKey.bind(this), false);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

MainScene.create = App.ctor(MainScene);

MainScene.prototype.initRenderer = function () {
  var renderer = this.renderer = new THREE.WebGLRenderer({
    devicePixelRatio : this.pxRatio,
    antialias : false
  });

  renderer.setClearColor(0x111111, 1);
  renderer.autoClear = false;

  this.el.appendChild(renderer.domElement);
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

MainScene.prototype.addPostFx = function () {
  this.addPass(new THREE.RenderPass(this.scene, this.camera));
  this.addPass(new THREE.BloomPass(0.8, 25, 4, 256));
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

  var gravityForce = this.gravityForce = Particulate.DirectionalForce.create();

  medusae.system.addForce(gravityForce);
  medusae.relax(100);
  medusae.addTo(this.scene);
  dust.addTo(this.scene);
};

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

MainScene.prototype.onDocumentKey = function (event) {
  switch (event.which) {
  case 32:
    this.loop.toggle();
    event.preventDefault();
    break;
  }
};

MainScene.prototype.update = function (delta) {
  var up = this.controlsUp;
  var gravity = this.gravity;

  this.gravityForce.set(up.x * gravity, up.y * gravity, up.z * gravity);
  this.medusae.update(delta);
};

MainScene.prototype.render = function (delta, stepProgress) {
  // this.renderer.render(this.scene, this.camera);
  this.controls.update();
  this.medusae.updateGraphics(delta, stepProgress);
  this.dust.updateGraphics(delta, stepProgress);
  this.composer.render(0.01);
};
