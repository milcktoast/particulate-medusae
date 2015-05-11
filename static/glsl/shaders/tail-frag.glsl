uniform vec3 diffuse;
uniform float opacity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float xa = 1.0 - uv.x;

  float color = (sin(uv.y * 800.0) - sin((1.0 - uv.x) * 3.0 + 1.2)) * uv.y;
  color = smoothstep(-0.65, 1.0, color);

	color -= (sin(uv.y * 500.0) * 0.25 + sin(1.0 - uv.y * 100.0) * 0.1) * xa;

	color -= (sin(uv.x * 100.0) * 0.1 + cos(uv.x * 180.0) * 0.05) * xa;
	color -= (sin(uv.x * 100.0) * 0.1 + cos(uv.x * 200.0) * 0.15) * xa;

  gl_FragColor = vec4(vec3(color) * diffuse, color * opacity);
}
