import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Login from "./components/LoginRegister/Login";
import Register from "./components/LoginRegister/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import AboutUs from "./components/AboutUs/AboutUs";
import Features from "./components/Features/Features";
import Hero from "./components/Hero/Hero";
import ContactUs from "./components/Contact/ContactUs";
import Layout from "./components/Layout/Layout";
import Footer from "./components/Footer/Footer";
import "./App.css";

function App() {

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
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
      </Routes>
    </Router>
  );
}

export default App;
