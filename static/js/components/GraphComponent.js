App.GraphComponent = GraphComponent;
function GraphComponent(opts) {
  opts = opts || {};

  this.max = 0;
  this.current = 0;

  this.updateFactor = opts.updateFactor || 0.1;
  this.drawOffset = opts.drawOffset || 2;
  this.pxRatio = opts.pixelRatio || window.devicePixelRatio;

  this.createBuffers();
  this.setSize(opts.width || 380, opts.height || 24);
  this.createLineBuffer();
  this.createElement();
  this.setLabel(opts.label || '');
}

GraphComponent.create = App.ctor(GraphComponent);

GraphComponent.prototype.setSize = function (width, height) {
  var pxRatio = this.pxRatio;

  this.width = width;
  this.height = height;
  this.fullWidth = width * pxRatio;
  this.fullHeight = height * pxRatio;

  this.canvas.width = this.buffer.width = this.fullWidth;
  this.canvas.height = this.buffer.height = this.fullHeight;

  this.canvas.style.width = width + 'px';
  this.canvas.style.height = height + 'px';
};

GraphComponent.prototype.appendTo = function (parent) {
  parent.appendChild(this.element);
};

GraphComponent.prototype.createElement = function () {
  var el = this.element = document.createElement('div');
  var labelContainer = document.createElement('div');
  var label = this._labelEl = document.createTextNode('');
  var value = this._valueEl = document.createTextNode('');
  var canvas = this.canvas;

  el.className = 'graph';
  labelContainer.className = 'label';

  el.appendChild(canvas);
  el.appendChild(labelContainer);

  labelContainer.appendChild(label);
  labelContainer.appendChild(value);
};

GraphComponent.prototype.setLabel = function (label) {
  this._labelEl.textContent = label + ' ';
};

GraphComponent.prototype.createBuffers = function () {
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.buffer = document.createElement('canvas');
  this.btx = this.buffer.getContext('2d');
};

GraphComponent.prototype.grayscale = function (v, a) {
  return 'rgba(' + [v, v, v, a].join(',') + ')';
};

GraphComponent.prototype.createLineBuffer = function () {
  var height = this.fullHeight;
  var pxRatio = this.pxRatio;

  var line = document.createElement('canvas');
  var ltx = line.getContext('2d');

  line.width = pxRatio;
  line.height = height * 2 + 10;

  ltx.fillStyle = this.grayscale(255, 0.7);
  ltx.fillRect(0, height, pxRatio, pxRatio);
  ltx.fillStyle = this.grayscale(255, 0.1);
  ltx.fillRect(0, height + 2 * pxRatio, pxRatio, height + 10);

  this.line = line;
};

GraphComponent.prototype.start = function () {
  this._startTime = Date.now();
};

GraphComponent.prototype.end = function () {
  this._endTime = Date.now();
};

GraphComponent.prototype.reset = function () {
  this._startTime = this._endTime = 0;
};

GraphComponent.prototype._startTime = 0;
GraphComponent.prototype._endTime = 0;
GraphComponent.prototype._textTick = 0;

GraphComponent.prototype.update = function (value, skipLabel) {
  var width = this.fullWidth;
  var height = this.fullHeight;
  var pxRatio = this.pxRatio;
  var drawOffset = this.drawOffset;

  var buffer = this.buffer;
  var canvas = this.canvas;
  var btx = this.btx;
  var ctx = this.ctx;

  var current, max;

  if (value == null) {
    value = this._endTime - this._startTime;
    current = this.current += (value - this.current) * this.updateFactor;
    max = this.max *= 0.99;
  } else {
    current = max = value;
  }

  if (current > max) {
    max = this.max = current;
  }

  btx.clearRect(0, 0, width, height);
  btx.drawImage(canvas, -drawOffset * pxRatio, 0, width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(buffer, 0, 0, width, height);
  ctx.drawImage(this.line,
    0, current * height / (max || 1), pxRatio, height,
    width - pxRatio, 0, pxRatio, height);

  if (!skipLabel && ++ this._textTick > 6) {
    this._textTick = 0;
    this._valueEl.textContent = current.toFixed(3);
  }

  this._startTime = this._endTime = 0;
};
