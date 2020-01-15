import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

class QuestionNotifier extends ChangeNotifier {
  QuestionNotifier() {
    setInitial();
    Timer(const Duration(seconds: 1), goToNext);
    SharedPreferences.getInstance().then((prefs) {
      for (final relative in Relative.values) {
        _lastDifferences[relative.toString()] =
            prefs.getString(relative.toString());
      }
    });
  }
  bool _didAnswer = false;
  bool get didAnswer => _didAnswer;
  bool _doShowCentInAnswer = true;
  bool get doShowCentInAnswer => _doShowCentInAnswer;
  final List<int> _answerCents = List.filled(3 + 1, 0);
  List<int> get answerCents => _answerCents;
  double _do4Frequency;
  double get do4Frequency => _do4Frequency;
  List<int> _relativeIndexes;
  List<int> _correctCents;
  List<int> get correctCents => _correctCents;
  List<int> get relativeIndexes => _relativeIndexes;
  final List<FixedExtentScrollController> _answerWheelControllers =
      List<void>(3 + 1).map((_) => FixedExtentScrollController()).toList();
  List<FixedExtentScrollController> get answerWheelControllers =>
      _answerWheelControllers;
  List<int> _fixedAnswerCents = List.filled(3 + 1, 0);
  List<int> get fixedAnswerCents => _fixedAnswerCents;
  bool _canMakeSound = true;
  bool get canMakeSound => _canMakeSound;
  final Map<String, String> _lastDifferences = {};
  Map<String, String> get lastDifferences => _lastDifferences;

  void setAnswerCent(int index, int answerCent) {
    _answerCents[index] = answerCent;
    notifyListeners();
  }

  String oneDifferenceText(int index) {
    final _diff = _fixedAnswerCents[index] - _correctCents[index];
    final _prefix = _diff >= 0 ? '+' : '';
    return '$_prefix${_diff.toString()}';
  }

  int get totalDifference {
    var _temp = 0;
    for (var i = 0; i < 3; i++) {
      _temp = _temp + (_fixedAnswerCents[i] - _correctCents[i]).abs();
    }
    return _temp;
  }

  void answer() {
    _didAnswer = true;
    _fixedAnswerCents = _answerCents.toList();
    SharedPreferences.getInstance().then((prefs) {
      for (var i = 0; i < 3; i++) {
        _lastDifferences[Relative.values[_relativeIndexes[i]].toString()] =
            oneDifferenceText(i);
        prefs.setString(Relative.values[_relativeIndexes[i]].toString(),
            oneDifferenceText(i));
      }
    });
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
    _canMakeSound = false;
    final _futures = <Future>[];
    for (var i = 0; i < 3 + 1; i++) {
      var _rand = Random().nextInt(200) - 100;
      if (_rand < 0) {
        _rand = _rand - 50;
      } else {
        _rand = _rand + 50;
      }
      _futures.add(_answerWheelControllers[i].animateToItem(
          _correctCents[i] + (3501 - 1) ~/ 2 + (i == 3 ? 0 : _rand),
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut));
    }
    Future.wait<dynamic>(_futures).then((_) {
      _canMakeSound = true;
      notifyListeners();
    });
    notifyListeners();
  }

  void setInitial() {
    _didAnswer = false;
    _do4Frequency = 440;
    _relativeIndexes = List.filled(3 + 1, Relative.Do4.index);
    _correctCents = List.filled(3 + 1, 440);
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
    final _maxDiff =
        _temp.map((n) => (n - Relative.Do4.index).abs()).reduce(max);
    final _random = Random().nextInt(7);
    if (_maxDiff <= _random) {
      _isOK = false;
    }
  } while (_isOK == false);
  return _temp;
}
