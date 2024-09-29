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

const chorusLevelLights = [
  document.getElementById("chorusFxLevelLightOne"),
  document.getElementById("chorusFxLevelLightTwo"),
  document.getElementById("chorusFxLevelLightThree"),
  document.getElementById("chorusFxLevelLightFour"),
  document.getElementById("chorusFxLevelLightFive"),
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
        console.error("Delay node is not initialized. Make sure setUpDelayEffect is called first.");
        return;
    }
  const maxDelayTime = 1.0; // Max delay time in seconds
  const newDelayTime = (level / delayLevelLights.length) * maxDelayTime; // Scale delay time
  delayNode.delayTime.value = newDelayTime; // Update the delay time

  const newDelayGain = level * 0.2; // Scale gain based on the level (0 to 1)
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



// Add event listeners to each gain level
gainLevelLights.forEach((light, index) => {
  light.parentElement.addEventListener("click", function () {
    const currentLevel = getCurrentLevel(gainLevelLights, "pink-light");

    if (currentLevel === index + 1) {
      // If the clicked level is the current level, clear all lights for gain
      lightUpLevels(0, gainLevelLights, "pink-light");
    } else if (index + 1 < currentLevel) {
      // If a lower level is clicked, go down to that level
      lightUpLevels(index + 1, gainLevelLights, "pink-light");
    } else {
      // Otherwise, light up levels up to the clicked one
      lightUpLevels(index + 1, gainLevelLights, "pink-light");
    }
  });
});

chorusLevelLights.forEach((light, index) => {
  light.parentElement.addEventListener("click", function () {
    const currentLevel = getCurrentLevel(chorusLevelLights, "purple-light");

    if (currentLevel === index + 1) {
      // If the clicked level is the current level, clear all lights for gain
      lightUpLevels(0, chorusLevelLights, "purple-light");
    } else if (index + 1 < currentLevel) {
      // If a lower level is clicked, go down to that level
      lightUpLevels(index + 1, chorusLevelLights, "purple-light");
    } else {
      // Otherwise, light up levels up to the clicked one
      lightUpLevels(index + 1, chorusLevelLights, "purple-light");
    }
  });
});

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
