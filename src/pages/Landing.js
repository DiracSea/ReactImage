import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {

    // console.log("Rendering Landing component");
    
    return (
        <div>
        <h1>Welcome to the Application</h1>
        <p>
            <Link to="/login">Login</Link> or <Link to="/register">Register</Link>
        </p>
        </div>
    );
};

export default Landing;
