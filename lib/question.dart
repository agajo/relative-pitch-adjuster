import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_note.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

// 1問1問に相当するWidget。
// このWidgetを新しく作って出題し、次の問題に行く時に結果だけ受け取って破棄。
class Question extends StatelessWidget {
  final double _do4Frequency =
      440 * pow(2, (Random().nextDouble() * 11 - 9) / 12).toDouble();
  final List<int> _relativeIndexes = _generateRelativeIndexes();

  @override
  Widget build(BuildContext context) {
    final _relatives = _relativeIndexes.map((n) => Relative.values[n]).toList();
    return ChangeNotifierProvider<AnswerNotifier>(
      create: (context) => AnswerNotifier(
          correctCents: _relatives
                  .map((relative) => Note.fromRelative(relative).cent)
                  .toList() +
              [0]),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AnswerResultGap(),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: <Widget>[
              QuestionNote(
                relative: _relatives[0],
                do4Frequency: _do4Frequency,
                noteIndex: 0,
              ),
              QuestionNote(
                relative: _relatives[1],
                do4Frequency: _do4Frequency,
                noteIndex: 1,
              ),
              QuestionNote(
                relative: _relatives[2],
                do4Frequency: _do4Frequency,
                noteIndex: 2,
              ),
              QuestionNote(
                relative: Relative.Do4,
                do4Frequency: _do4Frequency,
                isScrollable: false,
                noteIndex: 3,
              ),
            ]),
            const OkNextButton(),
          ],
        ),
      ),
    );
  }
}

class AnswerResultGap extends StatelessWidget {
  const AnswerResultGap({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: Provider.of<AnswerNotifier>(context).didAnswer
          ? Text(
              Provider.of<AnswerNotifier>(context).totalDifference.toString(),
              style:
                  TextStyle(fontSize: 30, color: Theme.of(context).errorColor))
          : const Text('', style: TextStyle(fontSize: 30)),
    );
  }
}

class OkNextButton extends StatelessWidget {
  const OkNextButton({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ButtonTheme(
      minWidth: 120,
      height: 40,
      child: RaisedButton(
        color: Theme.of(context).accentColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        onPressed: () {
          if (Provider.of<AnswerNotifier>(context, listen: false).didAnswer) {
            Provider.of<AnswerNotifier>(context, listen: false).next();
          } else {
            Provider.of<AnswerNotifier>(context, listen: false).answer();
          }
        },
        child: Provider.of<AnswerNotifier>(context).didAnswer
            ? const Text('Next')
            : const Text('OK!'),
      ),
    );
  }
}

class AnswerNotifier extends ChangeNotifier {
  AnswerNotifier({@required List<int> correctCents})
      : _correctCents = correctCents;
  bool _didAnswer = true;
  bool get didAnswer => _didAnswer;
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

  void next() {
    _didAnswer = false;
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
    print(_temp);
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
