uniform float opacity;

{{{chunks.map_pars_fragment}}}

void main() {
  {{{chunks.map_fragment}}}

  gl_FragColor = vec4(vUv.xy, 0.0, opacity);
}
