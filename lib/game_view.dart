import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_note.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class GameView extends StatelessWidget {
  const GameView({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AnswerNotifier(),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const <Widget>[
                  QuestionNote(relative: Relative.Do4),
                  QuestionNote(relative: Relative.Re4),
                  QuestionNote(relative: Relative.Si3),
                  QuestionNote(relative: Relative.Do4),
                ]),
            const OkNextButton(),
          ],
        ),
      ),
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
      color: Theme.of(context).buttonColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding:
            const EdgeInsets.only(right: 30, left: 30, top: 10, bottom: 10),
        child: Provider.of<AnswerNotifier>(context).didAnswer
            ? const Text('Next')
            : const Text('OK!'),
      ),
      onPressed: () {
        if (Provider.of<AnswerNotifier>(context).didAnswer) {
          Provider.of<AnswerNotifier>(context).next();
        } else {
          Provider.of<AnswerNotifier>(context).answer();
        }
      },
    );
  }
}

class AnswerNotifier extends ChangeNotifier {
  bool _didAnswer = false;
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
