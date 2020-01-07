import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/game_view.dart';

void main() => runApp(MyMaterial(home: MyHome()));

class MyMaterial extends StatelessWidget {
  const MyMaterial({@required this.home});
  final Widget home;
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Relative Pitch Adjuster',
      theme: ThemeData.dark().copyWith(accentColor: Colors.cyan),
      home: home,
    );
  }
}

class MyHome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Relative Pitch Adjuster')),
      body: const GameView(),
    );
  }
}
