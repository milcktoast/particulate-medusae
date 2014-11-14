App.MainScene = MainScene;
function MainScene() {
  this.el = document.getElementById('container');
  this.renderer = new THREE.WebGLRenderer({antialias: false});
  this.renderer.setClearColor(0x111111, 1);
  this.el.appendChild(this.renderer.domElement);

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 5, 3500);
  this.gravity = -0.001;

  this.initItems();
  this.initLights();
  this.initControls();
  this.onWindowResize();

  this.animate = this.animate.bind(this);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

MainScene.create = Particulate.ctor(MainScene);

MainScene.prototype.initItems = function () {
  var medusae = this.medusae = App.Medusae.create();
  var gravityForce = this.gravityForce = Particulate.DirectionalForce.create();

  medusae.system.addForce(gravityForce);
  medusae.addTo(this.scene);
};

MainScene.prototype.initLights = function () {
  var light = new THREE.PointLight(0xffffff, 1, 0);

  light.position.set(200, 100, 0);
  this.camera.position.set(200, 100, 0);
  this.scene.add(light);
};

MainScene.prototype.initControls = function () {
  var controls = new THREE.TrackballControls(this.camera, this.el);
  controls.rotateSpeed = 1.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.9;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
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

MainScene.prototype.update = function () {
  var up = this.controlsUp;
  var gravity = this.gravity;

  this.gravityForce.set(up.x * gravity, up.y * gravity, up.z * gravity);
  this.medusae.update();
  this.controls.update();
};

MainScene.prototype.render = function () {
  this.renderer.render(this.scene, this.camera);
};

MainScene.prototype.animate = function () {
  window.requestAnimationFrame(this.animate);
  this.update();
  this.render();
};
