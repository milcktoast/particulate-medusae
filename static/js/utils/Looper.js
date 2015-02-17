/*global requestAnimationFrame*/
App.Looper = Looper;
function Looper(context, update, render) {
  var _update = context[update];
  var _render = context[render];
  var isLooping = false;
  var lastTime;

  function animate() {
    if (!isLooping) { return; }
    var time = Date.now();
    var delta = time - lastTime;

    _update.call(context, delta);
    _render.call(context, delta);
    requestAnimationFrame(animate);
    lastTime = time;
  }

  this.stop = function () {
    isLooping = false;
  };

  this.start = function () {
    lastTime = Date.now();
    isLooping = true;
    animate();
  };

  this.toggle = function () {
    if (isLooping) { this.stop(); }
    else { this.start(); }
  };
}

Looper.create = App.ctor(Looper);
