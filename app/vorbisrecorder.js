define(function() {
  "use strict";
  var VorbisRecorder = function() {
    var self = this;
    var nextId = 1;
    var instances = {};
    var vorbis = new Promise(function(resolve, reject) {
      var vorbis = document.createElement('embed');
      vorbis.addEventListener('load', function() {
        resolve(vorbis);
      });
      vorbis.addEventListener('message', function(event) {
        if(typeof event.data === 'object') {
          var response = event.data;
          var inst = instances[response.id];
          if(inst) {
            inst.resolve(response.data);
            instances[response.id] = undefined;
          }
        } else {
          console.log(event.data);
        }
      });
      vorbis.setAttribute('width', '0');
      vorbis.setAttribute('height', '0');
      vorbis.setAttribute('src', 'vorbis.nmf');
      vorbis.setAttribute('type', 'application/x-pnacl');
      vorbis.setAttribute('style', 'position: fixed');
      document.body.appendChild(vorbis);
    });
    return {
      ready: function() {
        return vorbis.then(function() { return self; });
      },
      startRecording: function(track, channelConfig, quality) {
        var id = nextId++;
        if(channelConfig === undefined) {
          channelConfig = VorbisRecorder.MONO;
        }
        var numChannels = channelConfig === VorbisRecorder.STEREO ? 2 : 1;
        vorbis.then(function(vorbis) {
          vorbis.postMessage({cmd: 'startRecording', id: id, track: track, numChannels: numChannels, sourceChannel: channelConfig, quality: quality});
        });
        var inst = {
          stop: function() {
            vorbis.then(function(vorbis) {
              vorbis.postMessage({cmd: 'stopRecording', id: id});
            });
            return this.data;
          }
        };
        inst.data = new Promise(function(resolve, reject) {
          inst.resolve = resolve;
          inst.reject = reject;
        });
        instances[id] = inst;
        return inst;
      },
      startEncoding: function(channelConfig, quality) {
        var id = nextId++;
        if(channelConfig === undefined) {
          channelConfig = VorbisRecorder.MONO;
        }
        var numChannels = channelConfig === VorbisRecorder.STEREO ? 2 : 1;
        vorbis.then(function(vorbis) {
          vorbis.postMessage({cmd: 'startEncoding', id: id, numChannels: numChannels, sourceChannel: channelConfig, quality: quality});
        });
        var inst = {
          encodeData: function(data, numChannels) {
            vorbis.then(function(vorbis) {
              vorbis.postMessage({cmd: 'encodeData', id: id, data: data.buffer ? data.buffer : data, numChannels: numChannels});
            });
          },
          stop: function() {
            vorbis.then(function(vorbis) {
              vorbis.postMessage({cmd: 'stopEncoding', id: id});
            });
            return this.data;
          }
        };
        inst.data = new Promise(function(resolve, reject) {
          inst.resolve = resolve;
          inst.reject = reject;
        });
        instances[id] = inst;
        return inst;
      }
    };
  };
  VorbisRecorder.STEREO = -2;
  VorbisRecorder.MONO = -1;
  VorbisRecorder.MONO_LEFT = 0;
  VorbisRecorder.MONO_RIGHT = 1;

  return VorbisRecorder;
});
