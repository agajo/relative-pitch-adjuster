import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/question_note.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

void main() => runApp(MyMaterial(home: MyHome()));

class MyMaterial extends StatelessWidget {
  const MyMaterial({@required this.home});
  final Widget home;
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Relative Pitch Adjuster',
      theme: ThemeData.dark(),
      home: home,
    );
  }
}

class MyHome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Relative Pitch Adjuster')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const <Widget>[
                  QuestionNote(relative: Relative.Do4),
                  QuestionNote(relative: Relative.Re4),
                  QuestionNote(relative: Relative.Si3),
                  QuestionNote(relative: Relative.Do4),
                ]),
            RaisedButton(
              child: const Text('OK!'),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}
