// src/pages/DashboardPage.jsx
import React from "react";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  return (
    <section className="page-dashboard">
      <h1>Dashboard</h1>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Visitas</h3>
          <p className="stat-value">1.248</p>
        </div>

        <div className="stat-card">
          <h3>Uploads</h3>
          <p className="stat-value">32</p>
        </div>

        <div className="stat-card">
          <h3>Usuários ativos</h3>
          <p className="stat-value">87</p>
        </div>
      </div>

      <div className="panel">
        <h2>Atividades recentes</h2>
        <div className="feed">
          <div className="post">Usuário @x fez upload de "Arte #12".</div>
          <div className="post">Nova assinatura aprovada.</div>
        </div>
      </div>
    </section>
  );
}
