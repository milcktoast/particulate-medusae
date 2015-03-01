/*global Howl*/
var Tweens = App.Tweens;

App.AudioController = AudioController;
function AudioController(config) {
  this._isEnabled = true;
  this._urls = {};
  this._soundNames = [];
  this._volume = {};
  this._volumeTarget = {};
  this._playing = {};

  this.baseUrl = config.baseUrl;
  this.sounds = {};

  this.tweenVolume = Tweens.factorTween(this._volume, 0.05);
}

AudioController.create = App.ctor(AudioController);

AudioController.prototype.addSound = function (path, name) {
  name = name || path;
  var url = this.baseUrl + path;

  this._soundNames.push(name);

  this._urls[name] = [
    url + '.mp3',
    url + '.ogg'
  ];
};

AudioController.prototype.createSound = function (name, params) {
  var sound = this.sounds[name];
  if (sound) { return sound; }

  params = params || {};
  params.urls = this._urls[name];

  sound = new Howl(params);
  sound.sid = name;

  this._volume[name] = 0;
  this._volumeTarget[name] = params.volume || 0;
  this.sounds[name] = sound;
  return sound;
};

AudioController.prototype.getSound = function (name) {
  return this.sounds[name] || this.createSound(name);
};

AudioController.prototype.playSound = function (name) {
  if (!this._isEnabled) { return; }
  var sound = this.getSound(name);
  if (!sound) { return; }
  if (!sound._loaded) {
    setTimeout(this.playSound.bind(this, name), 250);
    return;
  }

  this._playing[name] = true;
  sound.play();
};

AudioController.prototype.pauseSound = function (name) {
  if (!this._playing[name]) { return; }
  this.sounds[name].pause();
  this._playing[name] = false;
};

AudioController.prototype.setVolume = function (name, volume) {
  this._volumeTarget[name] = volume;
};

AudioController.prototype.stopSound = function (name) {
  this.getSound(name).stop();
};

AudioController.prototype.stopAllSounds = function () {
  var names = this._soundNames;
  var sounds = this.sounds;
  var sound;

  for (var i = 0, il = names.length; i < il; i ++) {
    sound = sounds[names[i]];
    if (!sound) { continue; }
    sound.stop();
  }
};

AudioController.prototype.enableSound = function () {
  this._isEnabled = true;
};

AudioController.prototype.disableSound = function () {
  this._isEnabled = false;
  this.stopAllSounds();
};

AudioController.prototype.update = function () {
  var sounds = this.sounds;
  var names = this._soundNames;
  var playing = this._playing;
  var volumeTarget = this._volumeTarget;
  var name, sound, volume;

  for (var i = 0, il = names.length; i < il; i ++) {
    name = names[i];
    sound = sounds[name];
    if (!(sound && sound._loaded)) { continue; }

    // Update volume
    volume = this.tweenVolume(name, volumeTarget[name]);

    if (volume < 0.0001 && playing[name]) {
      sound.pause();
    } else {
      if (!playing[name]) { this.playSound(name); }
      sound.volume(volume);
    }
  }
};
