import { mainGainNode } from "../../synth/synth.js";
import { lightUpLevels, getCurrentLevel } from "../fx.js";

const reverbLevelLights = [
  document.getElementById("reverbFxLevelLightOne"),
  document.getElementById("reverbFxLevelLightTwo"),
  document.getElementById("reverbFxLevelLightThree"),
  document.getElementById("reverbFxLevelLightFour"),
  document.getElementById("reverbFxLevelLightFive"),
];

let reverbNode;
let dryReverbGainNode;
let wetReverbGainNode;

function createImpulseResponse(duration, decay) {
  const sampleRate = 44100;
  const length = sampleRate * duration;
  const impulse = new Float32Array(length);

  // for (let i = 0; i < length; i++) {
  //     impulse[i] = Math.pow(1 - i / length, decay);
  // }

  for (let i = 0; i < length; i++) {
    impulse[i] = (Math.random() * 0.5 - 0.25) * Math.pow(1 - i / length, decay);

    //impulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay); // Add randomness
  }

  return impulse;
}

// Function to set up the reverb effect
export function setUpReverbEffect(audioContext) {
  console.log("Setting up reverb effect...");

  if (!audioContext) {
    console.error("AudioContext is not initialized.");
    return;
  }

  // Create a convolver node for reverb
  reverbNode = audioContext.createConvolver();

  // Create the impulse response for the reverb
  const impulseResponse = createImpulseResponse(2, 2); 
  const impulseBuffer = audioContext.createBuffer(
    1,
    impulseResponse.length,
    audioContext.sampleRate
  );
  impulseBuffer.getChannelData(0).set(impulseResponse);
  reverbNode.buffer = impulseBuffer;

  // Create dry and wet gain nodes for the mix
  dryReverbGainNode = audioContext.createGain(); // For clean signal
  wetReverbGainNode = audioContext.createGain(); // For wet (reverberated) signal

  // Connect the main audio to the dry gain node
  if (!mainGainNode) {
    console.error("mainGainNode is not initialized.");
    return;
  }

  mainGainNode.connect(dryReverbGainNode); // Clean path
  mainGainNode.connect(reverbNode); // Connect to reverb path

  // Connect the reverb node to the wet gain node
  reverbNode.connect(wetReverbGainNode);

  // Connect both dry and wet paths to the destination
  dryReverbGainNode.connect(audioContext.destination); // Output for dry signal
  wetReverbGainNode.connect(audioContext.destination); // Output for wet signal

  // Set initial gains (no reverb at load)
  dryReverbGainNode.gain.value = 1; // Full dry signal
  wetReverbGainNode.gain.value = 0; // No wet signal
}

// Function to update the reverb level
function setReverbLevel(level) {
  console.log("Setting reverb level to:", level);
  if (!wetReverbGainNode) {
    console.error(
      "Wet Reverb gain node is not initialized. Make sure setUpReverbEffect is called first."
    );
    return;
  }

  // Scale reverb gain based on the level
  const newReverbGain = level * 1; // Scale gain (0 to 0.5)
  wetReverbGainNode.gain.value = newReverbGain;

  console.log("Reverb level set to:", newReverbGain);
  console.log("wet gain:", wetReverbGainNode.gain.value);
}

export function setWetDryReverbMix(wetReverbLevel) {
  if (!dryReverbGainNode || !wetReverbGainNode) {
    console.error("Reverb gain nodes are not initialized.");
    return;
  }

  // Set dry and wet gains (0 to 1)
  dryReverbGainNode.gain.value = 1 - wetReverbLevel;
  wetReverbGainNode.gain.value = wetReverbLevel * 1;

  console.log(
    `Wet/Dry mix set: Wet (${wetReverbLevel}), Dry (${1 - wetReverbLevel})`
  );
}

// Update the event listeners to include the wet/dry mix
reverbLevelLights.forEach((light, index) => {
  light.parentElement.addEventListener("click", function () {
    const currentLevel = getCurrentLevel(reverbLevelLights, "purple-light");
    const newLevel = index + 1;

    if (currentLevel === newLevel) {
      // If the clicked level is the current level, clear all lights for reverb
      lightUpLevels(0, reverbLevelLights, "purple-light");
      setReverbLevel(0); // Disable reverb
      setWetDryReverbMix(0);
    } else if (newLevel < currentLevel) {
      // If a lower level is clicked, go down to that level
      lightUpLevels(newLevel, reverbLevelLights, "purple-light");
      setReverbLevel(newLevel);
      setWetDryReverbMix(newLevel * 0.2);
    } else {
      // Otherwise, light up levels up to the clicked one
      lightUpLevels(newLevel, reverbLevelLights, "purple-light");
      setReverbLevel(newLevel);
      setWetDryReverbMix(newLevel * 0.2);
    }
  });
});
