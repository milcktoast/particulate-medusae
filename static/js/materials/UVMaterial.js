require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.UVMaterial = UVMaterial;
function UVMaterial(parameters) {
  parameters = parameters || {};
  parameters.map = true;
  ShaderMaterial.call(this, parameters);
}

UVMaterial.prototype = Object.create(ShaderMaterial.prototype);

UVMaterial.prototype.shader = {
  vertexShader : 'basic-vert',
  fragmentShader : 'uvs-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common
  ])
};
