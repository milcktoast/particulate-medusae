var Faces = App.Faces = {};

Faces.radial = function (indexCenter, index, howMany, buffer) {
  for (var i = 0, il = howMany - 1; i < il; i ++) {
    buffer.push(indexCenter, index + i + 1, index + i);
  }
  buffer.push(indexCenter, index, index + howMany - 1);
  return buffer;
};
