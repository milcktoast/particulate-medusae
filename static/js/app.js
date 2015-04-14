var App = Object.create({
  ctor : Particulate.ctor,
  log : (window.console && window.console.log.bind &&
    window.console.log.bind(window.console)) || function () {}
});

App.shaders = window.App && window.App.shaders;
App.log('Particulate.js ' + Particulate.VERSION);
window.App = App;

require('js/utils/*');
require('js/forces/*');
require('js/materials/*');
require('js/items/*');
require('js/scenes/*');
require('js/controllers/*');

var scene = App.MainScene.create();
var audioToggle = App.ToggleController.create({
  name : 'audio'
});

App.ModalController.create({
  name : 'info'
});

setTimeout(function () {
  scene.initItems();
  scene.initForces();
  scene.initAudio();
  scene.appendRenderer();
  scene.loop.start();

  audioToggle.addListener(scene, 'toggleAudio');
}, 0);

setTimeout(function () {
  audioToggle.toggleState();
}, 2000);
