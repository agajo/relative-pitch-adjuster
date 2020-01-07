import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

import 'js_caller.dart';

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
    return GestureDetector(
      onTapDown: (_) =>
          // TODO(madao): set do4frequency
          Provider.of<JsCaller>(context, listen: false)
              .play(note.frequency(440)),
      onTapUp: (_) => Provider.of<JsCaller>(context, listen: false).stop(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
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
