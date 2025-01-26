import React from 'react';
import { FaFileAlt, FaBook, FaVideo, FaComments, FaShare } from 'react-icons/fa';
import './Dashboard.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><FaFileAlt /><p>Document Editing</p></li>
        <li><FaBook /> <p>Study Room</p></li>
        <li><FaVideo /> <p>Video Conferencing</p></li>
        <li><FaComments /> <p>Massaging</p></li>
        <li><FaShare /> <p>Document Sharing</p></li>
      </ul>
    </div>
  );
};

export default Sidebar;
