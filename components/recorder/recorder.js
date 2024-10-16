import { updateCustomWaveform } from "../synth/synth.js";
import { setOctaveToZero } from "../fx/octave/octave.js";

const openButton = document.querySelector("[data-open-modal]");
const closeButton = document.querySelector("[data-close-modal]");
const useSampleButton = document.getElementById("useSampleButton");
const modal = document.querySelector("[data-modal]");
const recordModal = document.getElementById("recordModal");
const closeModalButton = document.getElementById("closeModalButton");
const soundSelectSample = document.getElementById("soundSelectSample");
const loopButton = document.getElementById("loopButton");
const reverseButton = document.getElementById("reverseButton");

openButton.addEventListener("click", () => {
  modal.showModal();
  recordModal.style.display = "flex";
});

closeButton.addEventListener("click", () => {
  modal.close();
  recordModal.style.display = "none";
});

useSampleButton.addEventListener("click", () => {
  modal.close();
  recordModal.style.display = "none";
  loopButton.style.display = "flex";
  reverseButton.style.display = "flex";
  setOctaveToZero();
});

reverseButton.addEventListener("click", () => {
  const waveformImage = document.getElementById("waveformImage");
  waveformImage.classList.toggle("flip-image"); 
});

const startRecordButton = document.getElementById("startRecord");
const stopRecordButton = document.getElementById("stopRecord");
const audioPlayback = document.getElementById("audioPlayback");
const recordLight = document.getElementById("recordLight");
const recordText = document.getElementById("recordText");

let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let dataArray;
let loopEnabled;
let reverseEnabled;
export let micStream;
let trimmedAudioBuffer;

// Request microphone access
export const initializeRecorder = async (context) => {
  audioContext = context;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    micStream = stream;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    let mimeType;
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    } else if (MediaRecorder.isTypeSupported("audio/mpeg")) {
      mimeType = "audio/mpeg";
    } else if (MediaRecorder.isTypeSupported("audio/wav")) {
      mimeType = "audio/wav";
    } else if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      mimeType = "video/webm; codecs=vp9";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      mimeType = "video/webm";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
    } else {
      console.error("No suitable MIME type found for this device.");
      return;
    }

    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      console.log("Data available", event.data);
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    startRecordButton.disabled = false;
  } catch (error) {
    console.error("Error initializing recorder:", error);
  }
};

let lastRms = 0;
let isUpdatingNeedle = false;
const minAngle = -45;
const maxAngle = 180;
let needleRotations = [];

function updateNeedle() {
  if (!isUpdatingNeedle) return;

  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i] / 128 - 1;
    sum += value * value;
  }
  const rms = Math.sqrt(sum / dataArray.length);

  // Apply smoothing
  const smoothingFactor = 0.2;
  const smoothedRms = smoothingFactor * rms + (1 - smoothingFactor) * lastRms;
  lastRms = smoothedRms;

  // Normalize to the needle rotation range

  const needleRotation = smoothedRms * (maxAngle - minAngle) + minAngle;

  // Set inline style
  const needleElement = document.querySelector(".vu-meter__needle");
  needleElement.style.transform = `rotate(${needleRotation}deg)`;

  requestAnimationFrame(updateNeedle);
}

function resetNeedleAngle() {
  const needleElement = document.querySelector(".vu-meter__needle");
  needleElement.style.transform = minAngle; // Reset to min angle
}

