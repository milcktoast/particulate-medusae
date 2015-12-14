/*global Promise*/
var Tweens = App.Tweens;

App.AudioController = AudioController;
function AudioController(params) {
  params = params || {};

  this.ctx = this.createAudioContext();
  this.baseUrl = params.baseUrl;
  this.volume = 0;
  this.distance = 0;
  this.tween = Tweens.factorTween({ volume : 0 }, 0.1);

  this._bufferCache = {};
  this._activeRequests = {};
  this._activeSounds = [];
}

AudioController.create = App.ctor(AudioController);
App.Dispatcher.extend(AudioController.prototype);
AudioController.prototype.VOLUME_ZERO = 0.001;

AudioController.prototype.AUDIO_TYPES = [
  {
    ext : 'ogg',
    type : 'audio/ogg; codecs=vorbis'
  }, {
    ext : 'mp3',
    type : 'audio/mpeg;'
  }
];

AudioController.prototype.createAudioContext = function () {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

AudioController.prototype.canCopyBuffers = window.AudioBuffer &&
  window.AudioBuffer.prototype.copyFromChannel;

AudioController.prototype.getAudioType = function () {
  if (this._audioType) { return this._audioType; }

  var audio = new Audio();
  var type = this.AUDIO_TYPES.find(function (codec) {
    return !!audio.canPlayType(codec.type).replace(/^no$/, '');
  });

  this._audioType = type;
  return type;
};

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
  var audioType = this.getAudioType();
  var fullUrl = this.baseUrl + path + '.' + audioType.ext;
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

AudioController.prototype._addActiveSound = function (sound, sounds) {
  sounds = sounds || this._activeSounds;
  sound.sourceNode.onended = this._removeActiveSound.bind(this, sound, sounds);
  return sounds.push(sound);
};

AudioController.prototype._removeActiveSound = function (sound, sounds) {
  sounds = sounds || this._activeSounds;
  var index = sounds.indexOf(sound);

  if (index !== -1) {
    sounds.splice(index, 1);
  }

  return sounds.length;
};

AudioController.prototype.loadBuffer = function (params) {
  var path = params.path;
  return this._findOrLoadBuffer(path);
};

AudioController.prototype.sliceBuffer = function (buffer, begin, end) {
  var ctx = this.ctx;
  var channels = buffer.numberOfChannels;
  var rate = buffer.sampleRate;

  var startOffset = rate * begin;
  var endOffset = rate * end;
  var frameCount = endOffset - startOffset;

  var slicedBuffer = ctx.createBuffer(channels, frameCount * 2, rate);
  var copyBuffer = new Float32Array(frameCount);
  var channel;

  for (channel = 0; channel < channels; channel ++) {
    buffer.copyFromChannel(copyBuffer, channel, startOffset);
    slicedBuffer.copyToChannel(copyBuffer, channel, 0);
    copyBuffer.reverse();
    slicedBuffer.copyToChannel(copyBuffer, channel, frameCount);
  }

  return slicedBuffer;
};

AudioController.prototype.createSound = function (buffer, params) {
  var ctx = this.ctx;
  var sourceNode = ctx.createBufferSource();
  var gainNode = ctx.createGain();
  var filterNode = ctx.createBiquadFilter();

  var globalVolume = this.volume;
  var volume = params.volume != null ? params.volume : 1;
  var offsetTime = params.offsetTime;

  var sound = {
    volume : volume,
    buffer : buffer,
    startTime : ctx.currentTime,
    offsetTime : offsetTime,
    sourceNode : sourceNode,
    gainNode : gainNode,
    filterNode : filterNode
  };

  filterNode.type = 'lowpass';
  filterNode.frequency.value = 320;
  sourceNode.buffer = buffer;
  sourceNode.loop = !!params.loop;
  gainNode.gain.value = globalVolume * volume;

  sourceNode.connect(gainNode);
  gainNode.connect(filterNode);
  filterNode.connect(ctx.destination);

  if (offsetTime != null) {
    sourceNode.start(0, offsetTime);
  }

  return sound;
};

AudioController.prototype.createSoundSlice = function (duration, sound) {
  var ctx = this.ctx;
  var buffer = sound.buffer;
  var soundStart = sound.startTime;
  var soundOffset = sound.offsetTime || 0;
  var offsetTime = (ctx.currentTime - soundStart + soundOffset) % buffer.duration;
  var bufferSlice = this.sliceBuffer(buffer, offsetTime, offsetTime + duration);

  sound.offsetTime = offsetTime;

  return this.createSound(bufferSlice, {
    volume : sound.volume * 0.8,
    offsetTime : 0,
    loop : true
  });
};

AudioController.prototype.playSound = function (params) {
  var path = params.path;

  return this._findOrLoadBuffer(path).then(function (buffer) {
    var sound = this.createSound(buffer, {
      volume : params.volume,
      loop : params.loop,
      offsetTime : 0
    });

    this._addActiveSound(sound);
    return sound;
  }.bind(this));
};

AudioController.prototype.updateVolume = function (volume) {
  this._activeSounds.forEach(function (sound) {
    sound.gainNode.gain.value = volume * sound.volume;
  });
};

AudioController.prototype.pause = function () {
  if (!this.canCopyBuffers) { return; }

  var sounds = this._activeSounds.slice();
  var soundSlices = sounds.map(
    this.createSoundSlice.bind(this, 0.5));

  sounds.forEach(function (sound) {
    sound.sourceNode.stop();
  });

  this._pausedSounds = sounds;
  this._activeSounds = soundSlices;
  this.updateVolume(this.volume);
};

AudioController.prototype.resume = function () {
  if (!this.canCopyBuffers) { return; }

  var prevSounds = this._activeSounds;
  var pausedSounds = this._pausedSounds;
  if (!pausedSounds) { return; }

  var activeSounds = [];

  pausedSounds.forEach(function (sound) {
    var newSound = this.createSound(sound.buffer, {
      offsetTime : sound.offsetTime,
      volume : sound.volume,
      loop : sound.sourceNode.loop
    });

    this._addActiveSound(newSound, activeSounds);
  }.bind(this));

  prevSounds.forEach(function (sound) {
    sound.sourceNode.stop();
  });

  this._pausedSounds = null;
  this._activeSounds = activeSounds;
  this.updateVolume(this.volume);
};

AudioController.prototype.update = function () {
  var volume = this.tween('volume', this.volume) * (1 - this.distance);

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
