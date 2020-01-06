import 'package:flutter/material.dart';
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
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              QuestionNote(relative: Relative.Do4),
              QuestionNote(relative: Relative.Re4),
              QuestionNote(relative: Relative.Si3),
              QuestionNote(relative: Relative.Do4),
            ]),
            SizedBox(
              height: 100,
              child: ListWheelScrollView(
                itemExtent: 10,
                children: List.generate(
                  3501,
                  (i) => const Text('-'),
                ),
              ),
            ),
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

class QuestionNote extends StatelessWidget {
  QuestionNote({@required Relative relative})
      : note = Note.fromRelative(relative);
  final Note note;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      decoration: BoxDecoration(
          color: note.solfege.color, borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(children: [
          Text(
            note.solfege.name,
            style: Theme.of(context).textTheme.display1,
          ),
          Text((note.cent >= 0 ? '+' : '') + note.cent.toString()),
        ]),
      ),
    );
  }
}
