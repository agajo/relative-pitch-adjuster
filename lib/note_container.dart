import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

import 'js_caller.dart';

class NoteContainer extends StatelessWidget {
  NoteContainer({
    @required Relative relative,
    double do4Frequency,
    int cent,
    bool isActive,
    bool showsCent,
    bool doPlaySound,
  })  : note = Note.fromRelative(relative),
        _do4Frequency = do4Frequency,
        _cent = cent ?? Note.fromRelative(relative).cent,
        _isActive = isActive ?? true,
        _showsCent = showsCent ?? true,
        _doPlaySound = doPlaySound ?? true;
  final Note note;
  final double _do4Frequency;
  final int _cent;
  final bool _isActive;
  final bool _showsCent;
  final bool _doPlaySound;
  @override
  Widget build(BuildContext context) {
    // TODO(madao): I want to just detect "touch". but I can't. still problem.
    return GestureDetector(
      onPanStart: (_) {
        if (_isActive && _doPlaySound) {
          Provider.of<JsCaller>(context, listen: false).play(_cent == null
              ? note.frequency(do4Frequency: _do4Frequency)
              : _do4Frequency * pow(2, _cent / 1200));
        }
      },
      onPanEnd: (_) => Provider.of<JsCaller>(context, listen: false).stop(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 80,
        decoration: BoxDecoration(
          color: _isActive ? note.solfege.color : Colors.grey,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(children: [
            Text(
              note.solfege.name,
              style: Theme.of(context).textTheme.display1,
            ),
            _showsCent
                ? Text((_cent >= 0 ? '+' : '') + _cent.toString())
                : const Text(''),
          ]),
        ),
      ),
    );
  }
}
