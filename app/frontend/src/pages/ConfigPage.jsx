// src/pages/SettingsPage.jsx
import React from "react";
import "../styles/Settings.css";

export default function SettingsPage() {
  return (
    <section className="page-settings">
      <h1>Configurações</h1>
      <div className="settings-grid">
        <div className="settings-card panel">
          <h3>Conta</h3>
          <p className="muted">Gerencie seu e-mail e senha</p>
        </div>
        <div className="settings-card panel">
          <h3>Preferências</h3>
          <p className="muted">Tema, notificações e privacidade</p>
        </div>
      </div>
    </section>
  );
}
