App.ColorComponent = ColorComponent;
function ColorComponent(opts) {
  opts = opts || {};

  var element = this.element = document.createElement('div');
  var input = this._input = document.createElement('input');
  var preview = this._previewEl = document.createElement('div');
  var label = this._labelEl = document.createElement('div');

  this.color = opts.color || new THREE.Color();
  this.setLabel(opts.label || '');
  this.setValue();
  this.syncState();

  element.className = this._className = 'color';
  preview.className = 'preview';
  label.className = 'label';

  input.setAttribute('type', 'color');
  element.appendChild(preview);
  element.appendChild(label);
  element.appendChild(input);

  input.addEventListener('change', this.syncState.bind(this), false);
  input.addEventListener('focus', this.focus.bind(this), false);
  input.addEventListener('blur', this.blur.bind(this), false);
}

ColorComponent.create = App.ctor(ColorComponent);
App.Dispatcher.extend(ColorComponent.prototype);

ColorComponent.prototype.setLabel = function (label) {
  this._labelEl.textContent = label;
};

ColorComponent.prototype.setValue = function (value) {
  value = value || ('#' + this.color.getHexString());
  this._input.setAttribute('value', value);
};

// FIXME: Losing focus when switching to color picker window
ColorComponent.prototype.focus = function (event) {
  this.element.className = this._className + ' focus';
};

ColorComponent.prototype.blur = function (event) {
  this.element.className = this._className;
};

ColorComponent.prototype.syncState = function (event) {
  var value = this._input.value;
  this._previewEl.style.background = value;
  this.color.setStyle(value);
  this.triggerListeners('change', value);
};
