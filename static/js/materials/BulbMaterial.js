require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.BulbMaterial = BulbMaterial;
function BulbMaterial(parameters) {
  parameters = parameters || {};
  parameters.map = true;
  ShaderMaterial.call(this, parameters);
}

BulbMaterial.prototype = Object.create(ShaderMaterial.prototype);

BulbMaterial.prototype.shader = {
  vertexShader : 'lerp-vert',
  fragmentShader : 'bulb-frag',

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
