// src/components/ui/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

/*
  Sidebar simples, fixa, acessível.
  Use NavLink para aplicar classe active automaticamente.
*/
export default function Sidebar() {
  const { logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const links = [
    { to: "/", label: "Início", icon: "🏠" },
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/profile", label: "Perfil", icon: "👤" },
    { to: "/settings", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="logo">D</div>
          <div className="brand-text">
            <strong>Dropverse</strong>
            <small>Agora — missão</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className="sidebar-link">
            <span className="icon" aria-hidden>{l.icon}</span>
            <span className="label">{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="btn signout" onClick={handleLogout}>
          ⎋ Sair
        </button>
        <div className="copy">© {new Date().getFullYear()} Dropverse</div>
      </div>
    </aside>
  );
}
