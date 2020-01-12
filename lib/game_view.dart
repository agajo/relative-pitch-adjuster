import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/question.dart';

import 'js_caller.dart';

class GameView extends StatelessWidget {
  const GameView({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Provider<JsCaller>(
      create: (context) => JsCaller(),
      child: ChangeNotifierProvider<QuestionGiver>(
        create: (_) => QuestionGiver(),
        child: Consumer<QuestionGiver>(
            builder: (_, questionGiver, ___) => questionGiver.question),
      ),
    );
  }
}

class QuestionGiver extends ChangeNotifier {
  Question _question = Question(key: UniqueKey());
  Question get question => _question;
  void giveNextQuestion() {
    _question = Question(key: UniqueKey());
    notifyListeners();
  }
}
