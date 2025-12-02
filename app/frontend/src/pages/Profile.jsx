// src/pages/ProfilePage.jsx
import React from "react";
import "../styles/Profile.css";

export default function ProfilePage() {
  return (
    <section className="page-profile">
      <div className="profile-header panel">
        <div className="profile-avatar" />
        <div className="profile-info">
          <h2>Nome do Usuário</h2>
          <p className="muted">@usuario · Membro desde 2024</p>
        </div>
      </div>

      <div className="profile-section panel">
        <h3>Sobre</h3>
        <p>Artista digital, criador e membro da comunidade.</p>
      </div>
    </section>
  );
}
