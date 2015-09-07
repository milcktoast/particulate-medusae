var Dispatcher = App.Dispatcher = {};

Dispatcher.extend = function (proto) {
  proto.addListener = addListener;
  proto.triggerListeners = triggerListeners;
};

function addListener(type, context, fn) {
  var listeners = this._listeners;
  if (!listeners) { listeners = this._listeners = {}; }
  if (!listeners[type]) { listeners[type] = []; }

  listeners[type].push({
    context : context,
    fn : fn
  });
}

 function triggerListeners(type, event) {
  var listeners = this._listeners && this._listeners[type];
  if (!listeners) { return; }
  var listener;

  for (var i = 0, il = listeners.length; i < il; i ++) {
    listener = listeners[i];
    listener.context[listener.fn].call(listener.context, event);
  }
}
