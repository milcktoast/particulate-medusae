uniform vec3 diffuse;
uniform float opacity;
uniform float area;

varying float centerDist;

{{{chunks.color_pars_fragment}}}
{{{chunks.fog_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

void main() {
  float illumination = (area * 2.0 / (centerDist * centerDist));
  gl_FragColor = vec4(
    mix(vec3(1.0), diffuse, illumination),
    opacity * illumination);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.alphatest_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.fog_fragment}}}
}
