var synth = new Tone.Synth().toMaster();
var isPlaying = false;

function play(frequency) {
    synth.triggerAttack(frequency);
}

function stop(){
    synth.triggerRelease();
}

function setNote(frequency){
    synth.setNote(frequency);
}
