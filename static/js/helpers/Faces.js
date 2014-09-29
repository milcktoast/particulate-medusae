var Faces = App.Faces = {};

Faces.radial = function (indexCenter, index, howMany, buffer) {
  for (var i = 0, il = howMany - 1; i < il; i ++) {
    buffer.push(indexCenter, index + i + 1, index + i);
  }
  buffer.push(indexCenter, index, index + howMany - 1);
  return buffer;
};

Faces.rings = function (index0, index1, howMany, buffer) {
  var a, b, c, d;
  for (var i = 0, il = howMany - 1; i < il; i ++) {
    a = index0 + i;
    b = index0 + i + 1;
    c = index1 + i + 1;
    d = index1 + i;
    buffer.push(a, b, c);
    buffer.push(c, d, a);
  }
  a = index0 + howMany - 1;
  b = index0;
  c = index1;
  d = index1 + howMany - 1;
  buffer.push(a, b, c);
  buffer.push(c, d, a);
  return buffer;
};
