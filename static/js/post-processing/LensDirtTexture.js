App.LensDirtTexture = LensDirtTexture;
function LensDirtTexture(size, cells, opts) {
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.drawTexture(size, cells, opts);
}

LensDirtTexture.prototype.grayscaleColor = function (start, range, alpha) {
  var c = Math.floor(Math.random() * range) + start;
  return 'rgba(' + [c, c, c, alpha].join(',') + ')';
};

LensDirtTexture.prototype.createGradients = function (ctx, count, radius) {
  var step = Math.PI * 2 / (count + 1);
  var angle = 0;

  var gradients = [];
  var colorA, colorB, alphaA, alphaB;
  var gradient, gx0, gy0, gx1, gy1;

  for (var i = 0; i < count; i ++) {
    gx0 = Math.cos(angle) * radius;
    gy0 = Math.sin(angle) * radius;
    gx1 = Math.cos(angle + Math.PI) * radius;
    gy1 = Math.sin(angle + Math.PI) * radius;

    alphaA = Math.random() * 0.1;
    alphaB = Math.random() * 0.5;
    colorA = this.grayscaleColor(100, 100, alphaA);
    colorB = this.grayscaleColor(100, 100, alphaB);

    gradient = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
    gradient.addColorStop(0.2, colorA);
    gradient.addColorStop(0.8, colorB);
    gradients.push(gradient);
    gradient._alpha = alphaB;

    angle += step;
  }

  return gradients;
};

LensDirtTexture.prototype.drawBlob = function (ctx, rx, ry, segments) {
  var step = Math.PI * 2 / segments;
  var angle = 0;
  var sx = Math.random() * 100;
  var sy = Math.random() * 100;
  var x, y, nx, ny;

  ctx.beginPath();

  for (var i = 0, il = segments - 1; i < il; i ++) {
    x = Math.cos(angle) * rx;
    y = Math.sin(angle) * ry;
    nx = (sx + x) * 0.01;
    ny = (sy + y) * 0.01;
    x += noise.simplex2(nx, ny) * 5;
    y += noise.simplex2(nx, ny) * 5;

    angle += step;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
};

LensDirtTexture.prototype.drawShadow = function (ctx, iterations) {
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = this.grayscaleColor(200, 10, 1);

  for (var i = 0; i < iterations; i ++) {
    ctx.stroke();
  }

  ctx.restore();
};

LensDirtTexture.prototype.drawTexture = function (size, cells, opts) {
  opts = opts || {};

  var canvas = this.canvas;
  var ctx = this.ctx;

  var detail = opts.detail || 10;
  var cellPad = opts.cellPad || 10;

  var cellSize = size / cells;
  var cellSizeHalf = cellSize * 0.5;
  var blobRad = (cellSize - cellPad) * 0.5;
  var blobRadHalf = blobRad * 0.5;

  var gradients = this.createGradients(ctx, cells, cellSize);
  var gradient, gi, rx, ry;

  canvas.width = canvas.height = size;
  ctx.lineWidth = 1;

  for (var i = 0; i < cells; i ++) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(0, cellSize * i + cellSizeHalf);

    for (var j = 0; j < cells; j ++) {
      ctx.translate(j === 0 ? cellSizeHalf : cellSize, 0);
      rx = Math.random() * blobRadHalf + blobRadHalf;
      ry = Math.random() * blobRadHalf + blobRadHalf;
      gi = Math.floor(Math.random() * gradients.length);
      gradient = gradients[gi];

      ctx.fillStyle = gradient;
      ctx.strokeStyle = this.grayscaleColor(
        60, 30, gradient._alpha * 0.5);

      this.drawBlob(ctx, rx, ry, detail);
      this.drawShadow(ctx, 2);
    }
  }

  this.texture.needsUpdate = true;
};
