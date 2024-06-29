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
let audioContext;

// Request microphone access
export const initializeRecorder = async (context) => {
    audioContext = context;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // let mimeType;
        // if (MediaRecorder.isTypeSupported('audio/webm')) {
        //     mimeType = 'audio/webm';
        // } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        //     mimeType = 'audio/mp4';
        // } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
        //     mimeType = 'audio/mpeg';
        // } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        //     mimeType = 'audio/wav';
        // } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
        //     var options = {mimeType: 'video/webm; codecs=vp9'};
        // } else  if (MediaRecorder.isTypeSupported('video/webm')) {
        //     var options = {mimeType: 'video/webm'};
        // } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        //     var options = {mimeType: 'video/mp4', videoBitsPerSecond : 100000} 
        // } else {
        //     console.error("No suitable MIME type found for this device.");
        //     return;
        // }

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
            mimeType = 'video/webm; codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
        } else {
            console.error("No suitable MIME type found for this device.");
            return;
        }
        
        mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = (event) => {
            console.log("Data available", event.data);
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
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
    console.log("Recording started");
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
});

stopRecordButton.addEventListener('click', () => {
    if (!mediaRecorder) {
        console.error("MediaRecorder is not initialized.");
        return;
    }

    mediaRecorder.stop();
    console.log("Recording stopped in listener");

    mediaRecorder.onstop = async () => {
        console.log("Recording stopped in async onstop");
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        const arrayBuffer = await audioBlob.arrayBuffer();

        if (!audioContext) {
            console.error("AudioContext not initialized");
            return;
        }

        try {
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log("Audio buffer decoded", audioBuffer);

            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            const gainNode = offlineContext.createGain();

            const fadeInDuration = 0.5;
            const totalDuration = audioBuffer.duration;
            const endFadeStart = totalDuration - 0.75;
            const endFadeEnd = totalDuration - 0.25;

            gainNode.gain.setValueAtTime(0, 0);
            gainNode.gain.linearRampToValueAtTime(1, fadeInDuration);
            gainNode.gain.setValueAtTime(1, endFadeStart);
            gainNode.gain.linearRampToValueAtTime(0, endFadeEnd);
            gainNode.gain.setValueAtTime(0, totalDuration);

            source.connect(gainNode);
            gainNode.connect(offlineContext.destination);

            source.start(0);

            // const processedBuffer = await offlineContext.startRendering();
            // console.log("Processed buffer", processedBuffer);

            // const newBlob = new Blob([processedBuffer], { type: mediaRecorder.mimeType });
            // const audioUrl = URL.createObjectURL(newBlob);
            // console.log("processed audio URL", audioUrl);
            // audioPlayback.src = audioUrl;

            // audioChunks = [];

            offlineContext.startRendering().then(renderedBuffer => {
                console.log('Audio processing completed (offlineContext).');
                
                // Create a new Blob from the rendered buffer
                const wavBlob = audioBufferToWavBlob(renderedBuffer);
                const audioUrl = URL.createObjectURL(wavBlob);
                console.log('Processed audio URL:', audioUrl);
                
                audioPlayback.src = audioUrl;
                audioPlayback.controls = true;

                audioChunks = [];

                startRecordButton.disabled = false;
            stopRecordButton.disabled = true;
            }).catch(error => {
                console.error('Error during offline rendering:', error);
            }); 

        } catch (error) {
            console.error("Error decoding or processing audio data", error);
        }

        audioChunks = [];
        startRecordButton.disabled = false;

        // if (mediaRecorder.stream) {
        //     mediaRecorder.stream.getTracks().forEach(track => track.stop());
        // }   
    };
});

// stopRecordButton.addEventListener('click', () => {
//     if (!mediaRecorder) {
//         console.error("MediaRecorder is not initialized.");
//         return;
//     }

//     mediaRecorder.stop();
//     startRecordButton.disabled = false;
//     stopRecordButton.disabled = true;
// });

// Function to convert an AudioBuffer to a WAV Blob
export function audioBufferToWavBlob(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length - 44, true);

    let offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        const channelData = buffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            view.setInt16(offset, channelData[j] * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}

export function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}