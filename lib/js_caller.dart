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

  void playLong(double frequency) {
    js.context.callMethod('playLong', <double>[frequency]);
  }
}
