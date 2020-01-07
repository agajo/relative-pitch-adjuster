import 'dart:js' as js;

class JsCaller {
  void play(double frequency) {
    js.context.callMethod('play', <double>[frequency]);
  }

  void stop() {
    js.context.callMethod('stop');
  }
}