startRecordButton.addEventListener("click", () => {
  const vuMeterBackground = document.querySelector(".vu-meter__background");
  const vuArchOverlap = document.querySelector(".vu_meter__arch--overlap");

  if (!mediaRecorder) {
    console.error("MediaRecorder is not initialized.");
    return;
  }

  vuMeterBackground.classList.add("vu-meter__background-recording");
  vuArchOverlap.classList.add("vu_meter__arch--overlap-recording");
  recordLight.classList.add("record-ui__light--on");
  recordText.classList.add("record-ui__text--on");

   // Additional logging for debugging
   console.log("Classes added to vuMeterBackground:", vuMeterBackground.classList);
   console.log("Classes added to vuArchOverlap:", vuArchOverlap.classList);

  audioChunks = [];
  mediaRecorder.start();
  console.log("Recording started");
  startRecordButton.disabled = true;
  startRecordButton.style.opacity = "0.5";
  stopRecordButton.disabled = false;
  isUpdatingNeedle = true;
  updateNeedle();
  closeModalButton.style.display = "none";
});

stopRecordButton.addEventListener("click", () => {
  const vuMeterBackground = document.querySelector(".vu-meter__background");
  const vuArchOverlap = document.querySelector(".vu_meter__arch--overlap");

  if (!mediaRecorder) {
    console.error("MediaRecorder is not initialized.");
    return;
  }

  vuMeterBackground.classList.remove("vu-meter__background-recording");
  vuArchOverlap.classList.remove("vu_meter__arch--overlap-recording");
  recordLight.classList.remove("record-ui__light--on");
  recordText.classList.remove("record-ui__text--on");
  useSampleButton.classList.remove("save-sample-btn__disabled");
  closeModalButton.style.display = "flex";
  startRecordButton.style.opacity = "1";

  mediaRecorder.stop();
  console.log("Recording stopped in listener");
  isUpdatingNeedle = false;
  resetNeedleAngle();

  mediaRecorder.onstop = async () => {
    console.log("Recording stopped in async onstop");
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
    const arrayBuffer = await audioBlob.arrayBuffer();

    if (!audioContext) {
      console.error("AudioContext not initialized");
      return;
    }

    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log("Audio buffer decoded", audioBuffer);

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = offlineContext.createGain();
      const fadeInDuration = 0.125; // Fade-in duration in seconds
      const totalDuration = audioBuffer.duration;

      // Fade in
      gainNode.gain.setValueAtTime(0, 0); // Start at 0 gain
      gainNode.gain.linearRampToValueAtTime(1, fadeInDuration); // Ramp to 1 over fadeInDuration

      // Maintain full volume during the middle of the clip
      gainNode.gain.setValueAtTime(1, fadeInDuration); // Hold full volume after fade-in

      // Fade out
      const endFadeStart = totalDuration - 0.125; // Start fade out 0.75 seconds before the end
      const endFadeEnd = totalDuration - 0.0625; // End fade out 0.25 seconds before the end
      gainNode.gain.setValueAtTime(1, endFadeStart);
      gainNode.gain.linearRampToValueAtTime(0, endFadeEnd);
      gainNode.gain.setValueAtTime(0, totalDuration); // Ensure it ends at 0

      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      source.start(0); // Start playback immediately

      offlineContext
        .startRendering()
        .then((renderedBuffer) => {
          console.log("Audio processing completed (offlineContext).");

          // Store the trimmed audio buffer
          trimmedAudioBuffer = renderedBuffer;

          // Create a new Blob from the rendered buffer
          const wavBlob = audioBufferToWavBlob(renderedBuffer);
          const audioUrl = URL.createObjectURL(wavBlob);
          console.log("Processed audio URL:", audioUrl);

          audioPlayback.src = audioUrl;
          audioPlayback.controls = true;

          startRecordButton.disabled = false;
          stopRecordButton.disabled = true;
        })
        .catch((error) => {
          console.error("Error during offline rendering:", error);
        });
    } catch (error) {
      console.error("Error decoding or processing audio data", error);
    }
    
    startRecordButton.disabled = false;
  };
});

