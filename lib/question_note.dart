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
          child: SizedBox(
            height: 100,
            width: 50,
            child: ListWheelScrollView(
              itemExtent: 10,
              diameterRatio: 1.2,
              children: List.generate(
                3501,
                (i) => i % 10 == 0
                    ? Container(
                        color: Colors.black87,
                        child: Center(
                            child: Container(color: Colors.white, height: 2)),
                      )
                    : Container(color: Colors.black87),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
