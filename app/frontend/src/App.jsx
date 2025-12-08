// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/ConfigPage";
import { useAuth } from "./context/AuthContext";

/*
  App.jsx controla rotas públicas/protegidas.
  As rotas protegidas são filhas do Layout (Outlet).
*/
export default function App() {
  try {
    const { user, loading } = useAuth();
    const isLogged = !!user;

    console.log("App rendering - user:", user, "loading:", loading);

    // Show loading state while restoring from localStorage
    if (loading) {
      return <div style={{ height: "100vh", background: "#0b0c10", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px" }}>Loading...</div>;
    }

    if (!isLogged) {
      return <LoginRegister />;
    }

    return (
      <Routes>
        {/* Protected area with Layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="profile/:username?" element={<Profile />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    );
  } catch (err) {
    console.error("App error:", err);
    return <div style={{ color: "red", padding: "20px", background: "#0b0c10", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Error: {err.message}</div>;
  }
}
