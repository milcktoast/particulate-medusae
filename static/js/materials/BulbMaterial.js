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
  vertexShader : 'normal-vert',
  fragmentShader : 'bulb-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common,
    {
      diffuseB : { type : 'c', value : null },
      stepProgress : { type : 'f', value : 0 },
      time : { type : 'f', value : 0 }
    }
  ])
};
