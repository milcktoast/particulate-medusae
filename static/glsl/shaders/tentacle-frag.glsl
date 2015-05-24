uniform vec3 diffuse;
uniform float opacity;
uniform float area;
varying float centerDist;

void main() {
  float illumination = area * 2.0 / (centerDist * centerDist);
  gl_FragColor = vec4(
    mix(vec3(1.0), diffuse, clamp(illumination, 0.0, 1.25)),
    clamp(opacity * illumination * illumination, 0.0, opacity));
}
