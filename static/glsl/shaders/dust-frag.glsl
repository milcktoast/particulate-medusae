uniform vec3 psColor;
uniform float opacity;
uniform float area;
varying float centerDist;

{{{chunks.common}}}
{{{chunks.color_pars_fragment}}}
{{{chunks.map_particle_pars_fragment}}}

void main() {
  vec4 diffuseColor = vec4(psColor, opacity);
  float radius = area * 0.5;
  float illumination = max(0.0, (radius - centerDist) / radius);

  {{{chunks.map_particle_fragment}}}
  {{{chunks.color_fragment}}}

  gl_FragColor = vec4(diffuseColor.rgb,
    illumination * illumination * diffuseColor.a);
}
