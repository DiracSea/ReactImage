import React from 'react';
import { useNavigate } from "react-router-dom";

const Upload = () => {
    const navigate = useNavigate();
    const handleFileChange = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        for (const file of event.target.files) {
            formData.append('image', file);
        }

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            // Handle response as needed
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form>
            <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} multiple />
            <button type="submit" onClick={() => {navigate("../segment")}}>Upload Images</button>
        </form>
    );
};

export default Upload;
