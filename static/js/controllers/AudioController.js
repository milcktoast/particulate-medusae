var Tweens = App.Tweens;

App.AudioController = AudioController;
function AudioController(params) {
  params = params || {};

  this.ctx = new AudioContext();
  this.baseUrl = params.baseUrl;
  this.volume = 0;
  this.distance = 0;
  this.tween = Tweens.factorTween({ volume : 0 } , 0.05);

  this._bufferCache = {};
  this._activeRequests = {};
  this._activeSounds = [];
}

AudioController.create = App.ctor(AudioController);
App.Dispatcher.extend(AudioController.prototype);
AudioController.prototype.VOLUME_ZERO = 0.001;

AudioController.prototype._findOrLoadBuffer = function (path) {
  var cached = this._bufferCache[path];
  if (!cached) {
    return this._loadBuffer(path);
  }

  return new Promise(function (resolve) {
    resolve(cached);
  });
};

AudioController.prototype._loadBuffer = function (path) {
  var activeRequests = this._activeRequests;
  var request = activeRequests[path];
  if (request) { return request; }

  var cache = this._bufferCache;
  var ctx = this.ctx;
  var fullUrl = this.baseUrl + path + '.mp3';
  var xhr = new XMLHttpRequest();

  xhr.open('GET', fullUrl, true);
  xhr.responseType = 'arraybuffer';

  request = activeRequests[path] = new Promise(function (resolve, reject) {
    xhr.addEventListener('load', function() {
      ctx.decodeAudioData(xhr.response, resolve);
    });

    xhr.send();
  }).then(function (buffer) {
    cache[path] = buffer;
    delete activeRequests[path];
    return buffer;
  });

  return request;
};

AudioController.prototype._addActiveSound = function (sound) {
  return this._activeSounds.push(sound);
};

AudioController.prototype._removeActiveSound = function (sound) {
  var sounds = this._activeSounds;
  var index = sounds.indexOf(sound);

  if (index !== -1) {
    sounds.splice(index, 1);
  }

  return sounds.length;
};

AudioController.prototype.createSound = function (buffer, params) {
  params = params || {};

  var ctx = this.ctx;
  var source = ctx.createBufferSource();
  var gainNode = ctx.createGain();
  var globalVolume = this.volume;
  var volume = params.volume != null ? params.volume : 1;

  var sound = {
    volume : volume,
    source : source,
    gainNode : gainNode
  };

  source.buffer = buffer;
  source.loop = !!params.loop;
  gainNode.gain.value = globalVolume * volume;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  this._addActiveSound(sound);
  source.onended = this._removeActiveSound.bind(this, sound);

  return sound;
};

AudioController.prototype.loadSound = function (params) {
  var path = params.path;
  return this._findOrLoadBuffer(path);
};

AudioController.prototype.playSound = function (params) {
  var path = params.path;

  return this._findOrLoadBuffer(path).then(function (buffer) {
    var sound = this.createSound(buffer, params);

    sound.source.start(0);
    return sound;
  }.bind(this));
};

AudioController.prototype.updateVolume = function (volume) {
  this._activeSounds.forEach(function (sound) {
    sound.gainNode.gain.value = volume * sound.volume;
  });
};

AudioController.prototype.update = function () {
  var tweenFactor = this.volume > 0 ? 0.005 : 0.1;
  var volume = this.tween('volume', this.volume, tweenFactor);

  volume *= (1 - this.distance);

  if (volume !== this.volume) {
    this.updateVolume(volume);
  }

  if (this.isMuted && volume > this.VOLUME_ZERO) {
    this.triggerListeners('unmute');
    this.isMuted = false;
  }

  if (!this.isMuted && volume <= this.VOLUME_ZERO) {
    this.triggerListeners('mute');
    this.isMuted = true;
  }
};
