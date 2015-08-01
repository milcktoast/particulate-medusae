uniform vec3 diffuse;
uniform float opacity;
varying vec2 vUv;

float scale = 20.0;
float saturation = 2.0;

vec3 diffuse0 = vec3(0.6, 0.3, 0.65);
vec3 diffuse1 = vec3(1.2, 0.8, 1.0);

void main() {
  vec2 uv = vUv;

  saturation -= sin(uv.x * 60.0) * 0.25 + sin(uv.x * 60.0 * scale) * 0.25 + 0.75;

  saturation -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  saturation -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  saturation -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  saturation -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  saturation -= sin((uv.y - 1.5) * sin(uv.y + cos(uv.x - 1.0)       * 2.0) * 8.0 * scale) * 0.15;
  saturation -= sin((uv.y - 1.5) * sin(uv.y + cos(1.0 - uv.x - 1.0) * 2.0) * 8.0 * scale) * 0.15;

  saturation -= sin(uv.y * 5.0) * 0.15 + sin(uv.y * 2.5) * 1.25;

  gl_FragColor = vec4(
    mix(diffuse0, diffuse1, saturation) * opacity,
    clamp(saturation, 0.2, 1.0) * opacity);
}
