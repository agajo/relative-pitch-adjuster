var synth = new Tone.Synth().toMaster();

function play(frequency) {
    synth.triggerAttack(frequency);
}

function stop(){
    synth.triggerRelease();
}