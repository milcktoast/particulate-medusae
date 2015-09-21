/*global Howler, Howl*/
var Tweens = App.Tweens;

App.AudioController = AudioController;
function AudioController(config) {
  this.baseUrl = config.baseUrl;
  this.volume = 0;
  this.distance = 0;
  this.tween = Tweens.factorTween({ volume : 0 } , 0.05);

  Howler.volume(0);
}

AudioController.create = App.ctor(AudioController);
App.Dispatcher.extend(AudioController.prototype);
AudioController.prototype.VOLUME_ZERO = 0.001;

AudioController.prototype.createSound = function (path, params) {
  params = params || {};
  params.urls = [
    this.baseUrl + path + '.mp3',
    this.baseUrl + path + '.ogg'
  ];

  return new Howl(params);
};

AudioController.prototype.update = function () {
  var tweenFactor = this.volume > 0 ? 0.005 : 0.1;
  var volume = this.tween('volume', this.volume, tweenFactor);

  volume *= (1 - this.distance);

  if (volume !== this.volume) {
    Howler.volume(volume);
  }

  if (this.isMuted && volume > this.VOLUME_ZERO) {
    Howler.unmute();
    this.triggerListeners('unmute');
    this.isMuted = false;
  }

  if (!this.isMuted && volume <= this.VOLUME_ZERO) {
    Howler.mute();
    this.triggerListeners('mute');
    this.isMuted = true;
  }
};
