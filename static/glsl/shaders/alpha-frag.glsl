uniform vec3 diffuse;
uniform float opacity;
varying float vAlpha;

{{{chunks.common}}}
{{{chunks.color_pars_fragment}}}
{{{chunks.uv_pars_fragment}}}
{{{chunks.map_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

void main() {
  vec3 outgoingLight = vec3(0.0);
  vec4 diffuseColor = vec4(diffuse, opacity * vAlpha);
  vec3 totalAmbientLight = vec3(1.0); // hardwired
  vec3 shadowMask = vec3(1.0);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.alphatest_fragment}}}

  outgoingLight = diffuseColor.rgb * totalAmbientLight;

  {{{chunks.linear_to_gamma_fragment}}}

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
