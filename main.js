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

// if ('serviceWorker' in navigator) {
//   console.log('Service Worker is supported');
//   window.addEventListener('load', () => {
//     console.log('Window loaded');
//     navigator.serviceWorker.register('/sw.js')  // <-- This points to the root
//       .then(registration => {
//         console.log('Service Worker registered with scope:', registration.scope);
//       }).catch(err => {
//         console.log('Service Worker registration failed:', err);
//       });
//   });
// } else {
//   console.log('Service Worker is not supported');
// }

// let deferredPrompt;
// const installButton = document.getElementById('installButton');
// let isPromptSet = false;

// window.addEventListener('beforeinstallprompt', (event) => {
//   console.log('beforeinstallprompt event fired');
//   event.preventDefault();
//   deferredPrompt = event;
//   installButton.style.display = 'block';

//   // Set the prompt flag only once
//   if (!isPromptSet) {
//     installButton.addEventListener('click', () => {
//       console.log('Install button clicked');
//       deferredPrompt.prompt();
//       deferredPrompt.userChoice.then((choiceResult) => {
//         if (choiceResult.outcome === 'accepted') {
//           console.log('User accepted the install prompt');
//           installButton.style.display = 'none';
//         } else {
//           console.log('User dismissed the install prompt');
//         }
//         deferredPrompt = null;
//       });
//     });
//     isPromptSet = true; // Prevents adding multiple listeners
//   }
// });

// window.addEventListener('appinstalled', (event) => {
//   console.log('PWA was installed');
// });


