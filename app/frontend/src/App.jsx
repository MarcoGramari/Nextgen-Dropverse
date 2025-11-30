// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/ConfigPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  const isLogged = !!user;

  return (
    <>
      <Routes>
        <Route path="/" element={isLogged ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={isLogged ? <Navigate to="/home" /> : <Register />} />

        <Route element={isLogged ? <Layout /> : <Navigate to="/" />}>
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="profile/:username?" element={<Profile />} /> 
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={isLogged ? "/home" : "/"} />} />
      </Routes>
    </>
  );
}
