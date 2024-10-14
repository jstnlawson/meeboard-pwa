// octave.js
export let currentOctaveShift = 0;

export function setOctaveToZero() {
  const octaveButtons = document.querySelectorAll(".octave-btn");
  currentOctaveShift = 0;
  octaveButtons.forEach((button) => {
    button.classList.remove(
      "yellow-light",
      "teal-light",
      "pink-light",
      "purple-light"
    );
  });
}

export default function setUpOctaveControls(keyboard, noteFreq) {
  const octaveUpButton = document.getElementById("octaveUp");
  const octaveDownButton = document.getElementById("octaveDown");
  const octaveButtons = document.querySelectorAll(".octave-btn");

  function updateOctaveButtonColors() {
    octaveButtons.forEach((button) => {
      button.classList.remove(
        "yellow-light",
        "teal-light",
        "pink-light",
        "purple-light"
      );

      if (currentOctaveShift === 2) {
        button.classList.add("teal-light");
      }
      if (currentOctaveShift === 1) {
        button.classList.add("yellow-light");
      }
      if (currentOctaveShift === 0) {
        // No color, reset to default or leave blank
      }
      if (currentOctaveShift === -1) {
        button.classList.add("pink-light");
      }
      if (currentOctaveShift === -2) {
        button.classList.add("purple-light");
      }
    });
  }

  function shiftOctave() {
    const keys = keyboard.querySelectorAll("button");
  
    keys.forEach((key) => {
      const note = key.dataset.note;
      const originalOctave = parseInt(key.dataset.octave);
      const newOctave = originalOctave + currentOctaveShift;
  
      // Fetch the original speed that never changes
      const originalSpeed = parseFloat(key.dataset.originalSpeed);
  
      let newSpeed;
  
      console.log("currentOctaveShift in shiftOctave", currentOctaveShift);
  
      // Hardcode speed adjustments based on currentOctaveShift
      if (currentOctaveShift === 1) {
        newSpeed = originalSpeed * 2;  // Shift one octave up (double the speed)
      } else if (currentOctaveShift === -1) {
        newSpeed = originalSpeed / 2;  // Shift one octave down (halve the speed)
      } else if (currentOctaveShift === 2) {
        newSpeed = originalSpeed * 4;  // Shift two octaves up (quadruple the speed)
      } else if (currentOctaveShift === -2) {
        newSpeed = originalSpeed / 4;  // Shift two octaves down (quarter the speed)
      } else {
        newSpeed = originalSpeed;  // No octave shift, use original speed
      }
  
      // Update the speed in the dataset
      key.dataset.speed = newSpeed;
  
      // Adjust the frequency for oscillator sounds
      if (newOctave >= 1 && newOctave <= 5) {
        const newFrequency = noteFreq[newOctave][note];
        key.dataset.frequency = newFrequency;
      }
    });
  }

  function addEventListeners() {
    octaveUpButton.addEventListener("click", () => {
      console.log("octaveUpButton clicked");
      if (currentOctaveShift < 2) {
        currentOctaveShift++;
        shiftOctave();
        updateOctaveButtonColors();
        console.log("currentOctaveShift in up button", currentOctaveShift);
      }
    });

    octaveDownButton.addEventListener("click", () => {
      console.log("octaveDownButton clicked");
      if (currentOctaveShift > -2) {
        currentOctaveShift--;
        shiftOctave();
        updateOctaveButtonColors();
        console.log("currentOctaveShift in down button", currentOctaveShift);
      }
    });

    octaveButtons.forEach((button) => {
      button.addEventListener("click", updateOctaveButtonColors);
    });
  }

  // Initialize everything
  addEventListeners();
}