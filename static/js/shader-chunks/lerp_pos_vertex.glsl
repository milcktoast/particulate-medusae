vec4 mvPosition = modelViewMatrix * vec4(mix(positionPrev, position, time), 1.0);
gl_Position = projectionMatrix * mvPosition;
