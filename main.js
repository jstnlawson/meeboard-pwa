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
  micStream,
} from "./components/recorder/recorder.js";

import { setUpEffects } from './components/fx/fx.js'; 

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
  setUpEffects(audioContext);
});

document.addEventListener('touchmove', event => event.scale !== 1 && event.preventDefault(), { passive: false });
document.addEventListener('contextmenu', function (event) {
  event.preventDefault(); // Disable the context menu
}, false);

document.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
      event.preventDefault(); // Prevent zoom on multi-touch
  }
}, { passive: false });

document.addEventListener('gesturestart', function (event) {
  event.preventDefault(); // Prevent pinch-to-zoom
});

const keys = document.querySelectorAll('.meeboard_keys button');
keys.forEach(key => {
  key.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent long press triggering
  });
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    resetApp(); // Reset the app when the user navigates away
  }
});

function resetApp() {
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop()); // Stop mic stream
  }
  if (audioContext) {
    audioContext.close(); // Close the audio context
  }
  
  // Show the start modal again
  startModal.showModal();
  
  // Optionally reset any other state (UI, effects, etc.)
}
