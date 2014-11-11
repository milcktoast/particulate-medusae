uniform vec3 diffuse;
uniform float opacity;

{{{chunks.color_pars_fragment}}}
{{{chunks.map_pars_fragment}}}
{{{chunks.alphamap_pars_fragment}}}
{{{chunks.lightmap_pars_fragment}}}
{{{chunks.envmap_pars_fragment}}}
{{{chunks.fog_pars_fragment}}}
{{{chunks.shadowmap_pars_fragment}}}
{{{chunks.specularmap_pars_fragment}}}
{{{chunks.logdepthbuf_pars_fragment}}}

float scale = 20.0;
float color = 2.0;
float r = 1.6;
float g = 1.0;
float b = 1.2;

void main() {
  gl_FragColor = vec4(diffuse, opacity);

  {{{chunks.logdepthbuf_fragment}}}
  {{{chunks.map_fragment}}}
  {{{chunks.alphamap_fragment}}}
  {{{chunks.alphatest_fragment}}}
  {{{chunks.specularmap_fragment}}}
  {{{chunks.lightmap_fragment}}}
  {{{chunks.color_fragment}}}

  vec2 uv = vUv;

  color -= sin(uv.x * 60.0) * 0.25 + sin(uv.x * 60.0 * scale) * 0.25 + 0.75;

  color -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  color -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  color -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  color -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  color -= sin((uv.y - 1.5) * sin(uv.y + cos(uv.x - 1.0)       * 2.0) * 8.0 * scale) * 0.15;
  color -= sin((uv.y - 1.5) * sin(uv.y + cos(1.0 - uv.x - 1.0) * 2.0) * 8.0 * scale) * 0.15;

  color -= sin(uv.y * 5.0) * 0.5 + sin(uv.y * 2.5) * 1.5;

  gl_FragColor = vec4(vec3(color * r, color * g, color * b), 1.0);

  {{{chunks.envmap_fragment}}}
  {{{chunks.shadowmap_fragment}}}

  {{{chunks.linear_to_gamma_fragment}}}

  {{{chunks.fog_fragment}}}
}
