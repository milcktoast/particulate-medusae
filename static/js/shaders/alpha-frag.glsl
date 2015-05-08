uniform vec3 diffuse;
uniform float opacity;
varying float vAlpha;

{{{chunks.common}}}
{{{chunks.color_pars_fragment}}}
{{{chunks.uv_pars_fragment}}}
{{{chunks.uv2_pars_fragment}}}
{{{chunks.map_pars_fragment}}}
{{{chunks.alphamap_pars_fragment}}}
{{{chunks.shadowmap_pars_fragment}}}
{{{chunks.specularmap_pars_fragment}}}

void main() {
  // outgoing light does not have an alpha, the surface does
  vec3 outgoingLight = vec3(0.0);
  vec4 diffuseColor = vec4(diffuse, opacity * vAlpha);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.alphamap_fragment}}}
  {{{chunks.alphatest_fragment}}}
  {{{chunks.specularmap_fragment}}}

  // simple shader
  outgoingLight = diffuseColor.rgb;

  // TODO: this should be pre-multiplied to allow for bright highlights on very transparent objects
  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
