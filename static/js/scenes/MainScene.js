var PMath = Particulate.Math;
var Tweens = App.Tweens;

var ENABLE_ZOOM = true;
var ENABLE_PAN = false;
var DEBUG_NUDGE = false;

App.MainScene = MainScene;
function MainScene() {
  var scene = this.scene = new THREE.Scene();
  var camera = this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);
  var el = this.element = document.getElementById('container');
  this.statsElement = document.getElementById('container-graphs');

  this.mouse = new THREE.Vector2();
  this.raycaster = new THREE.Raycaster();
  this.nudgeIndex = 0;

  this.pxRatio = PMath.clamp(1.5, 2, window.devicePixelRatio);
  this.gravity = -2;

  this.usePostFx = true;
  this.shouldAnimate = true;

  this.initRenderer();
  this.initFxComposer();
  this.addPostFx();
  this.initControls();
  this.initStats();
  this.onWindowResize();

  var aspect = this.camera.aspect;
  camera.position.set(600 / aspect, 300 / aspect, 0);
  camera.lookAt(scene.position);

  this.loop = App.Looper.create(this, 'update', 'preRender', 1 / 30 * 1000);

  el.addEventListener('mousedown', this.onMouseDown.bind(this), false);
  el.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  el.addEventListener('mouseup', this.onMouseUp.bind(this), false);

  window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

MainScene.create = App.ctor(MainScene);
App.Dispatcher.extend(MainScene.prototype);

// ..................................................
// Graphics
//

MainScene.prototype.initRenderer = function () {
  var renderer = this.renderer = new THREE.WebGLRenderer({
    antialias : false
  });

  this.updateClearColor();
  renderer.setPixelRatio(this.pxRatio);
  renderer.autoClear = false;
};

MainScene.prototype.updateClearColor = function () {
  var color = this.usePostFx ? 0x0A060E : 0x100A17;
  this.renderer.setClearColor(color, 1);
};

MainScene.prototype.appendRenderer = function () {
  var canvas = this.renderer.domElement;

  this.element.appendChild(canvas);
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
  var bloomStrength = 0.8;
  var bloomKernel = 25;
  var bloomSigma = 8;
  var bloomRes = 512;

  var renderPass = new THREE.RenderPass(this.scene, this.camera);
  var bloomPass = new THREE.BloomPass(bloomStrength, bloomKernel, bloomSigma, bloomRes);
  var copyPass = new THREE.ShaderPass(THREE.CopyShader);

  var lensDirtPass = this.lensDirtPass = new App.LensDirtPass({
    quads : 200,
    textureSize : 2048
  });

  this.addPass(renderPass);
  this.addPass(bloomPass);
  this.addPass(lensDirtPass);
  this.addPass(copyPass, true);
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

MainScene.prototype.makeDirty = function () {
  this.needsRender = true;
};

MainScene.prototype.togglePostFx = function (isEnabled) {
  this.usePostFx = isEnabled;
  this.updateClearColor();
  this.needsRender = true;
};

// TODO: Improve calculation of zoom range
MainScene.prototype.onWindowResize = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var pxRatio = this.pxRatio;

  var postWidth = width * pxRatio;
  var postHeight = height * pxRatio;
  var aspect = width / height;
  var minDistance = 300 / aspect;
  var maxDistance = 1200 / aspect;

  this.width = width;
  this.height = height;

  this.camera.aspect = aspect;
  this.camera.updateProjectionMatrix();

  this.controls.minDistance = minDistance;
  this.controls.maxDistance = maxDistance;
  this.controls.handleResize();

  this.mapDistance = Tweens.mapRange(minDistance, maxDistance, 0, 1);
  this.mapSoundDistance = Tweens.mapRange(minDistance, maxDistance * 1.3, 0, 1);

  this.renderer.setSize(width, height);
  this.composer.setSize(postWidth, postHeight);
  this.lensDirtPass.setSize(postWidth, postHeight);
  this.needsRender = true;
};

// ..................................................
// Forces
//

