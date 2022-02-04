import { createApp } from 'vue'
import App from './App.vue'
import * as faceapi from 'face-api.js'

createApp(App).mount('#app')
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo())

const video = document.getElementById('video')

function startVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err) {
        console.log(err);
      });
  }

let statusPercent = {
	default: 0,
	neutral: 0,
	happy: 0,
	sad: 0,
	angry: 0,
	fearful: 0,
	disgusted: 0,
	surprised: 0,
}
 
video.addEventListener('play', () => {
    // const canvas = faceapi.createCanvasFromMedia(video)
    // document.body.append(canvas)
    // const displaySize = {width: video.width, height: video.height }
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        console.log(detections)
        // const resizedDetections = faceapi.resizeResults(detections, displaySize)
        // faceapi.draw.drawDetections(canvas, resizedDetections)

        if (detections.length > 0) {
          detections.forEach((element) => {
            let status = ''
            let valueStatus = 0.0

            for (const [key, value] of Object.entries(element.expressions)) {
              if (value > valueStatus) {
                status = key
                valueStatus = value
              }
            }
            statusPercent[status] += valueStatus
            console.log(statusPercent)
          })
        } else {
          console.log(0)
        }
    }, 1000)
})