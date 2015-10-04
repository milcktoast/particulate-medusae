var Geometry = App.Geometry = {};

Geometry.point = function (x, y, z, buffer) {
  buffer.push(x, y, z);
  return buffer;
};

Geometry.circle = function (segments, radius, y, buffer) {
  var step = Math.PI * 2 / segments;
  var angle = 0;
  var x, z;

  for (var i = 0; i < segments; i ++) {
    x = Math.cos(angle) * radius;
    z = Math.sin(angle) * radius;

    buffer.push(x, y, z);
    angle += step;
  }
  return buffer;
};
