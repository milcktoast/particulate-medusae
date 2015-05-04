module('Constraint.LocalPlane');

var ParticleSystem = Particulate.ParticleSystem;
var LocalPlaneConstraint = App.LocalPlaneConstraint;
var Vec3 = Particulate.Vec3;

test('Creation', function () {
  var pa = 0, pb = 1, pc = 2;
  var a = 3;
  var indices = [3, 4, 5];
  var fromArgs = LocalPlaneConstraint.create(pa, pb, pc, a);
  var fromArray = LocalPlaneConstraint.create(pa, pb, pc, indices);

  Test.assert.equalArray(fromArgs.indices, [pa, pb, pc, a],
    'Should create indices from int arguments.');
  Test.assert.equalArray(fromArray.indices, [pa, pb, pc].concat(indices),
    'Should create indices from int array.');
});

function testPlane(expectedZ, v0, v1, v2) {
  var system = ParticleSystem.create(10, 10);
  var singleIndex = 3;
  var single = LocalPlaneConstraint.create(0, 1, 2, singleIndex);
  var manyIndices = [4, 5, 6, 7, 8, 9];
  var many = LocalPlaneConstraint.create(0, 1, 2, manyIndices);
  var pos = Vec3.create();

  function getZ(index) {
    return system.getPosition(index, pos)[2];
  }

  function returnExpected() {
    return expectedZ;
  }

  system.setPosition(0, v0);
  system.setPosition(1, v1);
  system.setPosition(2, v2);

  system.addConstraint(single);
  system.addConstraint(many);
  system.tick(20);

  Test.assert.closeArray(many.bufferVec3, [0, 0, 1], 0.1,
    'Should cache plane normal vector.');
  Test.assert.close(getZ(singleIndex), expectedZ, 0.1,
    'Should constrain single set of particles to plane.');
  Test.assert.closeArray(manyIndices.map(getZ), manyIndices.map(returnExpected), 0.1,
    'Should constrain multiple sets of particles to plane.');
}

test('Application', function () {
  testPlane(10,
    [25, 15, 10],
    [10, 10, 10],
    [50, 30, 10]);
});

test('Application with inline segments', function () {
  testPlane(10,
    [ 5,  5, 10],
    [10, 10, 10],
    [15, 15, 10]);
});

// Plane behind particles, should have no effect
test('Non-application when behind particles', function () {
  testPlane(0,
    [10, 10, -2],
    [ 0,  0, -2],
    [20, 20, -2]);
});
