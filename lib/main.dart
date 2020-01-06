import 'package:flutter/material.dart';

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
      appBar: AppBar(title: Text('Relative Pitch Adjuster')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              QuestionNote(name: 'Do', cent: 0),
              QuestionNote(name: 'Re', cent: 200),
              QuestionNote(name: 'Ti', cent: -100),
              QuestionNote(name: 'Do', cent: 0),
            ]),
            SizedBox(
              height: 100,
              child: ListWheelScrollView(
                itemExtent: 10,
                children: List.generate(
                  3501,
                  (i) => Text('-'),
                ),
              ),
            ),
            RaisedButton(
              child: Text('OK!'),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class QuestionNote extends StatelessWidget {
  QuestionNote({@required this.name, @required this.cent});
  final String name;
  final int cent;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(children: [
        Text(
          name,
          style: Theme.of(context).textTheme.display1,
        ),
        Text((cent >= 0 ? '+' : '') + cent.toString()),
      ]),
    );
  }
}
