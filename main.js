// const startRecordButton = document.getElementById('startRecord');
// const stopRecordButton = document.getElementById('stopRecord');
// const audioPlayback = document.getElementById('audioPlayback');

// let mediaRecorder;
// let audioChunks = [];

// // Define MIME types to be tested
// const mimeTypes = ["audio/webm", "audio/mp4","video/mp4", "audio/mpeg", "audio/wav"];

// startRecordButton.addEventListener('click', async () => {

//     audioChunks = [];
//     // Request microphone access
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//     // Function to start recording with retries for different MIME types
//     const startRecording = async (mimeIndex = 0) => {
//         try {
//             // Set the mimeType to the current item in the mimeTypes array
//             const mimeType = mimeTypes[mimeIndex];
//             MediaRecorder.isTypeSupported(mimeType);

//             // Create new MediaRecorder instance using the stream
//             mediaRecorder = new MediaRecorder(stream, { mimeType });

//             // Handle data available event
//             mediaRecorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     audioChunks.push(event.data);
//                 }
//             };

//             // Handle stop event
//             mediaRecorder.onstop = () => {
//                 const audioBlob = new Blob(audioChunks, { type: mimeType });
//                 const audioUrl = URL.createObjectURL(audioBlob);
//                 audioPlayback.src = audioUrl;
//                 audioChunks = [];
//             };

//             // Start recording
//             mediaRecorder.start();
//             startRecordButton.disabled = true;
//             stopRecordButton.disabled = false;
//         } catch (err) {
//             console.log("Error recording", err.message);

//             // Retry with the next mimeType if the current mimeType fails
//             const retries = mimeTypes.length;
//             if (mimeIndex < retries - 1) {
//                 startRecording(mimeIndex + 1);
//             }
//         }
//     };

//     // Start recording with retries for different MIME types
//     startRecording();
// });

// stopRecordButton.addEventListener('click', () => {
//     // Stop recording
//     mediaRecorder.stop();
//     startRecordButton.disabled = false;
//     stopRecordButton.disabled = true;
// });

const startRecordButton = document.getElementById('startRecord');
const stopRecordButton = document.getElementById('stopRecord');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];

// Request microphone access
const initializeRecorder = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let mimeType;
        if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
            mimeType = 'audio/mpeg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            var options = {mimeType: 'video/webm; codecs=vp9'};
        } else  if (MediaRecorder.isTypeSupported('video/webm')) {
            var options = {mimeType: 'video/webm'};
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            var options = {mimeType: 'video/mp4', videoBitsPerSecond : 100000} 
        } else {
            console.error("No suitable MIME type found for this device.");
            return;
        }
        
        mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioChunks = [];
        };

        startRecordButton.disabled = false;
    } catch (error) {
        console.error("Error initializing recorder:", error);
    }
};

startRecordButton.addEventListener('click', () => {
    if (!mediaRecorder) {
        console.error("MediaRecorder is not initialized.");
        return;
    }
    
    audioChunks = [];
    mediaRecorder.start();
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
});

stopRecordButton.addEventListener('click', () => {
    if (!mediaRecorder) {
        console.error("MediaRecorder is not initialized.");
        return;
    }

    mediaRecorder.stop();
    startRecordButton.disabled = false;
    stopRecordButton.disabled = true;
});

// Initialize the recorder when the page loads
initializeRecorder();
