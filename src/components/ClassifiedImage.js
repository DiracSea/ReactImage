import React from "react";
import '../styles/ClassifiedImage.css';

const ClassifiedImage = ({ image, onConfirm, onCorrect }) => {
  return (
    <div className="classified-image">
      <img src={image.src} alt={image.alt} />
      <div className="label">{image.label}</div>
      <div className="buttons">
        <button className="confirm" onClick={onConfirm}>Confirm</button>
        <button className="correct" onClick={onCorrect}>Correct</button>
      </div>
    </div>
  );
};

export default ClassifiedImage;
