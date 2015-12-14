require('js/application/App');
require('js/utils/*');
require('js/components/*');
require('js/constraints/*');
require('js/forces/*');
require('js/materials/*');
require('js/post-processing/*');
require('js/items/*');
require('js/controllers/*');
require('js/scenes/*');

setTimeout(function setup() {
  var DEBUG = true;
  if (DEBUG && location.search.indexOf('test=true') > -1) {
    App.run('tests');
  } else {
    App.run('index');
    App.log('Particulate.js ' + Particulate.VERSION);
  }
}, 0);
