import { mainGainNode } from "../synth/synth.js";

let delayNode;
let feedbackGainNode;
let delayGainNode;

const volumeLevel = 5;

const volumeLevelLights = [
  document.getElementById("volumeFxLevelLightOne"),
  document.getElementById("volumeFxLevelLightTwo"),
  document.getElementById("volumeFxLevelLightThree"),
  document.getElementById("volumeFxLevelLightFour"),
  document.getElementById("volumeFxLevelLightFive"),
];

const delayLevelLights = [
  document.getElementById("delayFxLevelLightOne"),
  document.getElementById("delayFxLevelLightTwo"),
  document.getElementById("delayFxLevelLightThree"),
  document.getElementById("delayFxLevelLightFour"),
  document.getElementById("delayFxLevelLightFive"),
];

const gainLevelLights = [
  document.getElementById("gainFxLevelLightOne"),
  document.getElementById("gainFxLevelLightTwo"),
  document.getElementById("gainFxLevelLightThree"),
  document.getElementById("gainFxLevelLightFour"),
  document.getElementById("gainFxLevelLightFive"),
];

const reverbLevelLights = [
  document.getElementById("reverbFxLevelLightOne"),
  document.getElementById("reverbFxLevelLightTwo"),
  document.getElementById("reverbFxLevelLightThree"),
  document.getElementById("reverbFxLevelLightFour"),
  document.getElementById("reverbFxLevelLightFive"),
];

lightUpLevels(volumeLevel, volumeLevelLights, "teal-light");

// Function to light up levels up to the clicked one for a given effect (delay or gain)
export function lightUpLevels(level, levelLights, lightClass) {
  for (let i = 0; i < levelLights.length; i++) {
    if (i < level) {
      levelLights[i].classList.add(lightClass); // Add light (yellow or pink) class
    } else {
      levelLights[i].classList.remove(lightClass);
    }
  }
}

// Function to check if lights are currently on for the clicked level
export function areLightsOn(level, levelLights, lightClass) {
  return levelLights[level].classList.contains(lightClass);
}

// Function to get the current active level for a given effect
export function getCurrentLevel(levelLights, lightClass) {
  for (let i = levelLights.length - 1; i >= 0; i--) {
    if (areLightsOn(i, levelLights, lightClass)) {
      return i + 1; // Return the highest level that's lit
    }
  }
  return 0; // No lights are on
}

//Set up all effects
export function setUpEffects(audioContext) {
  setUpDelayEffect(audioContext);
  setUpGainEffect(audioContext);
  setUpReverbEffect(audioContext);
}

// Create a delay node
export function setUpDelayEffect(audioContext) {
  if (!audioContext) {
    console.error("AudioContext is not initialized.");
    return;
  }

  delayNode = audioContext.createDelay();
  delayNode.delayTime.value = 0; // Start with no delay

  // Create a gain node to control the delay effect's feedback
  feedbackGainNode = audioContext.createGain();
  feedbackGainNode.gain.value = 0.5; // Default feedback

  // Create a gain node to control the delay level
  delayGainNode = audioContext.createGain();
  delayGainNode.gain.value = 0; // Default delay level (no delay)

  // Connect the audio nodes
  mainGainNode.connect(delayNode); // Route main audio to the delay node
  delayNode.connect(feedbackGainNode); // Connect delay node to feedback gain
  feedbackGainNode.connect(delayNode); // Create feedback loop
  delayNode.connect(delayGainNode); // Connect delay output to delay gain
  delayGainNode.connect(mainGainNode); // Connect the delay gain back to main output
}

