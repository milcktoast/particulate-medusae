uniform vec3 diffuse;
uniform vec3 diffuseB;
uniform float opacity;
uniform float scale;
varying vec2 vUv;
varying vec3 vNormal;

const vec3 eye = vec3(0.0, 0.0, 1.0);

float accumulate(vec2 uv, float saturation, float scale) {
  saturation -= sin(uv.y * 12.0 * scale) * 0.8 + uv.y * 1.5 + sin(uv.x * 20.0 * scale) * 0.1 + 0.85;

  saturation -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  saturation -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  saturation -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  saturation -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  return saturation;
}

void main() {
  vec2 uv = vUv;
  vec3 normal = normalize(mat3(viewMatrix) * vNormal);
  float rim = 1.0 - max(dot(eye, normal), 0.0);
  float saturation = 0.0;

  saturation += accumulate(uv, 2.0, scale);
  saturation += max(accumulate(vec2(rim), 0.75, scale * 0.25), -0.25);

  gl_FragColor = vec4(
    mix(diffuseB, diffuse, saturation) * opacity,
    clamp(saturation, 0.2, 1.0) * opacity);
}
