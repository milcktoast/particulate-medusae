uniform float size;
uniform float scale;
uniform float area;

varying float centerDist;

{{{chunks.color_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  {{{chunks.color_vertex}}}

  centerDist = length(position);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;

  {{{chunks.logdepthbuf_vertex}}}
  {{{chunks.worldpos_vertex}}}
  {{{chunks.shadowmap_vertex}}}
}
