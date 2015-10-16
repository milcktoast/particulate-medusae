require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.AlphaMaterial = AlphaMaterial;
function AlphaMaterial(parameters) {
  parameters = parameters || {};
  ShaderMaterial.call(this, parameters);
}

AlphaMaterial.prototype = Object.create(ShaderMaterial.prototype);

AlphaMaterial.prototype.shader = {
  vertexShader : 'alpha-vert',
  fragmentShader : 'alpha-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common
  ])
};
