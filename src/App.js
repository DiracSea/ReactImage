// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import MainPage from './pages/MainPage';
import Upload from './pages/Upload';
import Segment from './pages/Segment';


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route exact path="/mainpage" element={<MainPage />} />
        <Route exact path="/upload" element={<Upload />} />
        <Route exact path="/segment" element={<Segment/>} />
      </Routes>
    </Router>
  );
};

export default App;
