/*global requestAnimationFrame*/
App.Looper = Looper;
function Looper(context, update, render) {
  var _update = context[update];
  var _render = context[render];

  var stepTime = 0;
  var targetDelta = 1 / 5 * 1000;

  var isLooping = false;
  var lastTime;

  function animateStep(delta) {
    stepTime += delta;
    var steps = Math.floor(stepTime / targetDelta);

    if (steps > 0) {
      stepTime -= steps * targetDelta;
    }

    while (steps > 0) {
      _update.call(context, targetDelta);
      steps --;
    }
    
    var stepProgress = stepTime / targetDelta;
    _render.call(context, targetDelta, stepProgress);
  }

  function animate() {
    if (!isLooping) { return; }
    var time = Date.now();
    var delta = time - lastTime;

    animateStep(delta);
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