MainScene.prototype.initForces = function () {
  var medusae = this.medusae;
  var gravityForce = Particulate.DirectionalForce.create([0, this.gravity, 0]);
  var nudgeRadius = 50;
  var nudgeForce = App.PointRepulsorForce.create([20, 5, 0], {
    radius : nudgeRadius,
    intensity : 0
  });

  medusae.system.addForce(gravityForce);
  medusae.system.addForce(nudgeForce);

  this.gravityForce = gravityForce;
  this.nudgeForce = nudgeForce;

  if (DEBUG_NUDGE) { this.initDebugNudge(nudgeRadius); }
};

MainScene.prototype.initDebugNudge = function (radius) {
  var item = this.debugNudge = new THREE.Mesh(
    new THREE.SphereBufferGeometry(radius, 8, 6),
    new THREE.MeshBasicMaterial({
      color : 0xffffff,
      opacity : 0.2,
      transparent : true
    }));

  var wire = new THREE.WireframeHelper(item, 0xffffff);

  this.scene.add(wire);
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
  var controls = new THREE.TrackballControls(this.camera, this.element);

  controls.rotateSpeed = 0.75;
  controls.zoomSpeed = 0.75;
  controls.panSpeed = 0.6;

  controls.noZoom = !ENABLE_ZOOM;
  controls.noPan = !ENABLE_PAN;
  controls.staticMoving = false;

  controls.dynamicDampingFactor = 0.2;
  controls.keys = [65, 17, 16];

  controls.addEventListener('change', this.onControlsChange.bind(this));

  this.controls = controls;
};

MainScene.prototype.onControlsChange = function () {
  this.needsRender = true;
};

MainScene.prototype.toggleAnimate = function (event) {
  this.shouldAnimate = !this.shouldAnimate;
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
  if (this.didDrag || !this.shouldAnimate) { return; }
  var mouse = this.mouse;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  this.nudgeMedusae();
  event.preventDefault();
};

MainScene.prototype.nudgeMedusae = (function () {
  var offset = new THREE.Vector3();

  return function () {
    var lastNudge = this.lastNudge;
    var timeDiff = Date.now() - lastNudge;
    if (timeDiff < 250) { return; }
    if (timeDiff > 800) {
      this.nudgeIndex = 0;
    }

    var bubbles = this.sounds.bubbles;
    var nudgeIndex = this.nudgeIndex;
    if (nudgeIndex > bubbles.length - 1) { return; }

    var raycaster = this.raycaster;
    var mouse = this.mouse;
    var sound = bubbles[nudgeIndex];

    raycaster.setFromCamera(mouse, this.camera);

    var intersects = raycaster.intersectObject(this.medusae.bulbMesh);
    if (!intersects.length) { return; }
    var nudge = this.nudgeForce;
    var point = intersects[0].point;
    var spots = nudgeIndex * 5;
    var intensity = (nudgeIndex + 1) / (bubbles.length) + 0.5;

    offset.copy(point).normalize().multiplyScalar(15);
    point.add(offset);

    nudge.intensity = intensity;
    nudge.set(point.x, point.y, point.z);

    sound.volume(0.15).play();
    this.lensDirtPass.setGroup(spots, mouse.x, mouse.y, 0.8);

    this.lastNudge = Date.now();
    this.nudgeIndex ++;
  };
}());

// ..................................................
// Audio
//

MainScene.prototype.initAudio = function () {
  var audio = this.audio = App.AudioController.create({
    baseUrl : App.STATIC_URL + 'audio/'
  });

  this.sounds = {};
  this.createBackgroundSound();
  this.createWaveSounds();
  this.createBubbleSounds();

  this.sounds.bg.on('load', function () {
    audio.addListener('mute', this, 'muteSounds');
    audio.addListener('unmute', this, 'unmuteSounds');
    this.medusae.addListener('phase:top', this, 'audioPhaseTop');
    this.triggerListeners('load:audio');
  }.bind(this));
};

MainScene.prototype.createBackgroundSound = function () {
  var bg = this.sounds.bg = this.audio.createSound('bg-loop');

  bg.__pos = 0;
  bg.__duration = Infinity;

  bg.on('load', function () {
    bg.__duration = Math.floor(bg._duration) * 1000;
    bg.play();
  }.bind(this));
};

MainScene.prototype.createWaveSounds = function () {
  var audio = this.audio;
  var waves = this.sounds.waves = [];

  for (var i = 0; i < 5; i ++) {
    waves.push(audio.createSound('buzz-wave-2'));
  }
};

