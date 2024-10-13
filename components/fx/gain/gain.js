import { mainGainNode } from "../../synth/synth.js";
import { lightUpLevels, getCurrentLevel } from "../fx.js";

const gainLevelLights = [
  document.getElementById("gainFxLevelLightOne"),
  document.getElementById("gainFxLevelLightTwo"),
  document.getElementById("gainFxLevelLightThree"),
  document.getElementById("gainFxLevelLightFour"),
  document.getElementById("gainFxLevelLightFive"),
];

let distortionNode;
let dryGainNode;
let wetGainNode;

// Function to create a distortion curve
function makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

// Function to add distortion effect is called setUpGainEffect
export function setUpGainEffect(audioContext) {
//   console.log("Setting up distortion effect...");

  if (!audioContext) {
    console.error("AudioContext is not initialized.");
    return;
  }

  // Create a distortion node
  distortionNode = audioContext.createWaveShaper();
  distortionNode.curve = makeDistortionCurve(400); // Set initial distortion curve
  distortionNode.oversample = "4x"; // Set oversample property

  // Create dry and wet gain nodes for the mix
  dryGainNode = audioContext.createGain(); // For clean signal
  wetGainNode = audioContext.createGain(); // For distorted signal

  if (!mainGainNode) {
    console.error("mainGainNode is not initialized.");
    return;
  }

  // Split the signal into dry and wet paths
  mainGainNode.connect(dryGainNode); // Clean path
  mainGainNode.connect(distortionNode); // Distortion path

  // Connect distortion node to wet gain node
  distortionNode.connect(wetGainNode);

  // Connect both dry and wet paths to the destination
  dryGainNode.connect(audioContext.destination);
  wetGainNode.connect(audioContext.destination);

  // Set initial gains (no distortion at load)
  dryGainNode.gain.value = 1; // Full dry signal
  wetGainNode.gain.value = 0; // No wet signal

//   console.log("Distortion effect set up with wet/dry mix.", distortionNode);
}

// Function to set the gain/distortion level and adjust the distortion curve
export function setGainLevel(level) {
  if (!distortionNode) {
    console.error("distortionNode is not initialized.");
    return;
  }

  // Update the distortion amount based on the selected level
  const distortionAmount = level * 500; // Scale distortion amount (adjust as needed)
  distortionNode.curve = makeDistortionCurve(distortionAmount);

  console.log("Distortion set to:", distortionAmount);
}

// Function to control the wet/dry mix (balance between clean and distorted signals)
export function setWetDryMix(wetLevel) {
  if (!dryGainNode || !wetGainNode) {
    console.error("Gain nodes are not initialized.");
    return;
  }

  // Set dry and wet gains (0 to 1)
  dryGainNode.gain.value = 2 - wetLevel;
  wetGainNode.gain.value = wetLevel;

  console.log(`Wet/Dry mix set: Wet (${wetLevel}), Dry (${1 - wetLevel})`);
}

// Add event listeners to each gain level
gainLevelLights.forEach((light, index) => {
  light.parentElement.addEventListener("click", function () {
    const currentLevel = getCurrentLevel(gainLevelLights, "pink-light");
    const newLevel = index + 1;

    if (currentLevel === newLevel) {
      // If the clicked level is the current level, clear all lights for gain
      lightUpLevels(0, gainLevelLights, "pink-light");
      setGainLevel(0); // Disable distortion
      setWetDryMix(0); // Set to dry (no distortion)
    } else if (newLevel < currentLevel) {
      // If a lower level is clicked, go down to that level
      lightUpLevels(newLevel, gainLevelLights, "pink-light");
      setGainLevel(newLevel); // Adjust distortion amount
      setWetDryMix(newLevel * 0.2); // Adjust wet/dry mix based on level
    } else {
      // Otherwise, light up levels up to the clicked one
      lightUpLevels(newLevel, gainLevelLights, "pink-light");
      setGainLevel(newLevel); // Adjust distortion amount
      setWetDryMix(newLevel * 0.2); // Adjust wet/dry mix based on level
    }
  });
});
