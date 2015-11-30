function compileShader(templateName) {
  var template = App.shaders[templateName];
  return template({
    chunks : THREE.ShaderChunk
  });
}

App.ShaderMaterial = ShaderMaterial;
function ShaderMaterial(parameters) {
  if (!this.shader) { return; }

  this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms);
  this.setUniformParameters(parameters);

  THREE.ShaderMaterial.call(this, {
    uniforms : this.uniforms,
    fragmentShader : compileShader(this.shader.fragmentShader),
    vertexShader : compileShader(this.shader.vertexShader)
  });

  this.transparent = parameters.transparent || false;
  this.blending = parameters.blending || THREE.NormalBlending;
  this.side = parameters.side || THREE.FrontSide;
  this.linewidth = parameters.linewidth || 1;
  this.depthTest = parameters.depthTest != null ? parameters.depthTest : true;
  this.depthWrite = parameters.depthWrite != null ? parameters.depthWrite : true;

  this.size = parameters.size || 1;
  this.sizeAttenuation = parameters.sizeAttenuation;

  this.fog = !!parameters.fog;
  this.map = !!parameters.map;
  this.bumpMap = !!parameters.bumpMap;
  this.normalMap = !!parameters.normalMap;
  this.specularMap = !!parameters.specularMap;
}

ShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

ShaderMaterial.prototype.setUniformParameters = function (parameters) {
  var uniforms = this.uniforms;
  Object.keys(parameters).forEach(function (key) {
    var uniform = uniforms[key];
    if (!uniform) { return; }
    switch (uniform.type) {
    case 'c':
      this[key] = uniforms[key].value = new THREE.Color(parameters[key]);
      break;
    default:
      this[key] = uniforms[key].value = parameters[key];
      break;
    }
  }.bind(this));
};
