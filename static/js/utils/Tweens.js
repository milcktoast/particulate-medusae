var Tweens = App.Tweens = {};

Tweens.mapRange = function (a0, a1, b0, b1) {
  if (arguments.length === 2) {
    b1 = a1[1];
    b0 = a1[0];
    a1 = a0[1];
    a0 = a0[0];
  }

  var rangeAInv = 1 / (a1 - a0);
  var rangeB = b1 - b0;

  return function (x) {
    var t = (x - a0) * rangeAInv;
    return b0 + t * rangeB;
  };
};

// Tween to target by difference factor
Tweens.factorTween = function (context, defaultFactor) {
  return function (name, target, instanceFactor) {
    var state = context[name];
    if (state == null) { state = context[name] = target; }
    var factor = instanceFactor || defaultFactor;

    return context[name] += (target - state) * factor;
  };
};

// Tween to target by fixed step
Tweens.stepTween = function (context, defaultStep) {
  return function (name, target, instanceStep) {
    var state = context[name];
    if (state == null) { state = context[name] = target; }
    if (state === target) { return state; }
    var step = instanceStep || defaultStep;
    var dir = state < target ? 1 : -1;

    if ((target - state) * dir < step) {
      context[name] = target;
      return state;
    }

    return context[name] += step * dir;
  };
};
