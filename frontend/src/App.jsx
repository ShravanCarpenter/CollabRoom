import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import AboutUs from "./components/AboutUs/AboutUs";
import Features from "./components/Features/Features";
import Hero from "./components/Hero/Hero";
import ContactUs from "./components/Contact/ContactUs";
import Layout from "./components/Layout/Layout";
import Footer from "./components/Footer/Footer";
import ProfileUpdate from "./components/ProfilePage/ProfileUpdate";
import UpdatePassword from "./components/ProfilePage/UpdatePassword";
import CreateMeeting from './components/VideoConference/CreateMeeting';
import JoinMeeting from './components/VideoConference/JoinMeeting';
import MyMeetings from './components/VideoConference/MyMeetings';
import NewMeetingSetup from './components/VideoConference/NewMeetingSetup';
import JoinMeetingSetup from './components/VideoConference/JoinMeetingSetup';
import ProtectedRoute from './components/ProtectedRoute/';

import Whiteboard from "./components/StudyRoom/Whiteboard";
import ChatPage from "./components/ChatRoom/ChatPage";
import CreateRoom from "./components/ChatRoom/CreateRoom";
import JoinRoom from "./components/ChatRoom/JoinRoom";
import "./App.css";

function App() {
    return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/whiteboard"
                    element={
                        <ProtectedRoute>
                            <Whiteboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/update"
                    element={
                        <ProtectedRoute>
                            <ProfileUpdate />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/update-password"
                    element={
                        <ProtectedRoute>
                            <UpdatePassword />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <Layout>
                            <Header />
                            <Hero />
                            <Features />
                            <AboutUs />
                            <ContactUs />
                            <Footer />
                        </Layout>
                    }
                />

                <Route path="/create-meeting" element={<NewMeetingSetup />} />
                <Route path="/create-meeting/:meetingId" element={<CreateMeeting />} />
                <Route path="/join-meeting" element={<JoinMeetingSetup />} />
                <Route path="/join-meeting/:meetingId" element={<JoinMeeting />} />
                <Route path="/my-meetings" element={<MyMeetings />} />

                <Route path="/study-room" element={<Whiteboard />} />
                <Route path="/create-room" element={<CreateRoom />} />
                <Route path="/join-room" element={<JoinRoom />} />

                <Route path="/chat/:roomId" element={<ChatPage />} />
            </Routes>
    );
}

export default App;
