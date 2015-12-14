uniform vec3 psColor;
uniform float opacity;

{{{chunks.common}}}
{{{chunks.color_pars_fragment}}}
{{{chunks.map_particle_pars_fragment}}}
{{{chunks.fog_pars_fragment}}}
{{{chunks.shadowmap_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

void main() {
  vec3 outgoingLight = vec3(0.0);
  vec4 diffuseColor = vec4(psColor, opacity);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_particle_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.alphatest_fragment}}}

  outgoingLight = diffuseColor.rgb;

  {{{chunks.shadowmap_fragment}}}
  {{{chunks.fog_fragment}}}

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
