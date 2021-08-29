import { useCallback, useEffect, useRef } from "react";
import WebCam from "react-webcam";
import { AvatarCanvas } from "../components/AvatarCanvas";
import { VideoInput } from "../components/VideoInput";
import { FacePoint } from "../lib/FacePoint";
import { live2dRender } from "../renderer";
import { getDistance, getAngle } from "../util/MathUtil";
import axios from "axios";

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

  return (
    <>
      {/* <VideoInput cameraRef={cameraRef} /> */}

      {/* <video id="video" autoPlay onLoadedMetadata={() => onPlay()}></video> */}
      <AvatarCanvas canvasRef={canvasRef} />
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
