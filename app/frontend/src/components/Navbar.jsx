// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import "../styles/Sidebar.css"; // optional external CSS

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    if (onLogout) onLogout();
    navigate("/");
  }

  const items = [
    { to: "/home", icon: <FaHome />, label: "Início" },
    { to: "/dashboard", icon: <FaChartBar />, label: "Dashboard" },
    { to: "/profile", icon: <FaUser />, label: "Perfil" },
    { to: "/settings", icon: <FaCog />, label: "Configurações" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">DROPVERSE</div>
      </div>

      <nav className="sidebar-menu">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`sidebar-item ${location.pathname.startsWith(it.to) ? "active" : ""}`}
          >
            <span className="icon">{it.icon}</span>
            <span className="label">{it.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Sair</span>
        </button>
        <div className="sidebar-footer">© 2025 Dropverse — Gramari</div>
      </div>
    </aside>
  );
}
