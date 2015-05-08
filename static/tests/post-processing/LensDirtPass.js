module('Pass.LensDirt');

var _slice = Array.prototype.slice;
var equalArray = Test.assert.equalArray;
var pass = App.LensDirtPass;

test('Set quad uvs', function () {
  var count = 5;
  var cells = 2;
  var uvAttr = pass.prototype._quadGeomUv(count, cells);
  var uvArray = uvAttr.array;

  var c0 = 0;
  var c1 = 1 / cells;
  var c2 = c1 * 2;

  equalArray(_slice.call(uvArray, 0, 8),
    [c0, c0, c1, c0, c1, c1, c0, c1],
    'first quad uvs');
  equalArray(_slice.call(uvArray, 8, 16),
    [c1, c0, c2, c0, c2, c1, c1, c1],
    'second quad uvs');
  equalArray(_slice.call(uvArray, 16, 24),
    [c0, c1, c1, c1, c1, c2, c0, c2],
    'third quad uvs');
  equalArray(_slice.call(uvArray, 24, 32),
    [c1, c1, c2, c1, c2, c2, c1, c2],
    'fourth quad uvs');
  equalArray(_slice.call(uvArray, 32, 40),
    [c0, c0, c1, c0, c1, c1, c0, c1],
    'fifth quad uvs');
});
