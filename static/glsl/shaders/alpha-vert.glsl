attribute float alpha;
varying float vAlpha;

{{{chunks.common}}}
{{{chunks.map_pars_vertex}}}
{{{chunks.lightmap_pars_vertex}}}
{{{chunks.envmap_pars_vertex}}}
{{{chunks.color_pars_vertex}}}
{{{chunks.morphtarget_pars_vertex}}}
{{{chunks.skinning_pars_vertex}}}
{{{chunks.shadowmap_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  vAlpha = alpha;

  {{{chunks.map_vertex}}}
  {{{chunks.lightmap_vertex}}}
  {{{chunks.color_vertex}}}
  {{{chunks.skinbase_vertex}}}

  #ifdef USE_ENVMAP
  {{{chunks.morphnormal_vertex}}}
  {{{chunks.skinnormal_vertex}}}
  {{{chunks.defaultnormal_vertex}}}
  #endif

  {{{chunks.morphtarget_vertex}}}
  {{{chunks.skinning_vertex}}}
  {{{chunks.default_vertex}}}
  {{{chunks.logdepthbuf_vertex}}}

  {{{chunks.worldpos_vertex}}}
  {{{chunks.envmap_vertex}}}
  {{{chunks.shadowmap_vertex}}}
}
