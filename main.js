import {
  createNoteTable,
  assignFrequenciesToKeys,
  setup,
  playNote,
  stopNote,
  updateCustomWaveform,
} from "./components/synth/synth.js";

import { 
  initializeRecorder,
  // audioBufferToWavBlob,
  // writeString,
} from "./components/recorder/recorder.js";

const startModal = document.querySelector("[data-modal-start]");
const startButton = document.querySelector("[data-start-app]");
let audioContext;

startModal.showModal();

startButton.addEventListener("click", async () => {
  startModal.close();
  audioContext = new AudioContext();

  createNoteTable();
  assignFrequenciesToKeys();
  setup(audioContext);

  initializeRecorder(audioContext);
});
//pitchfinder basic setup from https://github.com/peterkhayes/pitchfinder

// import * as Pitchfinder from "pitchfinder";

// const myAudioBuffer = getAudioBuffer(); // assume this returns a WebAudio AudioBuffer object
// const float32Array = myAudioBuffer.getChannelData(0); // get a single channel of sound

// const detectPitch = Pitchfinder.AMDF();
// const pitch = detectPitch(float32Array); // null if pitch cannot be identified