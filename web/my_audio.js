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

function playLong(frequency){
    if(isPlaying){
        synth.setNote(frequency);
    }else{
        synth.triggerAttackRelease(frequency,5);
        isPlaying = true;
        setTimeout(()=>{
            isPlaying = false;
        },5000);
    }
}