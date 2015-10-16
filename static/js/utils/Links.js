var Links = App.Links = {};

Links.line = function (index, howMany, buffer) {
  var a, b;

  for (var i = 0; i < howMany - 1; i ++) {
    a = index + i;
    b = index + i + 1;

    buffer.push(a, b);
  }

  return buffer;
};

Links.loop = function (index, howMany, buffer) {
  var a, b;

  for (var i = 0; i < howMany - 1; i ++) {
    a = index + i;
    b = index + i + 1;

    buffer.push(a, b);
  }

  a = index;
  b = index + howMany - 1;

  buffer.push(a, b);

  return buffer;
};

Links.rings = function (index0, index1, howMany, buffer) {
  var a, b;

  for (var i = 0; i < howMany; i ++) {
    a = index0 + i;
    b = index1 + i;

    buffer.push(a, b);
  }

  return buffer;
};

Links.radial = function (indexCenter, index, howMany, buffer) {
  var b;

  for (var i = 0; i < howMany; i ++) {
    b = index + i;

    buffer.push(indexCenter, b);
  }

  return buffer;
};
