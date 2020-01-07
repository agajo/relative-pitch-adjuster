import 'dart:async';
import 'dart:js' as js;

class JsCaller {
  void play(double frequency) {
    js.context.callMethod('play', <double>[frequency]);
  }

  void stop() {
    js.context.callMethod('stop');
  }

  void setNote(double frequency) {
    js.context.callMethod('setNote', <double>[frequency]);
  }

  bool _isPlaying = false;
  Timer _timer;
  void playLong(double frequency) {
    if (_isPlaying) {
      js.context.callMethod('setNote', <double>[frequency]);
    } else {
      js.context.callMethod('play', <double>[frequency]);
      _isPlaying = true;
    }
    _timer?.cancel();
    _timer = Timer(const Duration(seconds: 3), () {
      js.context.callMethod('stop');
      _isPlaying = false;
    });
  }
}
