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
      navigator.webkitGetUserMedia({audio: true}, function(stream) {
        self.setState({
          recorder: self.props.vorbisRecorder.startRecording(
            stream.getAudioTracks()[0]
          ),
          stream: stream,
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
      this.setState({ recorder: undefined });
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