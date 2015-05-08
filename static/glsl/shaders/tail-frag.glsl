uniform vec3 diffuse;
uniform float opacity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float color = (sin(uv.y * 1000.0) - sin((1.0 - uv.x) * 3.0 + 1.2)) * uv.y;
  color = smoothstep(-0.65, 1.0, color);

  gl_FragColor = vec4(vec3(color) * diffuse, color * opacity);
}