MainScene.prototype.createBubbleSounds = function () {
  var audio = this.audio;
  var bubbles = this.sounds.bubbles = [];

  for (var i = 0; i < 2; i ++) {
    bubbles.push(audio.createSound('bubbles-2'));
  }

  bubbles.push(audio.createSound('bubbles-1'));
};

MainScene.prototype.muteSounds = function () {
  this.sounds.bg.pause();
};

MainScene.prototype.unmuteSounds = function () {
  this.sounds.bg.play();
};

MainScene.prototype.beginAudio = function () {
  this.audio.volume = 0.8;
  this.audioIsPlaying = true;
};

MainScene.prototype.pauseAudio = function () {
  this.audio.volume = 0;
  this.audioIsPlaying = false;
};

MainScene.prototype.toggleAudio = function () {
  if (this.audioIsPlaying) {
    this.pauseAudio();
  } else {
    this.beginAudio();
  }
};

MainScene.prototype.audioPhaseTop = function () {
  var waves = this.sounds.waves;
  var index = this.waveIndex;

  if (!index || index > waves.length - 1) {
    index = this.waveIndex = 0;
  }

  waves[index].volume(0.08).play();
  this.waveIndex ++;
};

// ..................................................
// Vis
//

// TODO: Improve naming
MainScene.prototype.toggleDots = function () {
  if (!this.medusae) { return; }
  this._renderStats = !this._renderStats;
  this.medusae.toggleDots();
};

// ..................................................
// Stats
//

MainScene.prototype.initStats = function () {
  var el = this.statsElement;

  this.statsPhysics = App.GraphComponent.create({
    label : 'Physics (ms)'
  });

  this.statsGraphics = App.GraphComponent.create({
    label : 'Graphics (ms)',
    updateFactor : 0.025
  });

  this.statsPost = App.GraphComponent.create({
    label : 'Post FX (ms)',
    updateFactor : 0.025
  });

  this.statsPhysics.appendTo(el);
  this.statsGraphics.appendTo(el);
  this.statsPost.appendTo(el);
};

// ..................................................
// Loop
//

MainScene.prototype.update = function (delta) {
  var medusae = this.medusae;
  var nudgeForce = this.nudgeForce;

  var distance = this.camera.position.length();
  var distNorm = this.mapDistance(distance);
  var distSound = this.mapSoundDistance(distance);
  var lineWidth = Math.max(0.5, Math.round((1 - distNorm) * 2 * 1.5) / 2);

  medusae.updateLineWidth(lineWidth);
  nudgeForce.intensity *= 0.8;

  if (this.shouldAnimate) {
    this.statsPhysics.start();
    medusae.update(delta);
    this.statsPhysics.end();
    this.lensDirtPass.update(delta);
  }

  if (!this.audio.isMuted) {
    this.updateSounds(delta);
  }

  this.audio.distance = distSound;
  this.audio.update(delta);

  if (DEBUG_NUDGE) { this.updateDebugNudge(delta); }
};

MainScene.prototype.updateSounds = function (delta) {
  var sounds = this.sounds;
  var bg = sounds.bg;

  bg.__pos += delta;

  if (bg.__pos > bg.__duration) {
    bg.pos(0);
    bg.__pos = 0;
  }
};

MainScene.prototype.preRender = function (delta, stepProgress) {
  this.controls.update();
  this.medusae.updateTweens(delta);

  if (this.shouldAnimate || this.needsRender || this.medusae.needsRender) {
    this.render(delta, stepProgress);
    this.needsRender = false;
  } else {
    this.statsGraphics.reset();
    this.statsPost.reset();
  }

  if (this._renderStats) {
    if (this.loop.didUpdate) {
      this.statsPhysics.update();
    } else {
      this.statsPhysics.update(0, true);
    }

    this.statsGraphics.update();
    this.statsPost.update();
  }
};

MainScene.prototype.render = function (delta, stepProgress) {
  this.statsGraphics.start();

  if (this.shouldAnimate) {
    this.medusae.updateGraphics(delta, stepProgress);
    this.dust.updateGraphics(delta, stepProgress);
  }

  if (this.usePostFx) {
    this.statsPost.start();
    this.composer.render(0.01);
    this.statsPost.end();
  } else {
    this.statsPost.reset();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  this.statsGraphics.end();
};
