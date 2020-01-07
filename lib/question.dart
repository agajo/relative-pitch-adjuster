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
  // TODO(madao): 音が急にぶっとばないように条件つけて調整。
  final List<int> _relativeIndexes =
      List.generate(3, (_) => Random().nextInt(Relative.values.length - 1))
          .toList();
  @override
  Widget build(BuildContext context) {
    final _relatives = _relativeIndexes.map((n) => Relative.values[n]).toList();
    return ChangeNotifierProvider<AnswerNotifier>(
      create: (context) => AnswerNotifier(),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AnswerResultGap(),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: <Widget>[
              QuestionNote(
                  relative: _relatives[0], do4Frequency: _do4Frequency),
              QuestionNote(
                  relative: _relatives[1], do4Frequency: _do4Frequency),
              QuestionNote(
                  relative: _relatives[2], do4Frequency: _do4Frequency),
              QuestionNote(relative: Relative.Do4, do4Frequency: _do4Frequency),
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
          ? Text('492',
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
  bool _didAnswer = true;
  bool get didAnswer => _didAnswer;

  void answer() {
    _didAnswer = true;
    notifyListeners();
  }

  void next() {
    _didAnswer = false;
    notifyListeners();
  }
}
