import { mainGainNode, keyboard, noteFreq } from "../synth/synth.js";
import {setUpReverbEffect} from "./reverb/reverb.js";
import {setUpGainEffect} from "./gain/gain.js";
import {setUpDelayEffect} from "./delay/delay.js";
//import setUpOctaveControls from "./octave/octave.js";
// import { setUpVolumeControls } from "./volume/volume.js";


// const volumeLevel = 5;

// const volumeLevelLights = [
//   document.getElementById("volumeFxLevelLightOne"),
//   document.getElementById("volumeFxLevelLightTwo"),
//   document.getElementById("volumeFxLevelLightThree"),
//   document.getElementById("volumeFxLevelLightFour"),
//   document.getElementById("volumeFxLevelLightFive"),
// ];

// lightUpLevels(volumeLevel, volumeLevelLights, "teal-light");

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

// function setVolume(volume) {
//   if (mainGainNode) {
//     mainGainNode.gain.value = volume; // Update the volume on mainGainNode
//     console.log("Volume set to:", volume);
//   } else {
//     console.error("mainGainNode is not defined");
//   }
// }

// export function setupVolumeControls() {
//   volumeLevelLights.forEach((light, index) => {
//     light.parentElement.addEventListener("click", function () {
//       const currentLevel = getCurrentLevel(volumeLevelLights, "teal-light");

//       // Calculate the new volume level based on the index
//       const newVolume = (index + 1) * 0.2;

//       if (currentLevel === index + 1) {
//         // If the clicked level is the current level, clear all lights for volume
//         lightUpLevels(0, volumeLevelLights, "teal-light");
//         setVolume(0); // Mute
//       } else if (index + 1 < currentLevel) {
//         // If a lower level is clicked, go down to that level
//         lightUpLevels(index + 1, volumeLevelLights, "teal-light");
//         setVolume(newVolume);
//       } else {
//         // Otherwise, light up levels up to the clicked one
//         lightUpLevels(index + 1, volumeLevelLights, "teal-light");
//         setVolume(newVolume);
//       }
//     });
//   });
// }

//Set up all effects
export function setUpEffects(audioContext) {
  setUpDelayEffect(audioContext);
  setUpGainEffect(audioContext);
  setUpReverbEffect(audioContext);
  //setUpOctaveControls(keyboard, noteFreq);
}
