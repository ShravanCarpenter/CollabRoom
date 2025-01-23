import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-main">
          <h1>Welcome to the CollabRoom Dashboard...</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
