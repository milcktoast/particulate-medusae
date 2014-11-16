uniform float size;
uniform float scale;
uniform float time;
uniform float area;

varying float centerDist;

{{{chunks.color_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  {{{chunks.color_vertex}}}

  vec3 offsetPosition = vec3(
    position.x,
    mod(position.y - 1.0 * time, area) - area * 0.5,
    position.z);

  centerDist = length(offsetPosition);

  vec4 mvPosition = modelViewMatrix * vec4(offsetPosition, 1.0);

  gl_PointSize = size * (scale / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;

  {{{chunks.logdepthbuf_vertex}}}
  {{{chunks.worldpos_vertex}}}
  {{{chunks.shadowmap_vertex}}}
}
