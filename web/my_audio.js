var synth = new Tone.Synth().toMaster();

function play(frequency) {
    synth.triggerAttack(frequency);
}

function stop(){
    synth.triggerRelease();
}

function setNote(frequency){
    synth.setNote(frequency);
}

var isResumed = false;

window.onload = function() {
    document.querySelector('body').addEventListener('touchstart', function() {
        if(!isResumed){
            Tone.context.resume();
            isResumed = true;
        }
    });
}