// Function to convert an AudioBuffer to a WAV Blob
export function audioBufferToWavBlob(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);

  writeString(view, 0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length - 44, true);

  let offset = 44;
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const channelData = buffer.getChannelData(i);
    for (let j = 0; j < channelData.length; j++) {
      view.setInt16(offset, channelData[j] * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

export function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

const waveformImage = document.getElementById("waveformImage");
const noSampleScreen = document.getElementById("noSampleScreen");

// Function to draw waveform and create an image
function drawSampleWaveform(audioBuffer) {
  const canvas = document.getElementById("waveformCanvas");
  const canvasCtx = canvas.getContext("2d");
  const bufferLength = audioBuffer.length;
  const dataArray = new Float32Array(bufferLength);

  // Copy audio buffer data into the dataArray
  audioBuffer.copyFromChannel(dataArray, 0); // Use the first channel

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // Create a linear gradient
const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0); // From left to right
gradient.addColorStop(0, 'rgb(51, 51, 51)');   // Start color
gradient.addColorStop(0.5, 'rgb(102, 102, 102)'); // Middle color
gradient.addColorStop(1, 'rgb(51, 51, 51)');   // End color

// Set the gradient as the fill style
canvasCtx.fillStyle = gradient;

  // Clear canvas
  // canvasCtx.fillStyle = 'linear-gradient(to right, rgb(51, 51, 51) 0%, rgb(102, 102, 102) 50%, rgb(51, 51, 51) 100%)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 1;
  //canvasCtx.strokeStyle = 'rgba(0, 255, 242, 0.631)';
  canvasCtx.strokeStyle = 'rgba(255, 253, 130, 0.750)';

  canvasCtx.beginPath();

  const sliceWidth = WIDTH * 1.0 / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i]; // Get normalized value
    const y = (v * 0.5 + 0.5) * HEIGHT; // Normalize to fit the canvas height

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, HEIGHT / 2);
  canvasCtx.stroke();

  // Convert the canvas to an image
  waveformImage.src = canvas.toDataURL("image/png");
}

// useSampleButton event listener
useSampleButton.addEventListener("click", async () => {
  console.log("Use sample button clicked");

  if (!trimmedAudioBuffer) { // Check if trimmed audio buffer exists
    console.error("No trimmed audio recorded to use as sample.");
    return;
  }

  try {
    // Use the trimmed audio buffer directly
    console.log("Using trimmed audio buffer", trimmedAudioBuffer);
    
    // Draw the waveform and create an image
    drawSampleWaveform(trimmedAudioBuffer);

    // Call the function to update the synthesizer with the new audio buffer
    updateCustomWaveform(trimmedAudioBuffer); // Use the trimmed buffer

    // Change waveformImage display to block
    waveformImage.style.display = "block";
    noSampleScreen.style.display = "none";

    soundSelectSample.style.display = "block";

    // Automatically select "sample" in the waveform selector
    const waveformSelect = document.getElementById("waveformSelect");
    waveformSelect.value = "sample";

  } catch (error) {
    console.error("Error processing trimmed audio buffer", error);
  }
});

// // useSampleButton event listener
// useSampleButton.addEventListener("click", async () => {
//   console.log("Use sample button clicked");

 

//   if (!audioChunks.length) {
//     console.error("No audio recorded to use as sample.");
//     return;
//   }

//   const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
//   const arrayBuffer = await audioBlob.arrayBuffer();

//   if (!audioContext) {
//     console.error("AudioContext not initialized");
//     return;
//   }

//   try {
//     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
//     console.log("Audio buffer decoded", audioBuffer);

//     // Draw the waveform and create an image
//     drawSampleWaveform(audioBuffer);

//     // Call the function to update the synthesizer with the new audio buffer
//     updateCustomWaveform(audioBuffer); // Ensure this is called to load the sample for playback

//     // Change waveformImage display to block
//     waveformImage.style.display = "block";
//     noSampleScreen.style.display = "none";

//     soundSelectSample.style.display = "block";

//     // Automatically select "sample" in the waveform selector
//     const waveformSelect = document.getElementById("waveformSelect");
//     waveformSelect.value = "sample";

//   } catch (error) {
//     console.error("Error decoding or processing audio data", error);
//   }
// });