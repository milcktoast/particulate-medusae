/*global Howler, Howl*/
var Tweens = App.Tweens;

App.AudioController = AudioController;
function AudioController(config) {
  this.baseUrl = config.baseUrl;

  this._loops = [];
  this._tweens = { volume : 0 };
  this._volume = 0;

  Howler.volume(0);
  this.tween = Tweens.factorTween(this._tweens, 0.05);
}

AudioController.create = App.ctor(AudioController);
App.Dispatcher.extend(AudioController.prototype);

AudioController.prototype.createSound = function (path, params) {
  params = params || {};
  params.urls = [
    this.baseUrl + path + '.mp3',
    this.baseUrl + path + '.ogg'
  ];

  return new Howl(params);
};

AudioController.prototype.setVolume = function (volume) {
  this._volume = volume;
};

var ZERO = 0.001;
AudioController.prototype.update = function () {
  var tweenFactor = this._volume > 0 ? 0.005 : 0.1;
  var volume = this.tween('volume', this._volume, tweenFactor);

  if (volume !== this._volume) {
    Howler.volume(volume);
  }

  if (this._isMuted && volume > ZERO) {
    Howler.unmute();
    this.triggerListeners('unmute');
    this._isMuted = false;
  }

  if (!this._isMuted && volume <= ZERO) {
    Howler.mute();
    this.triggerListeners('mute');
    this._isMuted = true;
  }
};
