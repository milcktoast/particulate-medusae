App.Dust = Dust;
function Dust(opts) {
  this.pxRatio = opts.pxRatio || 1;
  this.particleSize = 2 * this.pxRatio;
  this.particleCount = 10000;
  this.area = 100;
  this.createParticles();
  this.createMaterials();
  this.createItem();
}

Dust.create = Particulate.ctor(Dust);

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

  var posAttr = new THREE.BufferAttribute();
  posAttr.array = verts;
  posAttr.itemSize = 3;
  geom.addAttribute('position', posAttr);
};

Dust.prototype.createMaterials = function () {
  var material = this.material = new App.DustMaterial({
    psColor : 0xffffff,
    size : this.particleSize,
    scale : 100,
    area : this.area,
    transparent : true
  });

  this.timeAttr = material.uniforms.time;
};

Dust.prototype.createItem = function () {
  this.item = new THREE.ParticleSystem(this.geometry, this.material);
};

Dust.prototype.addTo = function (scene) {
  scene.add(this.item);
};

// TODO: Call update with frame time delta
Dust.prototype.update = function (delta) {
  this.timeAttr.value += 0.1;
};
