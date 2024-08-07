import { updateCustomWaveform } from "../synth/synth.js";

const openButton = document.querySelector("[data-open-modal]");
const closeButton = document.querySelector("[data-close-modal]");
const modal = document.querySelector("[data-modal]");
const recordModal = document.getElementById("recordModal");

openButton.addEventListener("click", () => {
  modal.showModal();
  recordModal.style.display = "flex";
});

closeButton.addEventListener("click", () => {
  modal.close();
  recordModal.style.display = "none";
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

// Request microphone access
export const initializeRecorder = async (context) => {
  audioContext = context;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
const maxAngle = 45;
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
  stopRecordButton.disabled = false;
  isUpdatingNeedle = true;
  updateNeedle();
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

      const fadeInDuration = 0.5;
      const totalDuration = audioBuffer.duration;
      const endFadeStart = totalDuration - 0.75;
      const endFadeEnd = totalDuration - 0.25;

      gainNode.gain.setValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(1, fadeInDuration);
      gainNode.gain.setValueAtTime(1, endFadeStart);
      gainNode.gain.linearRampToValueAtTime(0, endFadeEnd);
      gainNode.gain.setValueAtTime(0, totalDuration);

      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      source.start(0);

      offlineContext
        .startRendering()
        .then((renderedBuffer) => {
          console.log("Audio processing completed (offlineContext).");

          // Create a new Blob from the rendered buffer
          const wavBlob = audioBufferToWavBlob(renderedBuffer);
          const audioUrl = URL.createObjectURL(wavBlob);
          console.log("Processed audio URL:", audioUrl);

          audioPlayback.src = audioUrl;
          audioPlayback.controls = true;

          // audioChunks = [];

          startRecordButton.disabled = false;
          stopRecordButton.disabled = true;
        })
        .catch((error) => {
          console.error("Error during offline rendering:", error);
        });
    } catch (error) {
      console.error("Error decoding or processing audio data", error);
    }

    // audioChunks = [];
    startRecordButton.disabled = false;
    // customPlayButton.disabled = false;
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

const useSampleButton = document.getElementById("useSampleButton");

useSampleButton.addEventListener("click", async () => {
  console.log("Use sample button clicked");

  if (!audioChunks.length) {
    console.error("No audio recorded to use as sample.");
    return;
  }

  const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
  const arrayBuffer = await audioBlob.arrayBuffer();

  if (!audioContext) {
    console.error("AudioContext not initialized");
    return;
  }

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log("Audio buffer decoded", audioBuffer);
    updateCustomWaveform(audioBuffer); // Use function to update

    // Optionally, log the type of waveform
  } catch (error) {
    console.error("Error decoding or processing audio data", error);
  }

    // const customWaveform = audioContext.createPeriodicWave(
    //   new Float32Array(audioBuffer.getChannelData(0)), // Sine terms
    //   new Float32Array(audioBuffer.getChannelData(1) || audioBuffer.getChannelData(0)) // Cosine terms
    // );

    // Get channel data and handle mono and stereo cases
  //   const channelData = audioBuffer.numberOfChannels === 2
  //     ? [
  //         new Float32Array(audioBuffer.getChannelData(0)), // Left channel (Sine terms)
  //         new Float32Array(audioBuffer.getChannelData(1))  // Right channel (Cosine terms)
  //       ]
  //     : [
  //         new Float32Array(audioBuffer.getChannelData(0)), // Single channel (Sine terms)
  //         new Float32Array(audioBuffer.getChannelData(0))  // Use the same data for Cosine terms
  //       ];

  //   const customWaveform = audioContext.createPeriodicWave(...channelData);

  //   updateCustomWaveform(customWaveform);
  //   audioChunks = [];
  // } catch (error) {
  //   console.error("Error decoding or processing audio data", error);
  // }
});
