uniform vec3 diffuse;
uniform float opacity;

{{{chunks.common}}}
{{{chunks.map_pars_fragment}}}

void main() {
  vec4 diffuseColor = vec4(diffuse, opacity);

  {{{chunks.map_fragment}}}

  gl_FragColor = vec4(vUv.xy, 0.0, opacity);
}
