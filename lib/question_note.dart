import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/answer_notifier.dart';
import 'package:relative_pitch_adjuster/answerer.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class QuestionNote extends StatelessWidget {
  const QuestionNote({
    @required int noteIndex,
    @required Relative relative,
    @required double do4Frequency,
    bool isScrollable,
  })  : _noteIndex = noteIndex,
        _relative = relative,
        _do4Frequency = do4Frequency,
        _isScrollable = isScrollable ?? true;
  final int _noteIndex;
  final Relative _relative;
  final double _do4Frequency;
  final bool _isScrollable;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SizedBox(
          height: 25,
          child: Provider.of<AnswerNotifier>(context).didAnswer
              ? Text(
                  Provider.of<AnswerNotifier>(context)
                          .oneDifferenceText(_noteIndex) ??
                      '',
                  style: TextStyle(fontSize: 20, color: Colors.white70))
              : const Text('', style: TextStyle(fontSize: 20)),
        ),
        NoteContainer(
          relative: _relative,
          do4Frequency: _do4Frequency,
          isActive: Provider.of<AnswerNotifier>(context).didAnswer,
        ),
        const SizedBox(height: 10),
        Answerer(
            noteIndex: _noteIndex,
            relative: _relative,
            do4Frequency: _do4Frequency,
            isScrollable: _isScrollable),
      ],
    );
  }
}
