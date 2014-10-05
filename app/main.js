require(['libs/react-0.11.2.js', 'vorbisrecorder'], function(React, VorbisRecorder) {
  var vorbisRecorder = new VorbisRecorder();
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
    render: function() {
      var DOM = React.DOM;
      if(!this.state.ready) {
        return DOM.div(null, 'Loading vorbis encoder, please wait...');
      }
      return DOM.div(null, 'Ready!');
    }
  });

  React.renderComponent(App(), document.getElementById('app-container'));
});
