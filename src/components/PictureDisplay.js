import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/PictureDisplay.css";
import Segment from "./Segment";
import Canvas from "./Canvas";

const PictureDisplay = ({ src, width, height, segments }) => {
  const [updatedSegments, setUpdatedSegments] = useState([]);

  const handleSegmentsUpdate = (newSegments) => {
    setUpdatedSegments(newSegments);
  };

  const handleClearSegments = () => {
    setUpdatedSegments([]);
  };

  return (
    <div className="picture-display">
      <div className="image-container">
        <img src={src} alt="" width={width} height={height} />
        <Canvas
          width={width}
          height={height}
          segments={updatedSegments}
          onSegmentsUpdate={handleSegmentsUpdate}
        />
      </div>
      <Segment
        segments={segments}
        updatedSegments={updatedSegments}
        onClearSegments={handleClearSegments}
      />
    </div>
  );
};

PictureDisplay.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  segments: PropTypes.array.isRequired,
};

export default PictureDisplay;
