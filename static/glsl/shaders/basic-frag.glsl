uniform vec3 diffuse;
uniform float opacity;

{{{chunks.common}}}
{{{chunks.color_pars_fragment}}}
{{{chunks.uv_pars_fragment}}}
{{{chunks.uv2_pars_fragment}}}
{{{chunks.map_pars_fragment}}}
{{{chunks.alphamap_pars_fragment}}}
{{{chunks.aomap_pars_fragment}}}
{{{chunks.envmap_pars_fragment}}}
{{{chunks.fog_pars_fragment}}}
{{{chunks.shadowmap_pars_fragment}}}
{{{chunks.specularmap_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

void main() {
  vec3 outgoingLight = vec3(0.0);
  vec4 diffuseColor = vec4(diffuse, opacity);
  vec3 totalAmbientLight = vec3(1.0);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_fragment}}}
  {{{chunks.color_fragment}}}
  {{{chunks.alphamap_fragment}}}
  {{{chunks.alphatest_fragment}}}
  {{{chunks.specularmap_fragment}}}
  {{{chunks.aomap_fragment}}}

  outgoingLight = diffuseColor.rgb * totalAmbientLight;

  {{{chunks.envmap_fragment}}}
  {{{chunks.shadowmap_fragment}}}
  {{{chunks.linear_to_gamma_fragment}}}
  {{{chunks.fog_fragment}}}

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
