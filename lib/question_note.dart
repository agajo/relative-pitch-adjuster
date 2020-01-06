import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class QuestionNote extends StatelessWidget {
  const QuestionNote({@required Relative relative}) : _relative = relative;
  final Relative _relative;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        NoteContainer(relative: _relative),
        Padding(
          padding: const EdgeInsets.only(top: 10),
          child: ShaderMask(
            blendMode: BlendMode.dstIn,
            shaderCallback: (bounds) {
              return LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[
                  Colors.transparent,
                  Colors.white,
                  Colors.white,
                  Colors.transparent,
                ],
              ).createShader(
                bounds.shift(-bounds.topLeft),
              );
            },
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
        ),
      ],
    );
  }
}
