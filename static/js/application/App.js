var App = Object.create({
  ctor : Particulate.ctor,
  log : (window.console && window.console.log.bind &&
    window.console.log.bind(window.console)) || function () {},

  shaders : window.App && window.App.shaders,

  _register : {},
  register : function (name, fn) {
    this._register[name] = fn;
  },

  run : function (name) {
    if (!this._register[name]) { return; }
    this._register[name].call(this);
  }
});

window.App = App;

// ..................................................
// Setup hooks
//

App.register('index', function index() {
  var scene = App.MainScene.create();
  var audioToggle = App.ToggleController.create({
    name : 'audio'
  });

  App.ModalController.create({
    name : 'info'
  });

  scene.initItems();
  scene.initForces();
  scene.initAudio();
  scene.appendRenderer();
  scene.loop.start();

  audioToggle.addListener(scene, 'toggleAudio');

  setTimeout(function () {
    audioToggle.toggleState();
  }, 2000);
});

App.register('tests', function tests() {
  document.body.className = 'testing';
});
