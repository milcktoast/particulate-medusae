{{{chunks.common}}}
{{{chunks.uv_pars_vertex}}}
{{{chunks.uv2_pars_vertex}}}
{{{chunks.envmap_pars_vertex}}}
{{{chunks.color_pars_vertex}}}
{{{chunks.morphtarget_pars_vertex}}}
{{{chunks.skinning_pars_vertex}}}
{{{chunks.shadowmap_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  {{{chunks.uv_vertex}}}
  {{{chunks.uv2_vertex}}}
  {{{chunks.color_vertex}}}
  {{{chunks.skinbase_vertex}}}

  #ifdef USE_ENVMAP
  {{{chunks.beginnormal_vertex}}}
  {{{chunks.morphnormal_vertex}}}
  {{{chunks.skinnormal_vertex}}}
  {{{chunks.defaultnormal_vertex}}}
  #endif

  {{{chunks.begin_vertex}}}
  {{{chunks.morphtarget_vertex}}}
  {{{chunks.skinning_vertex}}}
  {{{chunks.project_vertex}}}
  {{{chunks.logdepthbuf_vertex}}}

  {{{chunks.worldpos_vertex}}}
  {{{chunks.envmap_vertex}}}
  {{{chunks.shadowmap_vertex}}}
}
