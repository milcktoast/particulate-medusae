App.ModalComponent = ModalComponent;
function ModalComponent(config) {
  var name = config.name;
  var cover = document.getElementById('cover-' + name);
  var toggle = this.toggle = document.getElementById('toggle-' + name);
  var modal = this.modal = document.getElementById(name);

  this.isActive = false;
  this._toggleClassName = toggle.className;
  this._modalClassName = modal.className;

  toggle.addEventListener('click', this.toggleState.bind(this), false);
  cover.addEventListener('click', this.toggleState.bind(this), false);
}

ModalComponent.create = App.ctor(ModalComponent);

ModalComponent.prototype.toggleState = function (event) {
  if (this.isActive) {
    this.modal.className = this._modalClassName;
    this.toggle.className = this._toggleClassName;
    this.isActive = false;
  } else {
    this.modal.className += ' active';
    this.toggle.className += ' active';
    this.isActive = true;
  }
};
