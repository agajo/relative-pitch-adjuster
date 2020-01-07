import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/question.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class QuestionNote extends StatelessWidget {
  const QuestionNote({
    @required Relative relative,
    @required double do4Frequency,
  })  : _relative = relative,
        _do4Frequency = do4Frequency;
  final Relative _relative;
  final double _do4Frequency;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SizedBox(
          height: 25,
          child: Provider.of<AnswerNotifier>(context).didAnswer
              ? Text('+123',
                  style: TextStyle(fontSize: 20, color: Colors.white70))
              : const Text('', style: TextStyle(fontSize: 20)),
        ),
        NoteContainer(
          relative: _relative,
          do4Frequency: _do4Frequency,
          isActive: Provider.of<AnswerNotifier>(context).didAnswer,
        ),
        const SizedBox(height: 10),
        NoteContainer(
          relative: _relative,
          do4Frequency: _do4Frequency,
          showsCent: Provider.of<AnswerNotifier>(context).didAnswer,
          cent: 300,
        ),
        Padding(
          padding: const EdgeInsets.only(top: 10),
          child: SizedBox(
            height: 100,
            width: 60,
            child: ListWheelScrollView(
              itemExtent: 15,
              children: List.generate(
                3501,
                (_) => Center(
                    child: Container(
                        color: Note.fromRelative(_relative).solfege.color,
                        height: 7)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
