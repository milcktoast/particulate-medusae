uniform vec3 diffuse;
uniform float opacity;
varying vec3 vNormal;

void main() {
  vec3 eye = vec3(0.0, 0.0, 1.0);
  vec3 normal = normalize(mat3(viewMatrix) * vNormal);
  float rim = 1.0 - max(dot(eye, normal), 0.0);

  float rimLight = 0.25 +
    smoothstep(0.25, 1.0, rim) * 0.5 +
    smoothstep(0.90, 1.0, rim) * 0.8;

  gl_FragColor.rgb = diffuse * vec3(rimLight);
  gl_FragColor.a = opacity;
}
