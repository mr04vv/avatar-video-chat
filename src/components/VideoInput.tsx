import Webcam from "react-webcam";

interface Props {
  cameraRef: React.RefObject<Webcam>;
}

export const VideoInput = ({ cameraRef }: Props) => {
  return (
    <Webcam
      id="video"
      audio={false}
      ref={cameraRef}
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
  );
};
