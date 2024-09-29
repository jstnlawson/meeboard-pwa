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

import { lightUpLevels, areLightsOn, setUpDelayEffect } from './components/fx/fx.js'; // Adjust path as per your structure


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
  setUpDelayEffect(audioContext);
});
