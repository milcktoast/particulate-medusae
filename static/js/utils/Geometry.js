var Geometry = App.Geometry = {};

Geometry.point = function (x, y, z, buffer) {
  buffer.push(x, y, z);
  return buffer;
};

Geometry.circle = function (segments, radius, yOffset, buffer) {
  var step = Math.PI * 2 / segments;
  var angle = 0;

  for (var i = 0; i < segments; i ++) {
    buffer.push(
      Math.cos(angle) * radius,
      yOffset,
      Math.sin(angle) * radius
    );

    angle += step;
  }
  return buffer;
};
