{{{chunks.common}}}
{{{chunks.uv_pars_vertex}}}
{{{chunks.color_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

attribute float alpha;
varying float vAlpha;

void main() {
  {{{chunks.uv_vertex}}}
  {{{chunks.color_vertex}}}

  {{{chunks.begin_vertex}}}
  {{{chunks.project_vertex}}}
  {{{chunks.logdepthbuf_vertex}}}

  {{{chunks.worldpos_vertex}}}

  vAlpha = alpha;
}
