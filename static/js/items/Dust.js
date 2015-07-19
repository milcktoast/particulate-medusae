App.Dust = Dust;
function Dust(opts) {
  this.pxRatio = opts.pxRatio || 1;
  this.particleSize = 5 * this.pxRatio;
  this.particleCount = 20000;
  this.area = 350;
  this.createParticles();
  this.createMaterials();
  this.createItem();
}

Dust.create = App.ctor(Dust);

Dust.prototype.createParticles = function () {
  var count = this.particleCount;
  var geom = this.geometry = new THREE.BufferGeometry();
  var verts = new Float32Array(count * 3);

  var area = this.area;
  var areaHalf = area * 0.5;
  var ix;

  for (var i = 0, il = verts.length / 3; i < il; i ++) {
    ix = i * 3;
    verts[ix]     = Math.random() * area - areaHalf;
    verts[ix + 1] = Math.random() * area - areaHalf;
    verts[ix + 2] = Math.random() * area - areaHalf;
  }

  geom.addAttribute('position',
    new THREE.BufferAttribute(verts, 3));
};

Dust.prototype.createTexture = function () {
  var canvas = document.createElement('canvas');
  var texture = new THREE.Texture(canvas);
  var ctx = canvas.getContext('2d');

  var size = Math.pow(2, 6);
  var center = size * 0.5;

  canvas.width = canvas.height = size;
  ctx.fillStyle = '#fff';

  ctx.beginPath();
  ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  texture.needsUpdate = true;
  return texture;
};

Dust.prototype.createMaterials = function () {
  var material = this.material = new App.DustMaterial({
    psColor : 0xffffff,
    opacity : 0.8,
    size : this.particleSize,
    map : this.createTexture(),
    scale : 150,
    area : this.area,
    transparent : true
  });

  this.timeAttr = material.uniforms.time;
};

Dust.prototype.createItem = function () {
  this.item = new THREE.PointCloud(this.geometry, this.material);
};

Dust.prototype.addTo = function (scene) {
  scene.add(this.item);
};

Dust.prototype.updateGraphics = function (delta) {
  this.timeAttr.value += delta * 0.005;
};
