import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { BiRefresh, BiCopy } from "react-icons/bi";
import './JoinCreateRoom.css';

const JoinCreateRoom = ({ uuid, setUser, setRoomJoined }) => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name) return toast.dark("Please enter your name!");

    const userData = {
      roomId,
      userId: uuid(),
      userName: name,
      host: true,
      presenter: true,
    };

    localStorage.setItem('roomData', JSON.stringify(userData));
    setUser(userData);
    setRoomJoined(true);
    navigate('/whiteboard');
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinName) return toast.dark("Please enter your name!");
    if (!joinRoomId) return toast.dark("Please enter room ID!");

    const userData = {
      roomId: joinRoomId,
      userId: uuid(),
      userName: joinName,
      host: false,
      presenter: false,
    };

    localStorage.setItem('roomData', JSON.stringify(userData));
    setUser(userData);
    setRoomJoined(true);
    navigate('/whiteboard');
  };

  return (
    <>
      <div className="options-container">
        <div className="option-card">
          <h2>Create Room</h2>
          <p>Create a new room and invite others to join</p>
          <form onSubmit={handleCreateSubmit} className="room-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="room-id-container">
              <input
                type="text"
                value={roomId}
                readOnly
              />
              <button
                type="button"
                onClick={() => setRoomId(uuid())}
              >
                <BiRefresh size={20} />
              </button>
              <CopyToClipboard
                text={roomId}
                onCopy={() => toast.success("Room Id Copied!")}
              >
                <button type="button">
                  <BiCopy size={20} />
                </button>
              </CopyToClipboard>
            </div>
            <button type="submit" className="room-submit-btn">
              Create Room
            </button>
          </form>
        </div>

        <div className="option-card">
          <h2>Join Room</h2>
          <p>Join an existing room using a room ID</p>
          <form onSubmit={handleJoinSubmit} className="room-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <button type="submit" className="room-submit-btn">
              Join Room
            </button>
          </form>
        </div>
      </div>
      <p>
        <a href="/dashboard" className="back-to-dashboard">Back to Dashboard</a>
      </p>
    </>
  );
};

export default JoinCreateRoom;
