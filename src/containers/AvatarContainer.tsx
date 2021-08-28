import { useRef } from "react";
import WebCam from "react-webcam";
import { AvatarCanvas } from "../components/AvatarCanvas";
import { VideoInput } from "../components/VideoInput";
export const AvatarContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<WebCam>(null);

  return (
    <>
      <VideoInput cameraRef={cameraRef} />
      <AvatarCanvas canvasRef={canvasRef} />
    </>
  );
};
