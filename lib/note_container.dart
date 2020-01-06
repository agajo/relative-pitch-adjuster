import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class NoteContainer extends StatelessWidget {
  NoteContainer(
      {@required Relative relative, int cent, bool isActive, bool showsCent})
      : note = Note.fromRelative(relative),
        _cent = cent ?? Note.fromRelative(relative).cent,
        _isActive = isActive ?? true,
        _showsCent = showsCent ?? true;
  final Note note;
  final int _cent;
  final bool _isActive;
  final bool _showsCent;
  @override
  Widget build(BuildContext context) {
    return Container(
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
    );
  }
}
