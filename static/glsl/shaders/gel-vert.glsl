{{{chunks.common}}}
{{{chunks.lerp_pos_pars_vertex}}}
{{{chunks.color_pars_vertex}}}

varying vec3 vNormal;

void main() {
  {{{chunks.color_vertex}}}
  {{{chunks.lerp_pos_vertex}}}
  {{{chunks.worldpos_vertex}}}

  vNormal = normalize(position);
}
