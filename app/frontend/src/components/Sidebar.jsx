import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import CreatePostPopup from "./CreatePostPopup";
import SearchPanel from "./SearchPanel";
import "../styles/Sidebar.css";

export default function Sidebar({ onLogout }) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">


          <img src="/simplified.png" alt="Dropverse Logo" className="sidebar-logo" />
          <h3>DROPVERSE</h3>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/home" className="sidebar-link">
            <FaHome className="icon" /> <span className="text">Início</span>
          </NavLink>
          <NavLink to="/dashboard" className="sidebar-link">
            <FaChartBar className="icon" /> <span className="text">Dashboard</span>
          </NavLink>
          <NavLink to="/profile" className="sidebar-link">
            <FaUser className="icon" /> <span className="text">Perfil</span>
          </NavLink>
          <NavLink to="/settings" className="sidebar-link">
            <FaCog className="icon" /> <span className="text">Configurações</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => setShowSearch(true)}>
            <FaSearch className="icon" /> <span className="text">Buscar</span>
          </button>
          <button className="sidebar-link" onClick={() => setShowCreatePost(true)}>
            <FaPlus className="icon" /> <span className="text">Criar Post</span>
          </button>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> <span className="text">Sair</span>
          </button>
        </div>
      </aside>

      {showCreatePost && <CreatePostPopup onClose={() => setShowCreatePost(false)} />}
      {showSearch && <SearchPanel isOpen={showSearch} onClose={() => setShowSearch(false)} />}
    </>
  );
}
