require(['libs/react-0.11.2.js', 'vorbisrecorder', 'scratchrecorder'], function(React, VorbisRecorder, ScratchRecorder) {
  var vorbisRecorder = new VorbisRecorder();
  var audio = new AudioContext();
  var App = React.createClass({
    getInitialState: function() {
      return { ready: false };
    },
    componentDidMount: function() {
      var self = this;
      vorbisRecorder.ready().then(this.setReady);
      chrome.storage.local.get('directory', function(items) {
        if(items.directory !== undefined) {
          chrome.fileSystem.restoreEntry(items.directory, self.setDirectory);
        }
      });
    },
    setReady: function() {
      this.setState({ ready: true });
    },
    chooseDirectory: function() {
      var self = this;
      chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {
        self.setDirectory(entry);
        var id = chrome.fileSystem.retainEntry(entry);
        chrome.storage.local.set({ directory: id });
      });
    },
    setDirectory: function(entry) {
      var self = this;
      self.setState({ directory: entry });
      if(entry) {
        chrome.fileSystem.getDisplayPath(entry, function(displayPath) {
          self.setState({ displayPath: displayPath });
        });
      }
    },
    clearDirectory: function() {
      this.setState({ directory: undefined });
    },
    render: function() {
      var DOM = React.DOM;
      if(!this.state.directory) {
        return DOM.button({type: 'button', onClick: this.chooseDirectory}, 'Choose Directory!');
      }
      if(!this.state.ready) {
        return DOM.div(null, 'Loading vorbis encoder, please wait...');
      }
      return DOM.div(null,
        'Ready! ' + this.state.displayPath,
        DOM.button({type: 'button', onClick: this.clearDirectory}, 'Clear Directory!'),
        ScratchRecorder({ vorbisRecorder: vorbisRecorder, audio: audio, directory: this.state.directory })
      );
    }
  });

  React.renderComponent(App(), document.getElementById('app-container'));
});
