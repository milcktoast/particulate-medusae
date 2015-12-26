App.ToggleComponent = ToggleComponent;
function ToggleComponent(config) {
  var name = config.name;
  var toggle = this.toggle = document.getElementById('toggle-' + name);

  this.setupKey(config.key);
  this.setupMenu(config.menu);

  this.isActive = config.isActive != null ? config.isActive : false;
  this._toggleClassName = toggle.className;
  this.syncState();

  toggle.addEventListener('click', this.toggleState.bind(this), false);
}

ToggleComponent.create = App.ctor(ToggleComponent);
App.Dispatcher.extend(ToggleComponent.prototype);

ToggleComponent.prototype.setupKey = function (key) {
  if (!key) { return; }
  this.keyDelegator.addBinding(key, this, 'toggleState');
};

ToggleComponent.prototype.setupMenu = function (name) {
  if (!name) { return; }

  var menu = this.menu = document.getElementById('menu-' + name);
  var inner = this.menuInner = document.createElement('div');

  inner.className = 'inner';
  menu.appendChild(inner);

  this._menuClassName = menu.className;
  this.toggle.className += ' has-menu';
};

ToggleComponent.prototype.toggleState = function (event) {
  this.isActive = !this.isActive;
  this.syncState();
  this.triggerListeners('toggle', this.isActive);
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
    this._willBecomeVisible = setTimeout(
      this.becomeVisible.bind(null, element), 200);
  } else {
    element.style.height = '';
  }
};

ToggleComponent.prototype.becomeVisible = function (element) {
  element.className += ' visible';
};

ToggleComponent.prototype.hide = function () {
  this.toggle.className += ' hidden';
  this.menu.className += ' hidden';
};

ToggleComponent.prototype.keyDelegator = App.KeyDelegator.create();
