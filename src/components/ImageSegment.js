import React from "react";
import PropTypes from "prop-types";
import "../styles/ImageSegment.css";

const ImageSegment = ({ width, height, segments, updateSegments }) => {
  const canvasRef = React.useRef(null);
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [startX, setStartX] = React.useState(null);
  const [startY, setStartY] = React.useState(null);
  const [currentX, setCurrentX] = React.useState(null);
  const [currentY, setCurrentY] = React.useState(null);
  const [label, setLabel] = React.useState("");

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsMouseDown(true);
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setStartX(x);
    setStartY(y);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsMouseDown(false);
    updateSegments([...segments, [startX, startY, currentX, currentY, label]]);
    setLabel("");
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (isMouseDown) {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      setCurrentX(x);
      setCurrentY(y);
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      setStartX(currentX);
      setStartY(currentY);
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    updateSegments([]);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
  }, [width, height]);

  return (
    <div className="image-segment">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <input
        type="text"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <div className="toolbar">
        <button onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
};

ImageSegment.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  segments: PropTypes.array.isRequired,
  updateSegments: PropTypes.func.isRequired,
};

export default ImageSegment;
