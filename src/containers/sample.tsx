import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { useCallback, useEffect, useRef } from "react";
import WebCam from "react-webcam";
import { AvatarCanvas } from "../components/AvatarCanvas";
import { VideoInput } from "../components/VideoInput";
import { FacePoint } from "../lib/FacePoint";
import { live2dRender } from "../renderer";
import { getDistance, getAngle } from "../util/MathUtil";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [updateP, setUpdatePoint] = useState<{
    updatePoint: (newPoint: Partial<FacePoint>) => void;
  }>({ updatePoint: (_) => {} });
  // const MODEL_FILES = {
  //   moc3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.moc3`,
  //   model3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.model3.json`,
  //   physics3: `${process.env.PUBLIC_URL}/Hiyori/hiyori.physics3.json`,
  //   textures: [
  //     `${process.env.PUBLIC_URL}/Hiyori/hiyori.2048/texture_00.png`,
  //     `${process.env.PUBLIC_URL}/Hiyori/hiyori.2048/texture_01.png`,
  //   ],
  // };
  const MODEL_FILES = {
    moc3: `${process.env.PUBLIC_URL}/Haruto/haruto.moc3`,
    model3: `${process.env.PUBLIC_URL}/Haruto/haruto.model3.json`,
    physics3: `${process.env.PUBLIC_URL}/Haruto/haruto.physics3.json`,
    textures: [
      `${process.env.PUBLIC_URL}/Haruto/haruto.2048/texture_00.png`,
      // `${process.env.PUBLIC_URL}/Haruto/haruto.2048/texture_01.png`,
    ],
  };
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
  let inter: NodeJS.Timeout;
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
      inter = setInterval(async () => {
        const detectionsWithExpressions = await faceapi
          .detectAllFaces(video!, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();
        //   .then((e) => {
        //     console.debug(e[0]?.landmarks.positions[0]?.x);
        //     return e;
        //   });
        let point = new FacePoint();
        if (detectionsWithExpressions[0]) {
          const pos = detectionsWithExpressions[0]?.landmarks.positions;
          const x = 0;
          const y = 0;
          const rect = canvasRef.current!.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = getDistance(x, y, cx, cy);
          const dx = cx - x;
          const dy = cy - y;
          const angle = getAngle(x, y, cx, cy);
          const r = (Math.cos(angle) * Math.sin(angle) * 180) / Math.PI;
          Object.assign(point, {
            ...point,
            angleX: -dx / 10,
            angleY: dy / 10,
            angleZ: r * (distance / cx),
            angleEyeX: -dx / cx,
            angleEyeY: dy / cy,
            faceR: pos[30].x - pos[3].x,
            faceL: pos[13].x - pos[30].x,
            vecR: [pos[0].x - pos[8].x, pos[0].y - pos[8].y],
            vecL: [pos[16].x - pos[8].x, pos[16].y - pos[8].y],
          } as FacePoint);
          if (updateP.updatePoint) {
            // console.debug("hhh");
            updateP.updatePoint(point);
          }
        }
        // console.log(detectionsWithExpressions);
      }, 50);
    }
  };

  const stop = () => {
    clearInterval(inter);
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
      // consoe
      setUpdatePoint({ updatePoint: updatePoint });

      // document.body.addEventListener("mousemove", _handleOnMouseMove, false);
    } catch (e) {
      console.error(e);
    }
  }, [
    MODEL_FILES.moc3,
    MODEL_FILES.model3,
    MODEL_FILES.physics3,
    MODEL_FILES.textures,
  ]);

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <main>
        <Webcam
          audio={false}
          ref={webcamRef}
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} />
        <AvatarCanvas canvasRef={canvasRef} />
        <button onClick={faceDetectHandler}>顔認識</button>
        <button onClick={stop}>停止</button>
      </main>
    </div>
  );
}
