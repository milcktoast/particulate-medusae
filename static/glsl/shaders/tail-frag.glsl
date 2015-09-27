uniform vec3 diffuse;
uniform vec3 diffuseB;
uniform float opacity;
uniform float scale;
varying vec2 vUv;

float saturation = 2.0;

void main() {
  vec2 uv = vUv;

  saturation -= sin(uv.y * 12.0 * scale) * 0.45 + uv.y * 1.5 + sin(uv.x * 20.0 * scale) * 0.1 + 0.85;

  saturation -= sin(uv.y * sin(uv.x         * 5.0) * 5.0 * scale) * 0.05;
  saturation -= sin(uv.y * sin((1.0 - uv.x) * 5.0) * 5.0 * scale) * 0.05;

  saturation -= sin(uv.y * sin(uv.y + cos(uv.x)       * 2.0) * 10.0 * scale) * 0.15;
  saturation -= sin(uv.y * sin(uv.y + cos(1.0 - uv.x) * 2.0) * 10.0 * scale) * 0.15;

  gl_FragColor = vec4(
    mix(diffuseB, diffuse, saturation) * opacity,
    clamp(saturation, 0.2, 1.0) * opacity);
}
