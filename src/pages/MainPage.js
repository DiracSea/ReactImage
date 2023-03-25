import React from "react";
import { NavLink } from "react-router-dom";

const MainPage = () => {
  const pages = [
    { name: "Upload", path: "/upload"},
    { name: "Segment", path: "/segment" },
  ];
  
  return (
    <div>
      <h1>Welcome to the Image Processing App</h1>
      <p>Please select one of the following functionalities:</p>
      <ul>
        {pages.map((page) => (
          <li key={page.path}>
            <NavLink to={page.path}>{page.name}</NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainPage;
