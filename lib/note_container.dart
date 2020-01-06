import 'package:flutter/material.dart';
import 'package:relative_pitch_adjuster/solfege_constants.dart';

class NoteContainer extends StatelessWidget {
  NoteContainer({@required Relative relative})
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
