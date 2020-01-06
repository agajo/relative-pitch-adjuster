import 'dart:math';

import 'package:flutter/material.dart';

class Solfege {
  const Solfege._internal({@required String name, @required Color color})
      : _name = name,
        _color = color;
  final String _name;
  String get name => _name;
  final Color _color;
  Color get color => _color;
  // ignore:, constant_identifier_names
  static const Re = Solfege._internal(name: 'Re', color: Colors.orange);
  // ignore:, constant_identifier_names
  static const Mi = Solfege._internal(name: 'Mi', color: Colors.yellow);
  // ignore:, constant_identifier_names
  static const Fa = Solfege._internal(name: 'Fa', color: Colors.green);
  // ignore:, constant_identifier_names
  static const Sol = Solfege._internal(name: 'Sol', color: Colors.blue);
  // ignore:, constant_identifier_names
  static const La = Solfege._internal(name: 'La', color: Colors.indigo);
  // ignore:, constant_identifier_names
  static const Si = Solfege._internal(name: 'Si', color: Colors.purple);
  // ignore:, constant_identifier_names
  static const Do = Solfege._internal(name: 'Do', color: Colors.red);
}

enum Relative {
  // ignore: constant_identifier_names
  Do3,
  // ignore: constant_identifier_names
  Re3,
  // ignore: constant_identifier_names
  Mi3,
  // ignore: constant_identifier_names
  Fa3,
  // ignore: constant_identifier_names
  Sol3,
  // ignore: constant_identifier_names
  La3,
  // ignore: constant_identifier_names
  Si3,
  // ignore: constant_identifier_names
  Do4,
  // ignore: constant_identifier_names
  Re4,
  // ignore: constant_identifier_names
  Mi4,
  // ignore: constant_identifier_names
  Fa4,
  // ignore: constant_identifier_names
  Sol4,
  // ignore: constant_identifier_names
  La4,
  // ignore: constant_identifier_names
  Si4,
  // ignore: constant_identifier_names
  Do5
}

class Note {
  Note._internal(this.solfege, this.cent);
  factory Note.fromRelative(Relative relative) {
    switch (relative) {
      case Relative.Do3:
        return Note._internal(Solfege.Do, -1200);
        break;
      case Relative.Re3:
        return Note._internal(Solfege.Re, -1000);
        break;
      case Relative.Mi3:
        return Note._internal(Solfege.Mi, -800);
        break;
      case Relative.Fa3:
        return Note._internal(Solfege.Fa, -700);
        break;
      case Relative.Sol3:
        return Note._internal(Solfege.Sol, -500);
        break;
      case Relative.La3:
        return Note._internal(Solfege.La, -300);
        break;
      case Relative.Si3:
        return Note._internal(Solfege.Si, -100);
        break;
      case Relative.Do4:
        return Note._internal(Solfege.Do, 0);
        break;
      case Relative.Re4:
        return Note._internal(Solfege.Re, 200);
        break;
      case Relative.Mi4:
        return Note._internal(Solfege.Mi, 400);
        break;
      case Relative.Fa4:
        return Note._internal(Solfege.Fa, 500);
        break;
      case Relative.Sol4:
        return Note._internal(Solfege.Sol, 700);
        break;
      case Relative.La4:
        return Note._internal(Solfege.La, 900);
        break;
      case Relative.Si4:
        return Note._internal(Solfege.Si, 1100);
        break;
      case Relative.Do5:
        return Note._internal(Solfege.Si, 1200);
        break;
      default:
        throw StateError('Unexpected Relative');
    }
  }
  final Solfege solfege;
  final int cent;
  double frequency(double do4Frequency) => do4Frequency * pow(2, cent / 1200);
}
