import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';

class DifficultySelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 30,
      width: 100,
      child: ListWheelScrollView(
        physics: const FixedExtentScrollPhysics(),
        itemExtent: 20,
        children: const <Widget>[
          Text('easy'),
          Text('normal'),
          Text('hard'),
          Text('very hard'),
        ],
        onSelectedItemChanged: (n) {
          Provider.of<QuestionNotifier>(context, listen: false)
              .setDifficulty(n);
        },
      ),
    );
  }
}
