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
      time : { type : 'f', value : 0 }
    }
  ]),

  attributes : {
    positionPrev : { type : 'v3', value : null }
  }
};
