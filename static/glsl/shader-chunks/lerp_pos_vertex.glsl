vec4 mvPosition = modelViewMatrix * vec4(mix(positionPrev, position, stepProgress), 1.0);
gl_Position = projectionMatrix * mvPosition;
