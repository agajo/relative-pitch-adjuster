import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_note.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class Question extends StatelessWidget {
  const Question({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _relatives = Provider.of<QuestionNotifier>(context)
        .relativeIndexes
        .map((n) => Relative.values[n])
        .toList();
    final _do4Frequency = Provider.of<QuestionNotifier>(context).do4Frequency;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // TODO(madao): いらなそうだったら、定義部分ごと消せ
          // const AnswerResultGap(),
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
          ButtonTheme(
            minWidth: 120,
            height: 40,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const <Widget>[
                HideCentButton(),
                SizedBox(width: 20),
                OkNextButton(),
              ],
            ),
          ),
        ],
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
      child: Provider.of<QuestionNotifier>(context).didAnswer
          ? Text(
              Provider.of<QuestionNotifier>(context).totalDifference.toString(),
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
    return RaisedButton(
      color: Theme.of(context).accentColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      onPressed: () {
        if (Provider.of<QuestionNotifier>(context, listen: false).didAnswer) {
          Provider.of<QuestionNotifier>(context, listen: false).goToNext();
        } else {
          Provider.of<QuestionNotifier>(context, listen: false).answer();
        }
      },
      child: Provider.of<QuestionNotifier>(context).didAnswer
          ? Provider.of<QuestionNotifier>(context).isCleared
              ? const Text('Next')
              : const Text('Retry')
          : const Text('OK!'),
    );
  }
}

class HideCentButton extends StatelessWidget {
  const HideCentButton();
  @override
  Widget build(BuildContext context) {
    return RaisedButton(
      color: Theme.of(context).splashColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: const Text('Hide Cent'),
      onPressed: Provider.of<QuestionNotifier>(context).didAnswer
          ? Provider.of<QuestionNotifier>(context, listen: false)
              .toggleShowCentsInAnswer
          : null,
    );
  }
}
