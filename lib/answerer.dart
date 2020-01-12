import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/question.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

import 'js_caller.dart';

class Answerer extends StatefulWidget {
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

  @override
  _AnswererState createState() => _AnswererState();
}

class _AnswererState extends State<Answerer> {
  final int _wheelListItemNumber = 3501;
  int _answerCent = 0;
  FixedExtentScrollController _wheelController;
  double _frequency;
  @override
  Widget build(BuildContext context) {
    _wheelController = FixedExtentScrollController(
        initialItem: _answerCent + (_wheelListItemNumber - 1) ~/ 2);
    _frequency = widget._do4Frequency * pow(2, _answerCent / 1200);
    return Column(
      children: <Widget>[
        NoteContainer(
          relative: widget._relative,
          do4Frequency: widget._do4Frequency,
          showsCent: Provider.of<AnswerNotifier>(context).didAnswer,
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
                physics: widget._isScrollable
                    ? const AlwaysScrollableScrollPhysics()
                    : const NeverScrollableScrollPhysics(),
                children: List.generate(
                  3501,
                  (_) => Center(
                      child: Container(
                          color: widget._isScrollable
                              ? Note.fromRelative(widget._relative)
                                  .solfege
                                  .color
                              : Colors.grey,
                          height: 7)),
                ),
                onSelectedItemChanged: (i) {
                  setState(() {
                    _answerCent = i - (_wheelListItemNumber - 1) ~/ 2;
                    _frequency =
                        widget._do4Frequency * pow(2, _answerCent / 1200);
                    Provider.of<JsCaller>(context, listen: false)
                        .playLong(_frequency);
                    Provider.of<AnswerNotifier>(context, listen: false)
                        .setAnswerCent(widget._noteIndex, _answerCent);
                  });
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}
