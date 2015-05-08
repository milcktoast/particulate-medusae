App.LensDirtPass = LensDirtPass;
function LensDirtPass() {
  this.renderToScreen = false;
  this.enabled = true;
  this.needsSwap = false;
  this.clear = false;

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.scale = 1;

  this.geom = this.createQuadGeom(2, 10);
  this.mesh = new THREE.Mesh(this.geom, new App.UVMaterial({
    diffuse : 0xffffff,
    opacity : 0.5,
    transparent : true
  }));

  this.scene.add(this.mesh);

  this.setQuadPosition(0, 0.5, 0.5, Math.PI * 0.25, 0.1);
  this.setQuadPosition(1, -0.5, -0.2, Math.PI * 0.15, 0.05);
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

LensDirtPass.prototype.createQuadGeom = function (count, cells) {
  var geom = new THREE.BufferGeometry();

  geom.addAttribute('position', this._quadGeomPosition(count));
  geom.addAttribute('index', this._quadGeomIndex(count));
  geom.addAttribute('uv', this._quadGeomUv(count, cells));

  return geom;
};

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

LensDirtPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
  if (this.renderToScreen) {
    renderer.render(this.scene, this.camera);
  } else {
    renderer.render(this.scene, this.camera, readBuffer, this.clear);
  }
};
