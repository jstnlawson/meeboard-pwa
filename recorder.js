const openButton = document.querySelector('[data-open-modal]');
const closeButton = document.querySelector('[data-close-modal]');
const modal = document.querySelector('[data-modal]');

openButton.addEventListener('click', () => {
    modal.showModal();
});

closeButton.addEventListener('click', () => {
    modal.close();
});


const startRecordButton = document.getElementById('startRecord');
const stopRecordButton = document.getElementById('stopRecord');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];

// Request microphone access
export const initializeRecorder = async () => {
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