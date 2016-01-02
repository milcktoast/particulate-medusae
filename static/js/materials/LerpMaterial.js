require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.LerpMaterial = LerpMaterial;
function LerpMaterial(parameters) {
  parameters = parameters || {};
  ShaderMaterial.call(this, parameters);
}

LerpMaterial.prototype = Object.create(ShaderMaterial.prototype);

LerpMaterial.prototype.shader = {
  vertexShader : 'lerp-vert',
  fragmentShader : 'basic-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common,
    {
      stepProgress : { type : 'f', value : 0 }
    }
  ])
};
