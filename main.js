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