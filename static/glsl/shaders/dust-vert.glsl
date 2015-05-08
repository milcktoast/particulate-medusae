uniform float size;
uniform float scale;
uniform float time;
uniform float area;
varying float centerDist;

void main() {
  float offsetY = mod(position.y - 1.0 * time, area) - area * 0.5;
  vec3 offsetPosition = vec3(
    position.x + sin(cos(offsetY * 0.1) + sin(offsetY * 0.1 + position.x * 0.1) * 2.0),
    offsetY,
    position.z + sin(cos(offsetY * 0.1) + sin(offsetY * 0.1 + position.z * 0.1) * 2.0));

  centerDist = length(offsetPosition);

  vec4 mvPosition = modelViewMatrix * vec4(offsetPosition, 1.0);

  gl_PointSize = size * (scale / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
