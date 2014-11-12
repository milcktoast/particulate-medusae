require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.TailMaterial = TailMaterial;
function TailMaterial(parameters) {
  parameters = parameters || {};
  parameters.map = true;
  ShaderMaterial.call(this, parameters);
}

TailMaterial.prototype = Object.create(ShaderMaterial.prototype);

TailMaterial.prototype.shader = {
  vertexShader : 'basic-vert',
  fragmentShader : 'tail-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common
  ])
};
