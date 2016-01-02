require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.TentacleMaterial = TentacleMaterial;
function TentacleMaterial(parameters) {
  parameters = parameters || {};
  ShaderMaterial.call(this, parameters);
}

TentacleMaterial.prototype = Object.create(ShaderMaterial.prototype);

TentacleMaterial.prototype.shader = {
  vertexShader : 'tentacle-vert',
  fragmentShader : 'tentacle-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common,
    {
      stepProgress : { type : 'f', value : 0 },
      area : { type : 'f', value : 1 }
    }
  ])
};
