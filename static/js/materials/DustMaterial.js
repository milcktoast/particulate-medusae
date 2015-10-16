require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.DustMaterial = DustMaterial;
function DustMaterial(parameters) {
  parameters = parameters || {};
  ShaderMaterial.call(this, parameters);
}

DustMaterial.prototype = Object.create(ShaderMaterial.prototype);

DustMaterial.prototype.shader = {
  vertexShader : 'dust-vert',
  fragmentShader : 'dust-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common,
    uniforms.points,
    {
      time : { type : 'f', value : 0 },
      area : { type : 'f', value : 1 }
    }
  ])
};
