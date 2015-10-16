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
  var ToggleComponent = App.ToggleComponent;
  var ModalComponent = App.ModalComponent;
  var ColorComponent = App.ColorComponent;
  var scene = App.MainScene.create();

  var keysTop = [85, 73, 79, 80];

  var dotsToggle = ToggleComponent.create({
    name : 'dots',
    key : keysTop[0]
  });

  var colorsToggle = ToggleComponent.create({
    name : 'colors',
    menu : 'colors',
    key : keysTop[1]
  });

  var audioToggle = ToggleComponent.create({
    name : 'audio',
    key : keysTop[2]
  });

  var postFxToggle = ToggleComponent.create({
    name : 'postfx',
    key : keysTop[3],
    isActive : scene.usePostFx
  });

  var simToggle = ToggleComponent.create({
    name : 'sim',
    key : 32,
    isActive : scene.shouldAnimate
  });

  ModalComponent.create({
    name : 'info'
  });

  scene.initItems();
  scene.initForces();
  scene.initAudio();
  scene.appendRenderer();
  scene.loop.start();

  scene.medusae.colors.forEach(function (color) {
    var controller = ColorComponent.create({
      label : color.label,
      color : color.uniform.value
    });

    controller.addListener('change', scene, 'makeDirty');
    colorsToggle.menuInner.appendChild(controller.element);
  });

  updateSystemUI(scene);

  audioToggle.addListener('toggle', scene, 'toggleAudio');
  postFxToggle.addListener('toggle', scene, 'togglePostFx');
  dotsToggle.addListener('toggle', scene, 'toggleDots');
  dotsToggle.addListener('toggle', App, 'toggleStats');
  simToggle.addListener('toggle', scene, 'toggleAnimate');

  scene.addListener('load:audio', function () {
    audioToggle.toggleState();
  });
});

App.register('tests', function tests() {
  document.body.className = 'testing';
});
