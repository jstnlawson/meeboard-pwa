import { mainGainNode } from "../../synth/synth.js";
import { lightUpLevels, getCurrentLevel } from "../fx.js";

const delayLevelLights = [
  document.getElementById("delayFxLevelLightOne"),
  document.getElementById("delayFxLevelLightTwo"),
  document.getElementById("delayFxLevelLightThree"),
  document.getElementById("delayFxLevelLightFour"),
  document.getElementById("delayFxLevelLightFive"),
];

let delayNode;
let feedbackGainNode;
let delayGainNode;

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
