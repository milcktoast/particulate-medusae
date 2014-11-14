var shaders = window.App && window.App.shaders;
window.App = {
  shaders : shaders
};

require('js/helpers/*');
require('js/materials/*');
require('js/items/*');
require('js/scenes/*');
require('js/router');

var scene = App.MainScene.create();
scene.animate();
