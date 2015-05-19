uniform float opacity;
varying vec2 vUv;

float scale = 20.0;
float color = 2.0;
float r = 1.6;
float g = 1.0;
float b = 1.2;

void main() {
  vec2 uv = vUv;

  color -= sin(uv.x * 60.0) * 0.25 + sin(uv.x * 60.0 * scale) * 0.25 + 0.75;

  color -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  color -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  color -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  color -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  color -= sin((uv.y - 1.5) * sin(uv.y + cos(uv.x - 1.0)       * 2.0) * 8.0 * scale) * 0.15;
  color -= sin((uv.y - 1.5) * sin(uv.y + cos(1.0 - uv.x - 1.0) * 2.0) * 8.0 * scale) * 0.15;

  color -= sin(uv.y * 5.0) * 0.5 + sin(uv.y * 2.5) * 1.5;

  gl_FragColor = vec4(color * r, color * g, color * b, opacity);
}
