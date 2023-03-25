import React, { useState, useEffect, useRef } from 'react';
import '../styles/Segment.css';
import { useNavigate } from "react-router-dom";

const Segment = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentLabel, setCurrentLabel] = useState("");
    const canvasRef = useRef(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(null);
    const [startY, setStartY] = useState(null);
    const [currentX, setCurrentX] = useState(null);
    const [currentY, setCurrentY] = useState(null);
    const [label, setLabel] = useState("");
    const [imageData, setImageData] = useState("");
    const [currentImage, setCurrentImage] = useState("");
    const navigate = useNavigate();

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
    };

    const handleMouseMove = (e) => {
        const ctx = canvasRef.current.getContext("2d");
        e.preventDefault();
        if (isMouseDown) {
            ctx.putImageData(imageData, 0, 0);
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;

            ctx.beginPath();
            ctx.rect(startX, startY, x-startX, y-startY);
            ctx.stroke();
            setCurrentX(x);
            setCurrentY(y);
            // setStartX(currentX);
            // setStartY(currentY);
        }
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // setSegments([]);
    };


    // fetch images when component mounts
    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch('http://localhost:5000/api/images');
                const data = await response.json();
                setImages(data.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchImages();
    }, []);

    // handle image selection
    const handleImageSelection = (event) => {
        setCurrentImage(event.target.value)
        const imageId = parseInt(event.target.value);
        setSelectedImage(images.find(image => image.id === imageId));
        // updateSegments([]);
    };

    const handleNoise = async () => {
        const formData = new FormData();
        formData.append("hash_id", selectedImage.id);
      
        try {
          const response = await fetch("http://localhost:5000/api/gaussian", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          const newImage = data.new_image;
          navigate("./", { state: { newImage } });
        } catch (error) {
          console.error(error);
        }
    };

    // handle label update
    const handleLabelUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('hash_id', selectedImage.id);
            formData.append('label', currentLabel);
            formData.append('segmentation_data', JSON.stringify({x1: startX, y1: startY, x2: currentX, y2: currentY}));

            const response = await fetch(`http://localhost:5000/update`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log(data);
            // update images with new label
            const updatedImages = images.map((image) => {
                if (image.hash_id === selectedImage.hash_id) {
                    return {
                        ...image,
                        label: data.label.name,
                        segmentation_data: data.segments,
                    };
                } else {
                    return image;
                }
            });
            setImages(updatedImages);
        } catch (error) {
            console.error(error);
        }
    };
    // const drawSegments = useCallback(() => {
    //     const ctx = canvasRef.current.getContext("2d");
    //     segments.forEach(([x1, y1, x2, y2, label]) => {
    //         ctx.beginPath();
    //         ctx.moveTo(x1, y1);
    //         ctx.lineTo(x2, y2);
    //         ctx.stroke();
    //     });
    // });

    useEffect(() => {
        let ctx = canvasRef?.current?.getContext("2d");
        if (!canvasRef.current || !ctx) {
            return;
        }
        const canvas = canvasRef.current;
        canvas.width = 400;
        canvas.height = 400;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        if (selectedImage) {
            const img = new Image();
            img.src = `http://localhost:5000/uploaded_images/${selectedImage.hash_id}.png`;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 400, 400);
                setImageData(ctx.getImageData(0, 0, 400, 400));
                // drawSegments();
            };
        } else {
            ctx.clearRect(0, 0, 400, 400);
        }; 
    }, [selectedImage]);// drawSegments

    return (
        <div className="segment-container">
            <h1>Segmentation and Labeling</h1>
            <div className="segment-select">
                {images && <select value = {currentImage} onChange={handleImageSelection}>
                    <option value="">Select an image to segment and label</option>
                    {images.map(image => (
                        <option key={image.id} value={image.id}>{image.local_name}</option>
                    ))}
                </select>}
            </div>
            {selectedImage && (
                <div className="segment-image">
                    <div className="canvas-container">
                    </div>
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
                    <button onClick={handleLabelUpdate}>Save Labels</button>
                    <button onClick={handleNoise}>Add Noise</button>
                </div>
            )}
        </div>
    );
};

export default Segment;
