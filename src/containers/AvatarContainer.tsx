import { useCallback, useEffect, useRef } from "react";
import WebCam from "react-webcam";
import { AvatarCanvas } from "../components/AvatarCanvas";
import { VideoInput } from "../components/VideoInput";
import { FacePoint } from "../lib/FacePoint";
import { live2dRender } from "../renderer";
import { getDistance, getAngle } from "../util/MathUtil";
import axios from "axios";
import json from "../lib/Hiyori/hiyori.model3.json";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { drawMesh } from "../lib/meshUtil";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import * as faceapi from "face-api.js";
import { TinyFaceDetector } from "face-api.js";
import { webcam } from "@tensorflow/tfjs-data";
export const AvatarContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<WebCam>(null);

  const MODEL_FILES = {
    moc3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.moc3`,
    model3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.model3.json`,
    physics3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.physics3.json`,
    textures: [
      `${process.env.PUBLIC_URL}/Hiyori/hiyori.2048/texture_00.png`,
      `${process.env.PUBLIC_URL}/Hiyori/hiyori.2048/texture_01.png`,
    ],
  };

  const load = useCallback(async () => {
    try {
      const [model, moc3, physics, ...textures] = await Promise.all([
        axios
          .get<ArrayBuffer>(MODEL_FILES.model3, { responseType: "arraybuffer" })
          .then((res) => res.data),
        axios
          .get(MODEL_FILES.moc3, { responseType: "arraybuffer" })
          .then((res) => res.data),
        axios
          .get(MODEL_FILES.physics3, { responseType: "arraybuffer" })
          .then((res) => res.data),
        ...MODEL_FILES.textures.map(async (texture) => {
          const res = await axios.get(texture, { responseType: "blob" });
          return res.data;
        }),
      ]);
      const { updatePoint } = await live2dRender(
        canvasRef.current!,
        model,
        {
          moc3,
          physics,
          textures,
        },
        {
          autoBlink: true,
          x: 0,
          y: 1,
          scale: 1,
        }
      );
      let point = new FacePoint();
      const _handleOnMouseMove = (e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;
        const rect = canvasRef.current!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = getDistance(x, y, cx, cy);
        const dx = cx - x;
        const dy = cy - y;
        const angle = getAngle(x, y, cx, cy);
        const r = (Math.cos(angle) * Math.sin(angle) * 180) / Math.PI;
        Object.assign(point, {
          angleX: -dx / 10,
          angleY: dy / 10,
          angleZ: r * (distance / cx),
          angleEyeX: -dx / cx,
          angleEyeY: dy / cy,
        });
        updatePoint(point);
      };
      document.body.addEventListener("mousemove", _handleOnMouseMove, false);
      console.debug("here");
    } catch (e) {
      console.error(e);
    }
  }, [
    MODEL_FILES.moc3,
    MODEL_FILES.model3,
    MODEL_FILES.physics3,
    MODEL_FILES.textures,
  ]);

  // const detectFace = async (network: MediaPipeFaceMesh) => {
  //   if (
  //     typeof cameraRef.current !== "undefined" &&
  //     cameraRef.current !== null &&
  //     cameraRef.current.video !== null &&
  //     cameraRef.current.video.readyState === 4
  //   ) {
  //     // Get Video Properties
  //     const video = cameraRef.current.video;
  //     const videoWidth = cameraRef.current.video.videoWidth;
  //     const videoHeight = cameraRef.current.video.videoHeight;

  //     // Set video width
  //     cameraRef.current.video.width = videoWidth;
  //     cameraRef.current.video.height = videoHeight;

  //     // Set canvas width
  //     if (canvas.current) {
  //       canvas.current.width = videoWidth;
  //       canvas.current.height = videoHeight;

  //       // Make Detections
  //       const faceEstimate = await network.estimateFaces({
  //         input: document.querySelector("video") as HTMLVideoElement,
  //       });
  //       console.log(faceEstimate);

  //       //Get canvas context
  //       const ctx = canvas.current.getContext("2d");
  //       drawMesh(faceEstimate, ctx);
  //     }
  //   }
  // };

  // const loadFacemesh = async () => {
  //   const network = await faceLandmarksDetection.load(
  //     faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  //   );
  //   detectFace(network);
  // };

  const video = document.getElementById("video") as HTMLVideoElement;
  const a = async () => {
    console.debug("here");
    if (cameraRef.current) {
      console.debug("heee");
      const inputSize = 512; // 認識対象のサイズ
      const scoreThreshold = 0.5; // 数値が高いほど精度が高くなる（〜0.9）
      // (2)オプション設定
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold,
      });
      // Webカメラ初期化
      const video = document.getElementById("video") as HTMLVideoElement;
      // (3)顔認識処理
      if (video) {
        const result = faceapi
          .detectFaceLandmarks(video)
          .then((r) => {
            console.debug(r);
            return r;
          })
          .catch(console.debug);
      }

      // const detection = await faceapi.detectSingleFace("video");
      // console.debug(detection);
    }
    // setTimeout(() => a(), 1000);
    // a();
  };

  useEffect(() => {
    // load();
    (async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models/";
      console.debug(MODEL_URL);
      // await changeFaceDetector(TinyFaceDetector);
      // await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      // Webカメラ初期化
      const video = document.getElementById("video") as HTMLVideoElement;
      // if (video) {
      const media = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            width: 640,
            height: 360,
            aspectRatio: 1.77,
            facingMode: "user",
          },
        })
        .then((stream) => {
          video.srcObject = stream;
          video.onloadeddata = () => {
            video.play();
          };
        })
        .catch((e) => {
          console.log(e);
        });
      // }
      await faceapi.nets.ssdMobilenetv1.load(MODEL_URL); // 精度の高い顔検出モデル
      await faceapi.nets.faceLandmark68Net.load(MODEL_URL);

      // const model = await faceLandmarksDetection.load(
      //   faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      // );
      // const predictions = await model.estimateFaces({
      //   input: document.querySelector("video") as HTMLVideoElement,
      // });
      // console.debug(predictions);
      // const faces = await model.estimateFaces({ input: video });
      a();
    })();
  }, []);

  const onPlay = () => {
    const message = document.getElementById("message");
    const inputSize = 512; // 認識対象のサイズ
    const scoreThreshold = 0.5; // 数値が高いほど精度が高くなる（〜0.9）
    // (2)オプション設定
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize,
      scoreThreshold,
    });
    const detectInterval = setInterval(async () => {
      // (3)顔認識処理
      const result = await faceapi.detectSingleFace(video, options);

      if (result) {
        console.debug("ok");
      } else {
        console.debug("ng");
      }
    }, 500);
  };
  return (
    <>
      <VideoInput cameraRef={cameraRef} />

      {/* <video id="video" autoPlay onLoadedMetadata={() => onPlay()}></video> */}
      {/* <AvatarCanvas canvasRef={canvasRef} /> */}
      <canvas
        ref={canvas}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 100,
          left: 0,
          right: 0,
          zIndex: 9,
          transform: "scaleX(-1)",
        }}
      />
    </>
  );
};
