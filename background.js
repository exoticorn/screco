chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'id': 'MainWindow',
    'bounds': {
      'width': 800,
      'height': 600
    }
  });
});
