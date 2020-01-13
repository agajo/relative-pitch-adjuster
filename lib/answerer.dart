import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

import 'js_caller.dart';

class Answerer extends StatelessWidget {
  const Answerer({
    Key key,
    @required int noteIndex,
    @required Relative relative,
    @required double do4Frequency,
    @required bool isScrollable,
  })  : _noteIndex = noteIndex,
        _relative = relative,
        _do4Frequency = do4Frequency,
        _isScrollable = isScrollable,
        super(key: key);

  final int _noteIndex;
  final Relative _relative;
  final double _do4Frequency;
  final bool _isScrollable;

  // ignore: avoid_field_initializers_in_const_classes
  final int _wheelListItemNumber = 3501;

  @override
  Widget build(BuildContext context) {
    var _answerCent =
        Provider.of<QuestionNotifier>(context).answerCents[_noteIndex];
    final _wheelController =
        Provider.of<QuestionNotifier>(context, listen: false)
            .answerWheelControllers[_noteIndex];
    var _frequency = _do4Frequency * pow(2, _answerCent / 1200);
    return Column(
      children: <Widget>[
        NoteContainer(
          relative: _relative,
          do4Frequency: _do4Frequency,
          showsCent: Provider.of<QuestionNotifier>(context).didAnswer &&
              Provider.of<QuestionNotifier>(context).doShowCentInAnswer,
          cent: _answerCent,
        ),
        Padding(
          padding: const EdgeInsets.only(top: 10),
          child: GestureDetector(
            behavior: HitTestBehavior.deferToChild,
            onPanStart: (_) {
              print('detect!!!');
              Provider.of<JsCaller>(context, listen: false).play(_frequency);
            },
            onPanEnd: (_) =>
                Provider.of<JsCaller>(context, listen: false).stop(),
            child: SizedBox(
              height: 100,
              width: 60,
              child: ListWheelScrollView(
                controller: _wheelController,
                itemExtent: 15,
                physics: _isScrollable
                    ? const AlwaysScrollableScrollPhysics()
                    : const NeverScrollableScrollPhysics(),
                children: List.generate(
                  3501,
                  (_) => Center(
                      child: Container(
                          color: _isScrollable
                              ? Note.fromRelative(_relative).solfege.color
                              : Colors.grey,
                          height: 7)),
                ),
                onSelectedItemChanged: (i) {
                  _answerCent = i - (_wheelListItemNumber - 1) ~/ 2;
                  _frequency = _do4Frequency * pow(2, _answerCent / 1200);
                  Provider.of<QuestionNotifier>(context, listen: false)
                      .setAnswerCent(_noteIndex, _answerCent);
                  if (Provider.of<QuestionNotifier>(context, listen: false)
                      .canMakeSound) {
                    Provider.of<JsCaller>(context, listen: false)
                        .playLong(_frequency);
                  }
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}
