import { mainGainNode } from "../../synth/synth.js";
import { lightUpLevels, getCurrentLevel } from "../fx.js";

const volumeLevel = 5;

const volumeLevelLights = [
  document.getElementById("volumeFxLevelLightOne"),
  document.getElementById("volumeFxLevelLightTwo"),
  document.getElementById("volumeFxLevelLightThree"),
  document.getElementById("volumeFxLevelLightFour"),
  document.getElementById("volumeFxLevelLightFive"),
];

lightUpLevels(volumeLevel, volumeLevelLights, "teal-light");

function setVolume(volume) {
    if (mainGainNode) {
      mainGainNode.gain.value = volume; // Update the volume on mainGainNode
      console.log("Volume set to:", volume);
    } else {
      console.error("mainGainNode is not defined");
    }
  }
  
  export function setUpVolumeControls() {
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