require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.LerpPointMaterial = LerpPointMaterial;
function LerpPointMaterial(parameters) {
  parameters = parameters || {};
  parameters.sizeAttenuation = true;
  ShaderMaterial.call(this, parameters);
}

LerpPointMaterial.prototype = Object.create(ShaderMaterial.prototype);

LerpPointMaterial.prototype.shader = {
  vertexShader : 'lerp-point-vert',
  fragmentShader : 'basic-point-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.points,
    {
      stepProgress : { type : 'f', value : 0 }
    }
  ])
};
