import { setupVolumeControls } from "../fx/fx.js";

let audioContext;
const oscList = [];
let mainGainNode;
let sampleNotes = [];
let sampleNote = {};
let loopEnabled = false; // Track if loop is enabled
let reverseEnabled = false;

const keyboard = document.querySelector(".meeboard_keys");
const wavePicker = document.querySelector("select[name='waveform']");
const volumeControl = document.querySelector("input[name='volume']");
const whiteKeys = document.querySelectorAll(".white-key");
const blackKeys = document.querySelectorAll(".black-key");
const loopButton = document.getElementById("loopButton");
const reverseButton = document.getElementById("reverseButton");

let noteFreq = [];
export let customWaveform;
let sineTerms = null;
let cosineTerms = null;

const select = document.getElementById("waveformSelect");
const selectPrev = document.getElementById("selectPrev");
const selectNext = document.getElementById("selectNext");

// Event listener for previous button
selectPrev.addEventListener("click", function () {
  select.selectedIndex = Math.max(select.selectedIndex - 1, 0);
});

// Event listener for next button
selectNext.addEventListener("click", function () {
  select.selectedIndex = Math.min(
    select.selectedIndex + 1,
    select.options.length - 1
  );
});

// Toggle loop functionality
loopButton.addEventListener("click", () => {
  loopEnabled = !loopEnabled; // Toggle the loop state
  console.log("Looping:", loopEnabled);
  // You could also change the button text or style here to indicate the state
  // loopButton.textContent = loopEnabled ? "Loop On" : "Loop Off";
});

// Toggle reverse functionality
reverseButton.addEventListener("click", () => {
  reverseEnabled = !reverseEnabled; // Toggle the reverse state
  console.log("Reverse:", reverseEnabled);
  // reverseButton.textContent = reverseEnabled ? "Reverse On" : "Reverse Off";
  reverseCustomWaveform = createReverseCustomWaveform(customWaveform);

});

//select.size = select.options.length;
select.size = select.options.length - 2;

const keyMapping = {
  a: { note: "C", octave: 3 },
  w: { note: "C#", octave: 3 },
  s: { note: "D", octave: 3 },
  e: { note: "D#", octave: 3 },
  d: { note: "E", octave: 3 },
  f: { note: "F", octave: 3 },
  t: { note: "F#", octave: 3 },
  g: { note: "G", octave: 3 },
  y: { note: "G#", octave: 3 },
  h: { note: "A", octave: 3 },
  u: { note: "A#", octave: 3 },
  j: { note: "B", octave: 3 },
  k: { note: "highC", octave: 4 },
};

