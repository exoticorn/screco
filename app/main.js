require(['libs/react-0.11.2.js', 'vorbisrecorder'], function(React, VorbisRecorder) {
  var vorbisRecorder = new VorbisRecorder();
  var audio = new AudioContext();
  var App = React.createClass({
    getInitialState: function() {
      return { ready: false };
    },
    componentDidMount: function() {
      vorbisRecorder.ready().then(this.setReady);
    },
    setReady: function() {
      this.setState({ ready: true });
    },
    startRecording: function() {
      var self = this;
      navigator.webkitGetUserMedia({audio: true}, function(stream) {
        self.setState({
          recorder: vorbisRecorder.startRecording(
            stream.getAudioTracks()[0]
          )
        });
      }, function(e) {
        console.log(e);
      });
    },
    stopRecording: function() {
      this.state.recorder.stop().then(function(data) {
        console.log(data.byteLength);
        audio.decodeAudioData(data, function(buffer) {
          var source = audio.createBufferSource();
          source.buffer = buffer;
          source.connect(audio.destination);
          source.start();
        }, function() {
          console.log('failed to decode audio data');
        });
      });
      this.setState({ recorder: undefined });
    },
    render: function() {
      var DOM = React.DOM;
      if(!this.state.ready) {
        return DOM.div(null, 'Loading vorbis encoder, please wait...');
      }
      return DOM.div(null,
        'Ready!',
        this.state.recorder ?
          DOM.button({type: 'button', onClick: this.stopRecording}, 'Stop recording') :
          DOM.button({type: 'button', onClick: this.startRecording}, 'Start recording')
      );
    }
  });

  React.renderComponent(App(), document.getElementById('app-container'));
});
