const audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;

const keyboard = document.querySelector(".meeboard_keys");
const wavePicker = document.querySelector("select[name='waveform']");
const volumeControl = document.querySelector("input[name='volume']");

let noteFreq = [];
let customWaveform = null;
let sineTerms = null;
let cosineTerms = null;

export function createNoteTable() {
    // const noteFreq = [];
    for (let i=0; i< 9; i++) {
      noteFreq[i] = [];
    }

    const notes = [
        { note: "C", freq: 32.703195662574829 },
        { note: "C#", freq: 34.647828872109012 },
        { note: "D", freq: 36.708095989675945 },
        { note: "D#", freq: 38.890872965260113 },
        { note: "E", freq: 41.203444614108741 },
        { note: "F", freq: 43.653528929125485 },
        { note: "F#", freq: 46.249302838954299 },
        { note: "G", freq: 48.999429497718661 },
        { note: "G#", freq: 51.913087197493142 },
        { note: "A", freq: 55.000000000000000 },
        { note: "A#", freq: 58.270470189761239 },
        { note: "B", freq: 61.735412657015513 },
        // { note: "C", freq: 65.406391325149658},
    ];

    for (let octave = 1; octave <= 8; octave++) {
        notes.forEach((note) => {
            noteFreq[octave][note.note] = note.freq * Math.pow(2, octave - 1);
        });
    }

}

export function assignFrequenciesToKeys() {
    const keys = keyboard.querySelectorAll("button");

    keys.forEach((key, index) => {
        let octave = 4;
        let note = null;

        switch (key.className) {
            case "white-key low-c":
                octave = 3;
                note = "C";
                break;
            case "black-key c-sharp":
                octave = 3;
                note = "C#";
                break;
            case "white-key d":
                octave = 3;
                note = "D";
                break;
            case "black-key d-sharp":
                octave = 3;
                note = "D#";
                break;
            case "white-key e":
                octave = 3;
                note = "E";
                break;
            case "white-key f":
                octave = 3;
                note = "F";
                break;
            case "black-key f-sharp":
                octave = 3;
                note = "F#";
                break;
            case "white-key g":
                octave = 3;
                note = "G";
                break;
            case "black-key g-sharp":
                octave = 3;
                note = "G#";
                break;
            case "white-key a":
                octave = 3;
                note = "A";
                break;
            case "black-key a-sharp":
                octave = 3;
                note = "A#";
                break;
            case "white-key b":
                octave = 3;
                note = "B";
                break;
            case "white-key high-c":
                octave = 4;
                note = "C";
                break;
        }

        if (note && octave) {
            key.dataset.frequency = noteFreq[octave][note];
        }
    });
}

export function playNote(freq) {
    const osc = audioContext.createOscillator();
    osc.connect(mainGainNode);

    const type = wavePicker.options[wavePicker.selectedIndex].value;
    if (type === "custom") {
        osc.setPeriodicWave(customWaveform);
    } else {
        osc.type = type;
    }

    osc.frequency.value = freq;
    osc.start();

    return osc;
}

export function stopNote(osc) {
    osc.stop();
}

export function setup() {
    mainGainNode = audioContext.createGain();
    mainGainNode.connect(audioContext.destination);
    mainGainNode.gain.value = volumeControl.value;

    sineTerms = new Float32Array([0, 0, 1, 0, 1]);
    cosineTerms = new Float32Array(sineTerms.length);
    customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);

    // volumeControl.addEventListener("input", function() {
    //     mainGainNode.gain.value = volumeControl.value;
    // });

    volumeControl.addEventListener("input", function() {
        const volume = parseFloat(volumeControl.value);
        console.log("Volume control value:", volume);
        mainGainNode.gain.value = volume;
        console.log("Main gain value set to:", mainGainNode.gain.value);
    });

    function handleEvent(event) {
        const key = event.target;
        if (key.tagName !== "BUTTON") return;

        const freq = key.dataset.frequency;
        if (!freq) return;

        const osc = playNote(freq);
        oscList[key.dataset.frequency] = osc;

        key.addEventListener("mouseup", () => stopEvent(key, osc), { once: true });
        key.addEventListener("mouseleave", () => stopEvent(key, osc), { once: true });
        key.addEventListener("touchend", () => stopEvent(key, osc), { once: true });
        key.addEventListener("touchcancel", () => stopEvent(key, osc), { once: true });
    }

    function stopEvent(key, osc) {
        stopNote(osc);
        delete oscList[key.dataset.frequency];
    }

    keyboard.addEventListener("mousedown", handleEvent);
    keyboard.addEventListener("touchstart", handleEvent);
    // keyboard.addEventListener("mouseup", handleEvent);
    // keyboard.addEventListener("touchend", handleEvent);
    // keyboard.addEventListener("mouseleave", handleEvent);
    // keyboard.addEventListener("touchcancel", handleEvent);
}

// export function volumeControlChange() {
//     volumeControl.addEventListener("input", function() {
//         mainGainNode.gain.value = volumeControl.value;
//     });
// }

