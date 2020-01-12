import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/answerer.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/question.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class QuestionNote extends StatelessWidget {
  const QuestionNote({
    @required Relative relative,
    @required double do4Frequency,
    bool isScrollable,
  })  : _relative = relative,
        _do4Frequency = do4Frequency,
        _isScrollable = isScrollable ?? true;
  final Relative _relative;
  final double _do4Frequency;
  final bool _isScrollable;
  @override
  Widget build(BuildContext context) {
    return Provider<DifferenceReporter>(
      create: (context) =>
          DifferenceReporter(correctCent: Note.fromRelative(_relative).cent),
      child: Column(
        children: <Widget>[
          SizedBox(
            height: 25,
            child: Provider.of<AnswerNotifier>(context).didAnswer
                ? Consumer<DifferenceReporter>(
                    builder: (_, differenceReporter, __) => Text(
                        differenceReporter.differenceString ?? '',
                        style: TextStyle(fontSize: 20, color: Colors.white70)),
                  )
                : const Text('', style: TextStyle(fontSize: 20)),
          ),
          NoteContainer(
            relative: _relative,
            do4Frequency: _do4Frequency,
            isActive: Provider.of<AnswerNotifier>(context).didAnswer,
          ),
          const SizedBox(height: 10),
          Answerer(
              relative: _relative,
              do4Frequency: _do4Frequency,
              isScrollable: _isScrollable),
        ],
      ),
    );
  }
}

class DifferenceReporter {
  DifferenceReporter({@required int correctCent}) : _correctCent = correctCent;
  final int _correctCent;
  int currentAnswerCent = 0;
  String get differenceString {
    final _diff = currentAnswerCent - _correctCent;
    final _prefix = _diff >= 0 ? '+' : '';
    return '$_prefix${_diff.toString()}';
  }
}
