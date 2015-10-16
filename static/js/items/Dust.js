var DEBUG_TEXTURE = false;
var mapLinear = THREE.Math.mapLinear;

App.Dust = Dust;
function Dust(opts) {
  this.pxRatio = opts.pxRatio || 1;
  this.particleSize = 32 * this.pxRatio;
  this.particleCount = 8000;
  this.area = 300;
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
  var sizeHalf = size * 0.5;
  var rings = 2;
  var t, radius, alpha;

  canvas.width = canvas.height = size;
  ctx.fillStyle = '#fff';

  for (var i = 0; i < rings; i ++) {
    t = i / (rings - 1);
    radius = mapLinear(t * t, 0, 1, 4, sizeHalf);
    alpha = mapLinear(t, 0, 1, 1, 0.05);

    ctx.beginPath();
    ctx.arc(sizeHalf, sizeHalf, radius, 0, Math.PI * 2);
    ctx.globalAlpha = alpha;
    ctx.fill();
  }

  texture.needsUpdate = true;

  if (DEBUG_TEXTURE) {
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
  }

  return texture;
};

Dust.prototype.createMaterials = function () {
  var params = {
    psColor : 0xffffff,
    opacity : 0.95,
    size : this.particleSize,
    map : this.createTexture(),
    scale : 150,
    area : this.area,
    blending: THREE.AdditiveBlending,
    transparent : true,
    depthTest : false,
    depthWrite : false
  };

  this.materialFore = new App.DustMaterial(params);

  // params.depthTest = false;
  // params.opacity = 0.25;
  // this.materialFaint = new App.DustMaterial(params);

  // this.timeAttrFaint = this.materialFaint.uniforms.time;
  this.timeAttrFore = this.materialFore.uniforms.time;
};

Dust.prototype.createItem = function () {
  // this.itemFaint = new THREE.PointCloud(this.geometry, this.materialFaint);
  this.itemFore = new THREE.Points(this.geometry, this.materialFore);
};

Dust.prototype.addTo = function (scene) {
  // scene.add(this.itemFaint);
  scene.add(this.itemFore);
};

Dust.prototype.updateGraphics = function (delta) {
  // this.timeAttrFaint.value += delta * 0.005;
  this.timeAttrFore.value += delta * 0.005;
};
