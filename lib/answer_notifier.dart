import 'package:flutter/material.dart';

class AnswerNotifier extends ChangeNotifier {
  AnswerNotifier({@required List<int> correctCents})
      : _correctCents = correctCents;
  bool _didAnswer = false;
  bool get didAnswer => _didAnswer;
  bool _doShowCentInAnswer = true;
  bool get doShowCentInAnswer => _doShowCentInAnswer;
  final List<int> _correctCents;
  final List<int> _answerCents = List.filled(3 + 1, 0);

  void setAnswerCent(int index, int answerCent) {
    _answerCents[index] = answerCent;
  }

  String oneDifferenceText(int index) {
    final _diff = _answerCents[index] - _correctCents[index];
    final _prefix = _diff >= 0 ? '+' : '';
    return '$_prefix${_diff.toString()}';
  }

  int get totalDifference {
    var _temp = 0;
    for (var i = 0; i < 3; i++) {
      _temp = _temp + (_answerCents[i] - _correctCents[i]).abs();
    }
    return _temp;
  }

  void answer() {
    _didAnswer = true;
    notifyListeners();
  }

  void toggleShowCentsInAnswer() {
    _doShowCentInAnswer = !_doShowCentInAnswer;
    notifyListeners();
  }
}
