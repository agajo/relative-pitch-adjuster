import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question.dart';
import 'package:relative_pitch_adjuster/question_notifier.dart';

import 'js_caller.dart';

class GameView extends StatelessWidget {
  const GameView({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Provider<JsCaller>(
      create: (context) => JsCaller(),
      child: ChangeNotifierProvider<QuestionNotifier>(
        create: (_) => QuestionNotifier(),
        child: Question(),
      ),
    );
  }
}
