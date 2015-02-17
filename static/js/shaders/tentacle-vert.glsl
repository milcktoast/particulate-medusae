uniform float time;
uniform float area;

attribute vec3 positionPrev;

varying float centerDist;

{{{chunks.color_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  {{{chunks.color_vertex}}}

  centerDist = length(position);
  vec4 mvPosition = modelViewMatrix *
  	vec4(mix(positionPrev, position, time), 1.0);

  gl_Position = projectionMatrix * mvPosition;

  {{{chunks.logdepthbuf_vertex}}}
  {{{chunks.worldpos_vertex}}}
}
