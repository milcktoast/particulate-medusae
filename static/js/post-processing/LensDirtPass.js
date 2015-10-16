require('./LensDirtTexture');

App.LensDirtPass = LensDirtPass;
function LensDirtPass(opts) {
  opts = opts || {};

  var quads = opts.quads || 100;
  var textureSize = opts.textureSize || 1024;
  var textureCells = opts.textureCells || 10;
  var textureCellPad = opts.textureCellPad || 20;
  var textureDetail = opts.textureDetail || 50;

  this.renderToScreen = false;
  this.enabled = true;
  this.needsSwap = false;
  this.clear = false;

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.scale = 1;

  this.textureMap = new App.LensDirtTexture(textureSize, textureCells, {
    detail : textureDetail,
    cellPad : textureCellPad
  });

  this.geom = this.createQuadGeom(quads, textureCells);
  this.mesh = new THREE.Mesh(this.geom, new App.AlphaMaterial({
    color : 0xffffff,
    opacity : 0.5,
    map : this.textureMap.texture,
    blending : THREE.AdditiveBlending,
    transparent : true
  }));

  this.scene.add(this.mesh);

  this._quadIndex = 0;
  this._quadCount = quads;
}

LensDirtPass.prototype.setSize = function (width, height) {
  var camera = this.camera;
  var w, h, s;

  if (width > height) {
    w = 1;
    h = s = height / width;
  } else {
    w = s = width / height;
    h = 1;
  }

  camera.left = -w;
  camera.right = w;
  camera.top = h;
  camera.bottom = -h;
  this.scale = s;

  camera.updateProjectionMatrix();
};

// ..................................................
// Quad geometry
//

LensDirtPass.prototype._quadGeomPosition = function (count) {
  var verts = new Float32Array(count * 4 * 3);
  var positionAttr = new THREE.BufferAttribute(verts, 3);

  return positionAttr;
};

LensDirtPass.prototype._quadGeomIndex = function (count) {
  var indices = new Uint16Array(count * 6);
  var indexAttr = new THREE.BufferAttribute(indices, 1);
  var qi = 0, qj = 0;
  var a, b, c, d;

  for (var i = 0; i < count; i ++) {
    a = qi;
    b = qi + 1;
    c = qi + 2;
    d = qi + 3;

    indices[qj]     = a;
    indices[qj + 1] = b;
    indices[qj + 2] = c;
    indices[qj + 3] = c;
    indices[qj + 4] = d;
    indices[qj + 5] = a;

    qi += 4;
    qj += 6;
  }

  return indexAttr;
};

LensDirtPass.prototype._quadGeomUv = function (count, cells) {
  var uvs = new Float32Array(count * 4 * 2);
  var uvAttr = new THREE.BufferAttribute(uvs, 2);
  var step = 1 / cells;
  var qi = 0, row = 0, col = 0;

  for (var i = 0; i < count; i ++) {
    uvs[qi]     = uvs[qi + 6] = step * col;       // au, du
    uvs[qi + 1] = uvs[qi + 3] = step * row;       // av, bv
    uvs[qi + 2] = uvs[qi + 4] = step * (col + 1); // bu, cu
    uvs[qi + 5] = uvs[qi + 7] = step * (row + 1); // cv, dv

    qi += 8;

    if (++ col === cells) {
      col = 0;
      if (++ row === cells) {
        row = 0;
      }
    }
  }

  return uvAttr;
};

LensDirtPass.prototype._quadGeomAlpha = function (count) {
  var alpha = new Float32Array(count * 4);
  var alphaAttr = new THREE.BufferAttribute(alpha, 1);

  return alphaAttr;
};

LensDirtPass.prototype.createQuadGeom = function (count, cells) {
  var geom = new THREE.BufferGeometry();

  geom.addAttribute('position', this._quadGeomPosition(count));
  geom.addAttribute('uv', this._quadGeomUv(count, cells));
  geom.addAttribute('alpha', this._quadGeomAlpha(count));
  geom.setIndex(this._quadGeomIndex(count));

  return geom;
};

// ..................................................
// Geometry updates
//

LensDirtPass.prototype._quadIndex = 0;

LensDirtPass.prototype.setQuadPosition = (function () {
  var pos = new THREE.Matrix4();
  var rot = new THREE.Matrix4();
  var scale = new THREE.Matrix4();
  var transform = new THREE.Matrix4();

  var a = new THREE.Vector3();
  var b = new THREE.Vector3();
  var c = new THREE.Vector3();
  var d = new THREE.Vector3();

  return function (index, x, y, r, s) {
    var position = this.geom.attributes.position;
    var ai = index * 4, bi = ai + 1, ci = ai + 2, di = ai + 3;

    scale.makeScale(s * this.scale, s * this.scale, 1);
    rot.makeRotationZ(r);
    pos.makeTranslation(x, y, 0);

    transform.identity();
    transform.multiply(pos);
    transform.multiply(rot);
    transform.multiply(scale);

    a.set(-1, -1, 0);
    b.set( 1, -1, 0);
    c.set( 1,  1, 0);
    d.set(-1,  1, 0);

    a.applyMatrix4(transform);
    b.applyMatrix4(transform);
    c.applyMatrix4(transform);
    d.applyMatrix4(transform);

    position.setXY(ai, a.x, a.y);
    position.setXY(bi, b.x, b.y);
    position.setXY(ci, c.x, c.y);
    position.setXY(di, d.x, d.y);

    position.needsUpdate = true;
  };
}());

LensDirtPass.prototype.setQuadAlpha = function (index, alpha) {
  var attr = this.geom.attributes.alpha;
  var array = attr.array;
  var ai = index * 4;

  array[ai]     = alpha;
  array[ai + 1] = alpha;
  array[ai + 2] = alpha;
  array[ai + 3] = alpha;

  attr.needsUpdate = true;
};

LensDirtPass.prototype.setGroup = function (count, x, y, spread) {
  var total = this._quadCount;
  var index = this._quadIndex;
  var qi = index;
  var xi, yi, rot, scale;

  for (var i = 0; i < count; i ++) {
    xi = x + (Math.random() - 0.5) * spread;
    yi = y + (Math.random() - 0.5) * spread;
    rot = Math.random() * Math.PI * 2;
    scale = Math.random() * 0.15;

    this.setQuadPosition(qi, xi, yi, rot, scale);
    this.setQuadAlpha(qi, 1);

    qi = index + i;
    if (qi >= total) {
      index = this._quadIndex = 0;
    }
  }

  this._quadIndex = qi;
};

LensDirtPass.prototype.update = function (delta) {
  var alphaAttr = this.geom.attributes.alpha;
  var alphaArray = alphaAttr.array;

  for (var i = 0, il = alphaArray.length; i < il; i ++) {
    alphaArray[i] *= 0.995;
  }

  alphaAttr.needsUpdate = true;
};

LensDirtPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
  if (this.renderToScreen) {
    renderer.render(this.scene, this.camera);
  } else {
    renderer.render(this.scene, this.camera, readBuffer, this.clear);
  }
};