// Function to update the delay level
function setDelayLevel(level) {
  if (!delayNode) {
    console.error(
      "Delay node is not initialized. Make sure setUpDelayEffect is called first."
    );
    return;
  }
  const longestDelayTime = 1; // Max delay time in seconds
  //const newDelayTime = (level / delayLevelLights.length) * longestDelayTime; // Scale delay time
  let newDelayTime =
    ((delayLevelLights.length - level) / delayLevelLights.length) *
    longestDelayTime; // Invert scaling
  if (newDelayTime <= 0) {
    //makesure delay time is not zero
    newDelayTime = 0.1;
  }
  delayNode.delayTime.value = newDelayTime; // Update the delay time

  const newDelayGain = level * 0.1; // Scale gain based on the level (0 to 1)
  delayGainNode.gain.value = newDelayGain; // Update delay gain level

  console.log("Delay set to:", newDelayTime, "seconds, Gain:", newDelayGain);
}

// Event listeners for delay levels
delayLevelLights.forEach((light, index) => {
  light.parentElement.addEventListener("click", function () {
    const currentLevel = getCurrentLevel(delayLevelLights, "yellow-light");
    const newLevel = index + 1;

    if (currentLevel === newLevel) {
      // If the clicked level is the current level, clear all lights for delay
      lightUpLevels(0, delayLevelLights, "yellow-light");
      setDelayLevel(0); // Disable delay
    } else if (newLevel < currentLevel) {
      // If a lower level is clicked, go down to that level
      lightUpLevels(newLevel, delayLevelLights, "yellow-light");
      setDelayLevel(newLevel);
    } else {
      // Otherwise, light up levels up to the clicked one
      lightUpLevels(newLevel, delayLevelLights, "yellow-light");
      setDelayLevel(newLevel);
    }
  });
});

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

let distortionNode;
let dryGainNode;
let wetGainNode;

