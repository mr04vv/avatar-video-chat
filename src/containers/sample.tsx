import * as faceapi from "face-api.js";
import { useRef } from "react";
import Webcam from "react-webcam";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadModels = async () => {
    const MODEL_URL = "./models";
    console.debug(MODEL_URL);
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
  };

  const faceDetectHandler = async () => {
    await loadModels();
    if (webcamRef.current && canvasRef.current) {
      const webcam = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      webcam.width = webcam.videoWidth;
      webcam.height = webcam.videoHeight;
      canvas.width = webcam.videoWidth;
      canvas.height = webcam.videoHeight;
      const video = webcamRef.current.video;
      setInterval(async () => {
        const detectionsWithExpressions = await faceapi
          .detectAllFaces(video!, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();
        //   .then((e) => {
        //     console.debug(e[0]?.landmarks.positions[0]?.x);
        //     return e;
        //   });
        console.log(detectionsWithExpressions[0]?.landmarks);
      }, 200);
    }
  };

  return (
    <div>
      <main>
        <Webcam audio={false} ref={webcamRef} />
        <canvas ref={canvasRef} />
        <button onClick={faceDetectHandler}>顔認識</button>
      </main>
    </div>
  );
}
