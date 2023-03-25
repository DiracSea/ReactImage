import React from "react";
import '../styles/FractionCorrect.css';

const FractionCorrect = ({ images, handleCorrect }) => {
  const numCorrect = images.filter((image) => image.correct).length;
  const fraction = numCorrect / images.length;

  return (
    <div className="fraction-correct">
      <h3>Fraction of Images Correct:</h3>
      <p>{`${numCorrect} / ${images.length} = ${fraction.toFixed(2)}`}</p>
      <button onClick={handleCorrect}>Submit</button>
    </div>
  );
};

export default FractionCorrect;
