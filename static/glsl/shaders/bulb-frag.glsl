uniform vec3 diffuse;
uniform vec3 diffuseB;
uniform float opacity;
varying vec2 vUv;
varying vec3 vNormal;

float accumulate(vec2 uv, float saturation, float scale) {
  saturation -= sin(uv.x * 60.0) * 0.25 + sin(uv.x * 50.0 * scale) * 0.25 + 0.75;

  saturation -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  saturation -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  saturation -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 3.0 * scale) * 0.15;
  saturation -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 3.0 * scale) * 0.15;

  saturation -= sin((uv.y - 1.5) * sin(uv.y + cos(uv.x - 1.0)       * 2.0) * 4.0 * scale) * 0.15;
  saturation -= sin((uv.y - 1.5) * sin(uv.y + cos(1.0 - uv.x - 1.0) * 2.0) * 3.0 * scale) * 0.15;

  saturation -= sin(uv.y * 5.0) * 0.15 + sin(uv.y * 2.5) * 1.25;

  return saturation;
}

void main() {
  vec2 uv = vUv;
  vec3 eye = vec3(0.0, 0.0, 1.0);
  vec3 normal = normalize(mat3(viewMatrix) * vNormal);
  float rim = 1.0 - max(dot(eye, normal), 0.0);
  float saturation = 0.0;

  saturation += max(-0.25, accumulate(uv, 1.0, 20.0));
  saturation += max(-0.25, accumulate(vec2(-rim * 0.5), 0.1, 1.0));
  saturation += max(-0.25, accumulate(vec2(uv.x, rim), 1.25, 20.0));
  saturation += max(-0.25, accumulate(vec2(rim, uv.y), 1.25, 30.0));

  gl_FragColor = vec4(
    mix(diffuseB, diffuse, saturation) * opacity,
    clamp(saturation, 0.2, 1.0) * opacity);
}
