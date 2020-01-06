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
      theme: ThemeData.dark().copyWith(buttonColor: Colors.cyan),
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
              color: Theme.of(context).buttonColor,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
              child: const Padding(
                padding:
                    EdgeInsets.only(right: 30, left: 30, top: 10, bottom: 10),
                child: Text('OK!'),
              ),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}
