import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_note.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class GameView extends StatelessWidget {
  const GameView({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AnswerNotifier>(
      create: (context) => AnswerNotifier(),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AnswerResultGap(),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const <Widget>[
                  QuestionNote(relative: Relative.Fa4),
                  QuestionNote(relative: Relative.Sol4),
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
              style: GoogleFonts.balooTamma(
                  textStyle: TextStyle(
                      fontSize: 30, color: Theme.of(context).errorColor)))
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
      child: Padding(
        padding:
            const EdgeInsets.only(right: 30, left: 30, top: 10, bottom: 10),
        child: Provider.of<AnswerNotifier>(context).didAnswer
            ? const Text('Next')
            : const Text('OK!'),
      ),
      onPressed: () {
        if (Provider.of<AnswerNotifier>(context, listen: false).didAnswer) {
          Provider.of<AnswerNotifier>(context, listen: false).next();
        } else {
          Provider.of<AnswerNotifier>(context, listen: false).answer();
        }
      },
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
