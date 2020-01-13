import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/note_container.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class LastDifferences extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final _diffs = Relative.values.map((_relative) {
      return SizedBox(
        width: 150,
        child: Row(mainAxisAlignment: MainAxisAlignment.start, children: [
          ClipRect(
            child: Align(
              heightFactor: 0.7,
              child: Transform.scale(
                  scale: 0.7, child: NoteContainer(relative: _relative)),
            ),
          ),
          const SizedBox(width: 5),
          Text(Provider.of<QuestionNotifier>(context)
                  .lastDifferences[_relative.toString()] ??
              ''),
        ]),
      );
    });
    return Column(children: [
      const Text('Your Last Gap'),
      SizedBox(
        height: 210,
        child: SingleChildScrollView(
          controller: ScrollController(initialScrollOffset: 270),
          child: Column(
            children: _diffs.toList().reversed.toList(),
          ),
        ),
      )
    ]);
  }
}
