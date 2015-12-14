{{{chunks.common}}}
{{{chunks.uv_pars_vertex}}}
{{{chunks.uv2_pars_vertex}}}
{{{chunks.color_pars_vertex}}}
{{{chunks.lerp_pos_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

varying vec3 vNormal;

void main() {
  {{{chunks.uv_vertex}}}
  {{{chunks.uv2_vertex}}}
  {{{chunks.color_vertex}}}

  {{{chunks.begin_vertex}}}
  {{{chunks.lerp_pos_vertex}}}
  {{{chunks.logdepthbuf_vertex}}}
  {{{chunks.worldpos_vertex}}}

  vNormal = normalize(position);
}
