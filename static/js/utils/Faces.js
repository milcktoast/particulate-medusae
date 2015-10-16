var Faces = App.Faces = {};

Faces.quad = function (a, b, c, d, buffer) {
  buffer.push(
    a, b, c,
    c, d, a);

  return buffer;
};

Faces.quadDoubleSide = function (a, b, c, d, buffer) {
  buffer.push(
    a, b, c,
    c, d, a,
    d, c, b,
    b, a, d);

  return buffer;
};

Faces.radial = function (indexCenter, index, howMany, buffer) {
  var b, c;

  for (var i = 0, il = howMany - 1; i < il; i ++) {
    b = index + i + 1;
    c = index + i;

    buffer.push(indexCenter, b, c);
  }

  b = index;
  c = index + howMany - 1;

  buffer.push(indexCenter, b, c);

  return buffer;
};

Faces.rings = function (index0, index1, howMany, buffer) {
  var a, b, c, d;

  for (var i = 0, il = howMany - 1; i < il; i ++) {
    a = index0 + i;
    b = index0 + i + 1;
    c = index1 + i + 1;
    d = index1 + i;

    buffer.push(
      a, b, c,
      c, d, a);
  }

  a = index0 + howMany - 1;
  b = index0;
  c = index1;
  d = index1 + howMany - 1;

  buffer.push(
    a, b, c,
    c, d, a);

  return buffer;
};
