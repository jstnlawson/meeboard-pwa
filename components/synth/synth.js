let audioContext;
const oscList = [];
let mainGainNode = null;

const keyboard = document.querySelector(".meeboard_keys");
const wavePicker = document.querySelector("select[name='waveform']");
const volumeControl = document.querySelector("input[name='volume']");

let noteFreq = [];
export let customWaveform;
let sineTerms = null;
let cosineTerms = null;

var select = document.getElementById('waveformSelect');
var selectPrev = document.getElementById('selectPrev');
var selectNext = document.getElementById('selectNext');

  // Event listener for previous button
  selectPrev.addEventListener('click', function() {
    select.selectedIndex = Math.max(select.selectedIndex - 1, 0);
  });

  // Event listener for next button
  selectNext.addEventListener('click', function() {
    select.selectedIndex = Math.min(select.selectedIndex + 1, select.options.length - 1);
  });

//select.size = select.options.length;
select.size = select.options.length - 2;

const keyMapping = {
    'a': { note: 'C', octave: 3 },
    'w': { note: 'C#', octave: 3 },
    's': { note: 'D', octave: 3 },
    'e': { note: 'D#', octave: 3 },
    'd': { note: 'E', octave: 3 },
    'f': { note: 'F', octave: 3 },
    't': { note: 'F#', octave: 3 },
    'g': { note: 'G', octave: 3 },
    'y': { note: 'G#', octave: 3 },
    'h': { note: 'A', octave: 3 },
    'u': { note: 'A#', octave: 3 },
    'j': { note: 'B', octave: 3 },
    'k': { note: 'C', octave: 4 }
};

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
    ];



    for (let octave = 1; octave <= 8; octave++) {
        notes.forEach((note) => {
            noteFreq[octave][note.note] = note.freq * Math.pow(2, octave - 1);
        });
    }

}

export function assignFrequenciesToKeys() {
    const keys = keyboard.querySelectorAll("button");

    //keys.forEach((key, index) => {
    keys.forEach((key) => {
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
            for (const [keyboardKey, mappedNote] of Object.entries(keyMapping)) {
                if (mappedNote.note === note && mappedNote.octave === octave) {
                    key.dataset.key = keyboardKey;
                }
            }
        }
    });
}

export function updateCustomWaveform(newWaveform) {
    customWaveform = newWaveform;
    console.log("Custom waveform updated", customWaveform);
  }

  export function playNote(freq) {
    const osc = audioContext.createOscillator();
    osc.connect(mainGainNode);
  
    const type = wavePicker.options[wavePicker.selectedIndex].value;
    if (type === "sample" && customWaveform) {
      // Use a BufferSourceNode for the sample
      const source = audioContext.createBufferSource();
      source.buffer = customWaveform; // Assuming customWaveform is an AudioBuffer
      source.connect(mainGainNode);
      source.start();
    } else {
      // For built-in waveforms
      if (type === "custom") {
        osc.setPeriodicWave(customWaveform);
      } else {
        osc.type = type;
      }
      osc.frequency.value = freq;
      osc.start();
    }
  
    return osc;
  }

// export function playNote(freq) {
//     const osc = audioContext.createOscillator();
//     osc.connect(mainGainNode);

//     const type = wavePicker.options[wavePicker.selectedIndex].value;
//     if (type === "custom") {
//         osc.setPeriodicWave(customWaveform);
//         console.log("Custom waveform set to:", customWaveform);
//         console.log("Custom waveform is playing");
//     } else {
//         osc.type = type;
//         console.log("Waveform set to:", osc.type);
//     }

//     osc.frequency.value = freq;
//     osc.start();

//     return osc;
// }

export function stopNote(osc) {
    osc.stop();
}

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const keyData = keyMapping[key];

    if (keyData) {
        const note = keyData.note;
        const octave = keyData.octave;
        const frequency = noteFreq[octave][note];

        if (!oscList[frequency]) { // Prevent duplicate notes
            const osc = playNote(frequency);
            oscList[frequency] = osc;
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    const keyData = keyMapping[key];

    if (keyData) {
        const note = keyData.note;
        const octave = keyData.octave;
        const frequency = noteFreq[octave][note];

        if (oscList[frequency]) {
            stopNote(oscList[frequency]);
            delete oscList[frequency];
        }
    }
});

// export function setup () {
export const setup = (context) => {
    audioContext = context;
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

