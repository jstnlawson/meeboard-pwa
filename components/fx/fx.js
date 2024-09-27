const levelLights = [
    document.getElementById('delayFxLevelLightOne'),
    document.getElementById('delayFxLevelLightTwo'),
    document.getElementById('delayFxLevelLightThree'),
    document.getElementById('delayFxLevelLightFour'),
    document.getElementById('delayFxLevelLightFive'),
  ];
  
  // Function to light up levels up to the clicked one
  export function lightUpLevels(level) {
    for (let i = 0; i < levelLights.length; i++) {
      if (i < level) {
        levelLights[i].classList.add('yellow-light');
      } else {
        levelLights[i].classList.remove('yellow-light');
      }
    }
  }
  
  // Function to check if lights are currently on for the clicked level
  export function areLightsOn(level) {
    return levelLights[level].classList.contains('yellow-light');
  }
  
  // Function to get the current active level (the highest level lit up)
  export function getCurrentLevel() {
    for (let i = levelLights.length - 1; i >= 0; i--) {
      if (areLightsOn(i)) {
        return i + 1; // Return the highest level that's lit
      }
    }
    return 0; // No lights are on
  }
  
  // Add event listeners to each level
  levelLights.forEach((light, index) => {
    light.parentElement.addEventListener('click', function () {
      const currentLevel = getCurrentLevel();
  
      if (currentLevel === index + 1) {
        // If the clicked level is the current level, clear all lights
        lightUpLevels(0);
      } else if (index + 1 < currentLevel) {
        // If a lower level is clicked, go down to that level
        lightUpLevels(index + 1);
      } else {
        // Otherwise, light up levels up to the clicked one
        lightUpLevels(index + 1);
      }
    });
  });
  