import 'dart:math';

import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class QuestionNotifier extends ChangeNotifier {
  QuestionNotifier() {
    goToNext();
  }
  bool _didAnswer = false;
  bool get didAnswer => _didAnswer;
  bool _doShowCentInAnswer = true;
  bool get doShowCentInAnswer => _doShowCentInAnswer;
  final List<int> _answerCents = List.filled(3 + 1, 0);
  double _do4Frequency;
  double get do4Frequency => _do4Frequency;
  List<int> _relativeIndexes;
  List<int> _correctCents;
  List<int> get relativeIndexes => _relativeIndexes;

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

  void goToNext() {
    _didAnswer = false;
    _do4Frequency =
        440 * pow(2, (Random().nextDouble() * 11 - 9) / 12).toDouble();
    _relativeIndexes = _generateRelativeIndexes() + [Relative.Do4.index];
    _correctCents = _relativeIndexes
            .map((index) => Note.fromRelative(Relative.values[index]).cent)
            .toList() +
        [Note.fromRelative(Relative.Do4).cent];
    notifyListeners();
  }

  void toggleShowCentsInAnswer() {
    _doShowCentInAnswer = !_doShowCentInAnswer;
    notifyListeners();
  }
}

List<int> _generateRelativeIndexes() {
  bool _isOK;
  List<int> _temp;
  do {
    _isOK = true;
    _temp =
        List.generate(3, (_) => Random().nextInt(Relative.values.length - 1))
            .toList();
    if (_temp.last == Relative.Do4.index ||
        (_temp.last - Relative.Do4.index).abs() > 4) {
      _isOK = false;
    }
    if (_temp.last == Relative.Fa3.index ||
        _temp.last == Relative.La3.index ||
        _temp.last == Relative.Fa4.index ||
        _temp.last == Relative.La4.index) {
      _isOK = false;
    }
    for (var i = 0; i < _temp.length - 1; i++) {
      if ((_temp[i] - _temp[i + 1]).abs() > 4) {
        _isOK = false;
        break;
      }
      if (_temp[i] == _temp[i + 1]) {
        _isOK = false;
        break;
      }
    }
  } while (_isOK == false);
  return _temp;
}