export function createNoteTable() {
  // const noteFreq = [];
  for (let i = 0; i < 9; i++) {
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
    { note: "A", freq: 55.0 },
    { note: "A#", freq: 58.270470189761239 },
    { note: "B", freq: 61.735412657015513 },
    { note: "highC", freq: 32.703195662574829 },
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

export function assignSpeedsToKeys() {
  const keys = keyboard.querySelectorAll("button");

  keys.forEach((key) => {
    let speed;
    let sampleNote;

    switch (key.className) {
      case "white-key low-c":
        sampleNote = "C";
        speed = 1.0;
        break;
      case "black-key c-sharp":
        sampleNote = "C#";
        speed = 1.0594630943592953;
        break;
      case "white-key d":
        sampleNote = "D";
        speed = 1.122462048309373;
        break;
      case "black-key d-sharp":
        sampleNote = "D#";
        speed = 1.1892071150027212;
        break;
      case "white-key e":
        sampleNote = "E";
        speed = 1.2599210498948734;
        break;
      case "white-key f":
        sampleNote = "F";
        speed = 1.3348398541700346;
        break;
      case "black-key f-sharp":
        sampleNote = "F#";
        speed = 1.4142135623730954;
        break;
      case "white-key g":
        sampleNote = "G";
        speed = 1.498307076876682;
        break;
      case "black-key g-sharp":
        sampleNote = "G#";
        speed = 1.5874010519682;
        break;
      case "white-key a":
        sampleNote = "A";
        speed = 1.6817928305074297;
        break;
      case "black-key a-sharp":
        sampleNote = "A#";
        speed = 1.7817974362806794;
        break;
      case "white-key b":
        sampleNote = "B";
        speed = 1.887748625363388;
        break;
      case "white-key high-c":
        sampleNote = "highC";
        speed = 2.0;
        break;
    }

    // Set the speed and note in the dataset for later retrieval
    key.dataset.speed = speed;
    key.dataset.note = sampleNote;
  });
}

export function updateCustomWaveform(newWaveform) {
  console.log("newWaveform", newWaveform);
  customWaveform = newWaveform;
  console.log("Custom waveform updated", customWaveform);
}

let reverseCustomWaveform;

export function createReverseCustomWaveform(buffer) {
  if (!buffer) {
    console.error("Buffer is not defined");
    return;
  }
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const reverseCustomWaveform = audioContext.createBuffer(channels, length, sampleRate);

  for (let channel = 0; channel < channels; channel++) {
    const channelData = buffer.getChannelData(channel);
    const reverseData = reverseCustomWaveform.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      reverseData[i] = channelData[length - i - 1];
    }
  }
  return reverseCustomWaveform;

}

// reverseCustomWaveform = createReverseCustomWaveform(customWaveform);
// assignSpeedsToKeys();

export function playNote(freq, speed) {
  const selectedBuffer = reverseEnabled ? reverseCustomWaveform : customWaveform;
  const type = wavePicker.options[wavePicker.selectedIndex].value;

  if (type === "sample" && selectedBuffer) {

    // Use a BufferSourceNode for the sample
    const source = audioContext.createBufferSource();
    source.buffer = selectedBuffer; // Assuming customWaveform is an AudioBuffer
    // Use the passed 'speed' to set the playback rate
    source.playbackRate.value = speed;
    console.log(
      `playbackRate set to: ${source.playbackRate.value} for frequency ${freq}`
    );

    // Apply the loop state
    if (loopEnabled) {
      source.loop = true;
      console.log("Looping is enabled");
    }

    source.connect(mainGainNode);
    source.start();
    return source;
  } else if (type !== "sample") {
    const osc = audioContext.createOscillator();
    osc.connect(mainGainNode);
    osc.type = type;
    console.log("Waveform set to:", osc.type);
    osc.frequency.value = freq;
    osc.start();
    return osc;
  }
}

export function stopNote(osc, source) {
  if (osc) {
    osc.stop();
  } else if (source) {
    source.stop();
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const keyData = keyMapping[key];

  if (keyData) {
    const note = keyData.note;
    const octave = keyData.octave;
    const frequency = noteFreq[octave][note];

    // Get the key element corresponding to the pressed key
    const keyElement = keyboard.querySelector(`button[data-note='${note}']`);

    if (keyElement && !oscList[frequency]) {
      // Add the appropriate active class based on the key's class
      if (keyElement.classList.contains("white-key")) {
        keyElement.classList.add("white-key__active");
      } else if (keyElement.classList.contains("black-key")) {
        keyElement.classList.add("black-key__active");
      }

      // Retrieve the speed from the key's dataset
      const speed = parseFloat(keyElement.dataset.speed);

      // Log for debugging
      console.log(
        `Playing note ${note} at frequency ${frequency} with speed ${speed}`
      );

      const osc = playNote(frequency, speed);
      oscList[frequency] = osc;
    }
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  const keyData = keyMapping[key];

  if (keyData) {
    const note = keyData.note;
    const octave = keyData.octave;
    const frequency = noteFreq[octave][note];

    // Get the key element corresponding to the released key
    const keyElement = keyboard.querySelector(`button[data-note='${note}']`);

    if (keyElement) {
      // Remove the appropriate active class based on the key's class
      if (keyElement.classList.contains("white-key")) {
        keyElement.classList.remove("white-key__active");
      } else if (keyElement.classList.contains("black-key")) {
        keyElement.classList.remove("black-key__active");
      }
    }

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

  sineTerms = new Float32Array([0, 0, 1, 0, 1]);
  cosineTerms = new Float32Array(sineTerms.length);

  setupVolumeControls(mainGainNode);
  assignSpeedsToKeys();

  // Update the handleEvent function
  function handleEvent(event) {
    const key = event.target;
    if (key.tagName !== "BUTTON") return;

    const freq = key.dataset.frequency;
    const speed = parseFloat(key.dataset.speed); // Get the speed from the dataset and parse it to a float
    if (!freq || !isFinite(speed)) return; // Check if freq is defined and speed is finite

    const osc = playNote(freq, speed); // Pass speed to playNote
    oscList[key.dataset.frequency] = osc;

    key.addEventListener("mouseup", () => stopEvent(key, osc), { once: true });
    key.addEventListener("mouseleave", () => stopEvent(key, osc), {
      once: true,
    });
    key.addEventListener("touchend", () => stopEvent(key, osc), { once: true });
    key.addEventListener("touchcancel", () => stopEvent(key, osc), {
      once: true,
    });
  }

  function stopEvent(key, osc) {
    stopNote(osc);
    delete oscList[key.dataset.frequency];
  }

  keyboard.addEventListener("mousedown", handleEvent);
  keyboard.addEventListener("touchstart", handleEvent);
};

export { mainGainNode };
