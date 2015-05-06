uniform vec3 psColor;
uniform float opacity;
uniform float area;
varying float centerDist;

void main() {
  float illumination = (area * 2.0 / (centerDist * centerDist));
  gl_FragColor = vec4(psColor, illumination);
}
