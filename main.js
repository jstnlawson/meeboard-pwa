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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')  // <-- This points to the root
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

let deferredPrompt;
const installButton = document.getElementById('installButton');


window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default mini-infobar from appearing on mobile
  event.preventDefault();
  
  // Save the event so it can be triggered later
  deferredPrompt = event;

  // Optionally, show your own UI to notify the user that PWA can be installed
  //installButton.style.display = 'block'; // Show the button
  
  installButton.addEventListener('click', () => {
    // Trigger the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});

window.addEventListener('appinstalled', (event) => {
  console.log('PWA was installed');
});


