require('./ShaderMaterial');
var ShaderMaterial = App.ShaderMaterial;
var uniforms = THREE.UniformsLib;

App.TailMaterial = TailMaterial;
function TailMaterial(parameters) {
  parameters = parameters || {};
  parameters.map = true;
  ShaderMaterial.call(this, parameters);
}

TailMaterial.prototype = Object.create(ShaderMaterial.prototype);

TailMaterial.prototype.shader = {
  vertexShader : 'normal-vert',
  fragmentShader : 'tail-frag',

  uniforms : THREE.UniformsUtils.merge([
    uniforms.common,
    {
      diffuseB : { type : 'c', value : null },
      scale : { type : 'f', value : 1 },
      stepProgress : { type : 'f', value : 0 }
    }
  ])
};
