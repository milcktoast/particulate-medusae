uniform float size;
uniform float scale;

{{{chunks.common}}}
{{{chunks.color_pars_vertex}}}
{{{chunks.lerp_pos_pars_vertex}}}
{{{chunks.logdepthbuf_pars_vertex}}}

void main() {
  {{{chunks.color_vertex}}}
  {{{chunks.lerp_pos_vertex}}}
  {{{chunks.logdepthbuf_vertex}}}

  #ifdef USE_SIZEATTENUATION
    gl_PointSize = size * (scale / length(mvPosition.xyz));
  #else
    gl_PointSize = size;
  #endif
}
