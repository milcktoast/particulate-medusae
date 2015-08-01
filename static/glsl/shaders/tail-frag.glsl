uniform vec3 diffuse;
uniform float opacity;
varying vec2 vUv;

float scale = 20.0;
float saturation = 1.5;

vec3 diffuse0 = vec3(0.6, 0.3, 0.65);
vec3 diffuse1 = vec3(1.6, 0.8, 1.2);

void main() {
  vec2 uv = vUv;

  saturation -= sin(uv.y * 10.0 * scale) * 0.45 + uv.y * 1.5 + sin(uv.x * 20.0 * scale) * 0.1 + 0.85;

  saturation -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  saturation -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  saturation -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  saturation -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  gl_FragColor = vec4(
    mix(diffuse0, diffuse1, saturation) * opacity,
    clamp(saturation, 0.05, 1.0) * opacity);
}
