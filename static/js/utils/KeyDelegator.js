App.KeyDelegator = KeyDelegator;
function KeyDelegator() {
  this._bindings = {};
  document.addEventListener('keyup', this.onDocumentKey.bind(this), false);
}

KeyDelegator.create = App.ctor(KeyDelegator);

KeyDelegator.prototype.addBinding = function (key, context, fn) {
  this._bindings[key] = {
    context : context,
    fn : fn
  };
};

KeyDelegator.prototype.onDocumentKey = function (event) {
  var binding = this._bindings[event.which];
  if (!binding) { return; }

  binding.context[binding.fn].call(binding.context, event);
};
