import {
    createNoteTable,
    assignFrequenciesToKeys,
    setup,
    playNote,
    stopNote,
} from './synth.js';

createNoteTable();
assignFrequenciesToKeys();
setup();

import { initializeRecorder } from './recorder.js';

initializeRecorder();

var select = document.getElementById('waveformSelect');
var selectPrev = document.getElementById('selectPrev');
  var selectNext = document.getElementById('selectNext');

  // Event listener for previous button
  selectPrev.addEventListener('click', function() {
    select.selectedIndex = Math.max(select.selectedIndex - 1, 0);
  });

  // Event listener for next button
  selectNext.addEventListener('click', function() {
    select.selectedIndex = Math.min(select.selectedIndex + 1, select.options.length - 1);
  });

//select.size = select.options.length;
select.size = select.options.length - 2;