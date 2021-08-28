interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const AvatarCanvas = ({ canvasRef }: Props) => {
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        margin: "auto",
        textAlign: "center",
        top: 200,
        left: 0,
        right: 0,
        zIndex: 9,
        height: "50vh",
        width: "50vw",
      }}
    />
  );
};
