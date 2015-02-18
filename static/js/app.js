var App = Object.create({
  log : (window.console && window.console.log.bind(window.console)) || function () {},
  ctor : Particulate.ctor
});

App.shaders = window.App && window.App.shaders;
App.log('Particulate.js ' + Particulate.VERSION);
window.App = App;

require('js/utils/*');
require('js/materials/*');
require('js/items/*');
require('js/scenes/*');
require('js/controllers/*');

App.ModalController.create({
  name : 'info'
});

setTimeout(function () {
  var scene = App.MainScene.create();
  scene.loop.start();
}, 0);
