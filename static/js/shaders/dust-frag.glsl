uniform vec3 psColor;
uniform float opacity;
uniform float area;

varying float centerDist;

{{{chunks.color_pars_fragment}}}
{{{chunks.map_particle_pars_fragment}}}
{{{chunks.fog_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

void main() {
  float illumination = (area * 2.0 / (centerDist * centerDist));
  gl_FragColor = vec4(psColor, illumination);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_particle_fragment}}}
  {{{chunks.alphatest_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.fog_fragment}}}
}
