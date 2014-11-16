var ENABLE_ZOOM = false;
var ENABLE_PAN = false;

App.MainScene = MainScene;
function MainScene() {
  var scene = this.scene = new THREE.Scene();
  var camera = this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);

  this.el = document.getElementById('container');
  this.pxRatio = window.devicePixelRatio;
  this.gravity = -0.001;

  this.initRenderer();
  this.initItems();
  this.initControls();
  this.onWindowResize();

  camera.position.set(200, 100, 0);
  camera.lookAt(scene.position);

  this.loop = App.Looper.create(this, 'update', 'render');

  document.addEventListener('keyup', this.onDocumentKey.bind(this), false);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

MainScene.create = Particulate.ctor(MainScene);

MainScene.prototype.initRenderer = function () {
  this.renderer = new THREE.WebGLRenderer({
    devicePixelRatio : this.pxRatio,
    antialias : false
  });

  this.renderer.setClearColor(0x111111, 1);
  this.el.appendChild(this.renderer.domElement);
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
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.camera.aspect = this.width / this.height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width, this.height);
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
  this.dust.update(delta);
  this.controls.update();
};

MainScene.prototype.render = function () {
  this.renderer.render(this.scene, this.camera);
};
