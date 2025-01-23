import React from 'react';
import { FaBook, FaVideo, FaComments, FaFileAlt } from 'react-icons/fa';
import './Dashboard.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><FaBook /> <p>Study Room</p></li>
        <li><FaVideo /> <p>Meeting</p></li>
        <li><FaComments /> <p>Massaging</p></li>
        <li><FaFileAlt /> <p>Document Sharing</p></li>
      </ul>
    </div>
  );
};

export default Sidebar;
