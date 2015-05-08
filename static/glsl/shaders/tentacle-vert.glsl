uniform float area;
varying float centerDist;

{{{chunks.common}}}
{{{chunks.lerp_pos_pars_vertex}}}
{{{chunks.color_pars_vertex}}}

void main() {
  {{{chunks.color_vertex}}}

  centerDist = length(position);

  {{{chunks.lerp_pos_vertex}}}
  {{{chunks.worldpos_vertex}}}
}
