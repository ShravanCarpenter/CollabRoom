import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import io from "socket.io-client";
import ClientRoom from "./ClientRoom";
import JoinCreateRoom from "./JoinCreateRoom";
import Room from "./Room";
import Sidebar from "./Sidebar";
import "./Whiteboard.css";

const server = "http://localhost:3000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const Whiteboard = () => {
  const [userNo, setUserNo] = useState(0);
  const [roomJoined, setRoomJoined] = useState(false);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);

  const uuid = () => {
    var S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  useEffect(() => {
    if (roomJoined) {
      socket.emit("user-joined", user);
    }
  }, [roomJoined]);

  useEffect(() => {
    // Initialize canvas context
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      contextRef.current = ctx;
      
      // Socket listeners for whiteboard
      socket.on("whiteboard-clear", clearWhiteboard);
      socket.on("whiteboard-draw", handleRemoteDraw);
      socket.on("whiteboard-state", setPaths);
      
      return () => {
        socket.off("whiteboard-clear");
        socket.off("whiteboard-draw");
        socket.off("whiteboard-state");
      };
    }
  }, [brushColor, brushSize]);
          
  const handleRemoteDraw = (newPath) => {
    setPaths(prev => [...prev, newPath]);
    drawPath(newPath);
  };

  const drawPath = (path) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;

    path.points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
    ctx.closePath();
  };

  const clearWhiteboard = () => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setPaths([]);
  };

  const handleDrawStart = (e) => {
    isDrawingRef.current = true;
    const { offsetX, offsetY } = getCanvasCoords(e);
    setCurrentPath([{ x: offsetX, y: offsetY }]);
    
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  };

  const handleDrawing = (e) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = getCanvasCoords(e);

    // Local drawing
    const ctx = contextRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    // Update path
    setCurrentPath(prev => [...prev, { x: offsetX, y: offsetY }]);
  };

  const handleDrawEnd = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // Send path to server
    const newPath = {
      points: currentPath,
      color: brushColor,
      size: brushSize
    };

    socket.emit("whiteboard-draw", newPath);
    setPaths(prev => [...prev, newPath]);
    setCurrentPath([]);
    
    const ctx = contextRef.current;
    ctx.closePath();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  return (
    <div className="home">
      <ToastContainer />
      {roomJoined ? (
        <>
          <Sidebar
            users={users}
            user={user}
            socket={socket}
            onClear={() => {
              clearWhiteboard();
              socket.emit("whiteboard-clear");
            }}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
          />

          <canvas
            ref={canvasRef}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawing}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            className="whiteboard-canvas"
          />

          {user.presenter ? (
            <Room
              userNo={userNo}
              user={user}
              socket={socket}
              setUsers={setUsers}
              setUserNo={setUserNo}
            />
          ) : (
            <ClientRoom
              userNo={userNo}
              user={user}
              socket={socket}
              setUsers={setUsers}
              setUserNo={setUserNo}
            />
          )}
        </>
      ) : (
        <JoinCreateRoom
          uuid={uuid}
          setRoomJoined={setRoomJoined}
          setUser={setUser}
        />
      )}
    </div>
  );
};

export default Whiteboard;
