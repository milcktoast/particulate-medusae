require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.GelMaterial = GelMaterial;
function GelMaterial(parameters) {
  parameters = parameters || {};
  ShaderMaterial.call(this, parameters);
}

GelMaterial.prototype = Object.create(ShaderMaterial.prototype);

GelMaterial.prototype.shader = {
  vertexShader : 'gel-vert',
  fragmentShader : 'gel-frag',

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
