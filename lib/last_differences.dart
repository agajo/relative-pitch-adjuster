import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class LastDifferences extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final _diffs = Relative.values.map((_relative) {
      var _note = Note.fromRelative(_relative);
      return SizedBox(
        width: 70,
        child: Row(mainAxisAlignment: MainAxisAlignment.start, children: [
          Container(
              decoration: BoxDecoration(
                  color: _note.solfege.color,
                  borderRadius: BorderRadius.circular(10)),
              height: 30,
              width: 30,
              child: Center(child: Text(_relative.toString().substring(9)))),
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
        height: 160,
        child: SingleChildScrollView(
          child: Column(
            children: _diffs.toList(),
          ),
        ),
      )
    ]);
  }
}
