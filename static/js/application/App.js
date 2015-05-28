var App = Object.create({
  ctor : Particulate.ctor,
  log : (window.console && window.console.log.bind &&
    window.console.log.bind(window.console)) || function () {},

  shaders : window.App && window.App.shaders,
  showStats : false,

  _register : {},
  register : function (name, fn) {
    this._register[name] = fn;
  },

  run : function (name) {
    if (!this._register[name]) { return; }
    this._register[name].call(this);
  },

  toggleStats : function () {
    document.body.classList.toggle('show-info');
  }
});

window.App = App;

function updateSystemUI(scene) {
  var Format = App.Format;
  var system = scene.medusae.system;
  var particleEl = document.getElementById('particle-count');
  var constraintEl = document.getElementById('constraint-count');
  var forceEl = document.getElementById('force-count');

  var constraintCount = system._localConstraints.reduce(function (prev, current) {
    return prev + current._count;
  }, 0);

  particleEl.textContent = Format.number(system._count);
  constraintEl.textContent = Format.number(constraintCount);
  forceEl.textContent = Format.number(system._forces.length);
}

// ..................................................
// Setup hooks
//

App.register('index', function index() {
  var scene = App.MainScene.create();
  var audioToggle = App.ToggleComponent.create({ name : 'audio' });
  var dotsToggle = App.ToggleComponent.create({ name : 'dots' });

  var postFxToggle = App.ToggleComponent.create({
    name : 'postfx',
    isActive : scene.usePostFx
  });

  App.ModalComponent.create({
    name : 'info'
  });

  scene.initItems();
  scene.initForces();
  scene.initAudio();
  scene.appendRenderer();
  scene.loop.start();

  updateSystemUI(scene);

  audioToggle.addListener(scene, 'toggleAudio');
  postFxToggle.addListener(scene, 'togglePostFx');
  dotsToggle.addListener(scene, 'toggleDots');
  dotsToggle.addListener(App, 'toggleStats');

  setTimeout(function () {
    audioToggle.toggleState();
  }, 2000);
});

App.register('tests', function tests() {
  document.body.className = 'testing';
});
