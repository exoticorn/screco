define(['libs/react-0.11.2.js'], function(React) {
  'use strict';
  var DOM = React.DOM;
  
  return React.createClass({
    getInitialState: function() { return {}; },
    componentWillUnmount: function() {
      if(this.state.stream) {
        this.stopRecording();
      }
    },
    startRecording: function() {
      var self = this;
      var date = new Date();
      var audio = this.props.audio;
      navigator.webkitGetUserMedia({audio: { mandatory: { echoCancellation: false } }}, function(stream) {
        var streamSource = audio.createMediaStreamSource(stream);
        var streamDest = audio.createMediaStreamDestination();
        var compressor = audio.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.reduction.value = -20;
        compressor.attack.value = 0.05;
        compressor.release.value = 0.25;
        var delay = audio.createDelay(0.1);
        streamSource.connect(compressor);
        compressor.connect(delay);
        compressor.connect(streamDest);
        var gain = audio.createGain();
        gain.gain.value = 0.25;
        delay.connect(gain);
        gain.connect(streamDest);
        delay.delayTime.value = 0.05;
        self.setState({
          recorder: self.props.vorbisRecorder.startRecording(
            streamDest.stream.getAudioTracks()[0]
          ),
          stream: stream,
          nodes: [streamSource, streamDest, delay, gain, compressor],
          filename: date.toISOString() + '.ogg',
          directory: self.props.directory
        });
      }, function(e) {
        console.log(e);
      });
    },
    stopRecording: function() {
      var audio = this.props.audio;
      var self = this;
      if(self.state.stream.stop) {
        self.state.stream.stop();
      }
      self.state.stream.getAudioTracks().forEach(function(track) {
        if(track.stop) {
          track.stop();
        }
      });
      self.state.nodes.forEach(function(node) { node.disconnect(); });
      this.state.recorder.stop().then(function(data) {
        self.state.directory.getFile(self.state.filename, {create: true, exclusive: true}, function(entry) {
          entry.createWriter(function(writer) {
            writer.write(new Blob([data]));
          }, function(err) {
            console.log(err);
          });
        }, function(err) {
          console.log(err);
        });
      });
      this.setState({ recorder: undefined, nodes: undefined });
    },
    render: function() {
      return DOM.div(null,
        this.state.recorder === undefined ?
          DOM.button({type: 'button', onClick: this.startRecording}, 'Start recording') :
          DOM.div(null,
            DOM.button({type: 'button', onClick: this.stopRecording}, 'Stop recording'),
            'Recording as: ' + this.state.filename
          )
      );
    }
  });
});