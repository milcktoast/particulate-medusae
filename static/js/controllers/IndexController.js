var ToggleComponent = App.ToggleComponent;
var ModalComponent = App.ModalComponent;
var ColorComponent = App.ColorComponent;
var Features = App.Features;
var keysTop = [85, 73, 79, 80];

App.register('index', function index() {
  var scene = App.MainScene.create();
  var controls = document.getElementById('container-controls');

  var dotsToggle = ToggleComponent.create({
    name : 'dots',
    key : keysTop[0]
  });

  var postFxToggle = ToggleComponent.create({
    name : 'postfx',
    key : keysTop[3],
    isActive : scene.usePostFx
  });

  var simToggle = ToggleComponent.create({
    name : 'sim',
    key : 32,
    isActive : scene.shouldAnimate
  });

  ModalComponent.create({
    name : 'info'
  });

  scene.initItems();
  scene.initForces();
  scene.appendRenderer();

  postFxToggle.addListener('toggle', scene, 'togglePostFx');
  dotsToggle.addListener('toggle', scene, 'toggleDots');
  dotsToggle.addListener('toggle', scene, 'toggleStats');
  simToggle.addListener('toggle', scene, 'toggleAnimate');

  setupAudio(scene);
  setupColors(scene);
  setupSystemUI(scene);

  setTimeout(function () {
    scene.loop.start();
    controls.className = 'active';
  }, 0);
});

function setupAudio(scene) {
  /*global Promise*/
  var tests = [
    Features.detectWebAudio(),
    Features.detectAudioCodecs(['audio/ogg; codecs=vorbis', 'audio/mpeg;']),
    Features.detectAudioAutoplay()
  ];

  var audioToggle = ToggleComponent.create({
    name : 'audio',
    key : keysTop[2]
  });

  Promise.all(tests).then(function () {
    scene.initAudio();
    scene.addListener('load:audio', function () {
      audioToggle.addListener('toggle', scene, 'toggleAudio');
      audioToggle.toggleState();
    });
  }, function (err) {
    audioToggle.hide();
    App.log('Audio features not supported');
  });
}

function setupColors(scene) {
  var colorsToggle = ToggleComponent.create({
    name : 'colors',
    menu : 'colors',
    key : keysTop[1]
  });

  Features.detectInputType('color').then(function () {
    scene.medusae.colors.forEach(function (color) {
      var controller = ColorComponent.create({
        label : color.label,
        color : color.uniform.value
      });

      controller.addListener('change', scene, 'makeDirty');
      colorsToggle.menuInner.appendChild(controller.element);
    });
  }, function (err) {
    colorsToggle.hide();
    App.log('Color input not supported');
  });
}

function setupSystemUI(scene) {
  var Format = App.Format;
  var system = scene.medusae.system;
  var particleEl = document.getElementById('particle-count');
  var constraintEl = document.getElementById('constraint-count');
  var forceEl = document.getElementById('force-count');

  var constraintCount = system._localConstraints.reduce(function (prev, current) {
    return prev + current._count;
  }, 0);

  particleEl.textContent = Format.number(system._count);
  constraintEl.textContent = Format.number(constraintCount);
  forceEl.textContent = Format.number(system._forces.length);
}
