import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SearchPanel.css";

export default function SearchPanel({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Buscar</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Digite sua busca..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit">Buscar</button>
        </form>
        <button className="close-btn" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