// Function to add distortion effect is called setUpGainEffect
export function setUpGainEffect(audioContext) {
  console.log("Setting up distortion effect...");

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

  console.log("Distortion effect set up with wet/dry mix.", distortionNode);
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

// gainLevelLights.forEach((light, index) => {
//   light.parentElement.addEventListener("click", function () {
//     const currentLevel = getCurrentLevel(gainLevelLights, "pink-light");

//     if (currentLevel === index + 1) {
//       // If the clicked level is the current level, clear all lights for gain
//       lightUpLevels(0, gainLevelLights, "pink-light");
//     } else if (index + 1 < currentLevel) {
//       // If a lower level is clicked, go down to that level
//       lightUpLevels(index + 1, gainLevelLights, "pink-light");
//     } else {
//       // Otherwise, light up levels up to the clicked one
//       lightUpLevels(index + 1, gainLevelLights, "pink-light");
//     }
//   });
// });

// reverbLevelLights.forEach((light, index) => {
//   light.parentElement.addEventListener("click", function () {
//     const currentLevel = getCurrentLevel(reverbLevelLights, "purple-light");

//     if (currentLevel === index + 1) {
//       // If the clicked level is the current level, clear all lights for gain
//       lightUpLevels(0, reverbLevelLights, "purple-light");
//     } else if (index + 1 < currentLevel) {
//       // If a lower level is clicked, go down to that level
//       lightUpLevels(index + 1, reverbLevelLights, "purple-light");
//     } else {
//       // Otherwise, light up levels up to the clicked one
//       lightUpLevels(index + 1, reverbLevelLights, "purple-light");
//     }
//   });
// });

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
  //reverbNode.normalize = false; // Disable normalization

  // Create the impulse response for the reverb
  const impulseResponse = createImpulseResponse(2, 10); // 2 seconds duration, decay of 3
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
  dryReverbGainNode.gain.value = 1;  // Full dry signal
  wetReverbGainNode.gain.value = 0; // No wet signal

  console.log("Reverb node set up with wet/dry mix.", reverbNode);
  console.log("reverbNode buffer:", reverbNode.buffer);
  console.log("main gain node:", mainGainNode);
  console.log("dry reverb gain node:", dryReverbGainNode);
  console.log("wet reverb gain node:", wetReverbGainNode);
  console.log("Reverb buffer length:", reverbNode.buffer.length);
  console.log("Reverb buffer sample rate:", reverbNode.buffer.sampleRate);
  console.log("Reverb buffer duration:", reverbNode.buffer.duration);
  console.log("Reverb buffer channels:", reverbNode.buffer.numberOfChannels);
  console.log("Reverb buffer data:", reverbNode.buffer.getChannelData(0));
  console.log(
    "Reverb buffer data length:",
    reverbNode.buffer.getChannelData(0).length
  );
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

// // Function to set up the reverb effect
// export function setUpReverbEffect(audioContext) {
//     console.log("Setting up reverb effect...");

//     if (!audioContext) {
//         console.error("AudioContext is not initialized.");
//         return;
//     }

//     // Create a convolver node
//     reverbNode = audioContext.createConvolver();

//     // Create the impulse response
//     const impulseResponse = createImpulseResponse(2, 3); // 2 seconds duration, decay of 3
//     const impulseBuffer = audioContext.createBuffer(1, impulseResponse.length, audioContext.sampleRate);
//     impulseBuffer.getChannelData(0).set(impulseResponse);
//     reverbNode.buffer = impulseBuffer;

//     // Create a gain node for the reverb level
//     reverbGainNode = audioContext.createGain();
//     reverbGainNode.gain.value = 0; // Start with no reverb

//     // Connect the nodes
//     mainGainNode.connect(reverbNode); // Connect main audio to reverb
//     reverbNode.connect(reverbGainNode); // Connect reverb to gain node
//     reverbGainNode.connect(audioContext.destination); // Connect gain node to output

//     console.log("Reverb effect set up.", reverbNode);
// }

// // Function to update the reverb level
// function setReverbLevel(level) {
//     if (!reverbGainNode) {
//         console.error("Reverb gain node is not initialized. Make sure setUpReverbEffect is called first.");
//         return;
//     }

//     // Scale reverb gain based on the level
//     const newReverbGain = level * 0.5; // Scale gain (0 to 0.5)
//     reverbGainNode.gain.value = newReverbGain;

//     console.log("Reverb level set to:", newReverbGain);
// }

// // Event listeners for reverb levels
// reverbLevelLights.forEach((light, index) => {
//     light.parentElement.addEventListener("click", function () {
//         const currentLevel = getCurrentLevel(reverbLevelLights, "purple-light");
//         const newLevel = index + 1;

//         if (currentLevel === newLevel) {
//             // If the clicked level is the current level, clear all lights for reverb
//             lightUpLevels(0, reverbLevelLights, "purple-light");
//             setReverbLevel(0); // Disable reverb
//         } else if (newLevel < currentLevel) {
//             // If a lower level is clicked, go down to that level
//             lightUpLevels(newLevel, reverbLevelLights, "purple-light");
//             setReverbLevel(newLevel);
//         } else {
//             // Otherwise, light up levels up to the clicked one
//             lightUpLevels(newLevel, reverbLevelLights, "purple-light");
//             setReverbLevel(newLevel);
//         }
//     });
// });

function setVolume(volume) {
  if (mainGainNode) {
    mainGainNode.gain.value = volume; // Update the volume on mainGainNode
    console.log("Volume set to:", volume);
  } else {
    console.error("mainGainNode is not defined");
  }
}

export function setupVolumeControls() {
  volumeLevelLights.forEach((light, index) => {
    light.parentElement.addEventListener("click", function () {
      const currentLevel = getCurrentLevel(volumeLevelLights, "teal-light");

      // Calculate the new volume level based on the index
      const newVolume = (index + 1) * 0.2;

      if (currentLevel === index + 1) {
        // If the clicked level is the current level, clear all lights for volume
        lightUpLevels(0, volumeLevelLights, "teal-light");
        setVolume(0); // Mute
      } else if (index + 1 < currentLevel) {
        // If a lower level is clicked, go down to that level
        lightUpLevels(index + 1, volumeLevelLights, "teal-light");
        setVolume(newVolume);
      } else {
        // Otherwise, light up levels up to the clicked one
        lightUpLevels(index + 1, volumeLevelLights, "teal-light");
        setVolume(newVolume);
      }
    });
  });
}
