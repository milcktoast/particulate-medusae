App.ToggleComponent = ToggleComponent;
function ToggleComponent(config) {
  var name = config.name;
  var menu = config.menu;
  var key = config.key;
  var toggle = this.toggle = document.getElementById('toggle-' + name);

  if (menu) {
    this.menu = document.getElementById('menu-' + menu);
    this.menuInner = this.menu.getElementsByClassName('inner')[0];
    this._menuClassName = this.menu.className;
    toggle.className += ' has-menu';
  }

  if (key) {
    this.keyDelegator.addBinding(key, this, 'toggleState');
  }

  this.isActive = config.isActive != null ? config.isActive : false;
  this._toggleClassName = toggle.className;
  this._listeners = [];

  this.syncState();
  toggle.addEventListener('click', this.toggleState.bind(this), false);
}

ToggleComponent.create = App.ctor(ToggleComponent);

ToggleComponent.prototype.addListener = function (context, fn) {
  this._listeners.push({
    context : context,
    fn : fn
  });
};

ToggleComponent.prototype.triggerListeners = function () {
  var listeners = this._listeners;
  var listener;

  for (var i = 0, il = listeners.length; i < il; i ++) {
    listener = listeners[i];
    listener.context[listener.fn].call(listener.context, this.isActive);
  }
};

ToggleComponent.prototype.toggleState = function (event) {
  this.isActive = !this.isActive;
  this.syncState();
  this.triggerListeners();
};

ToggleComponent.prototype.syncState = function () {
  this.updateElClass(this.toggle, this._toggleClassName);
  this.updateElClass(this.menu, this._menuClassName);
  this.updateElHeight(this.menu, this.menuInner);
};

ToggleComponent.prototype.updateElClass = function (element, className) {
  if (!element) { return; }
  if (this.isActive) {
    element.className += ' active';
  } else {
    element.className = className;
  }
};

ToggleComponent.prototype.updateElHeight = function (element, inner) {
  if (!element) { return; }
  if (this.isActive) {
    element.style.height = inner.offsetHeight + 'px';
  } else {
    element.style.height = '';
  }
};

ToggleComponent.prototype.keyDelegator = App.KeyDelegator.create();
