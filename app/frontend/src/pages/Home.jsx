// src/pages/HomePage.jsx
import React from "react";
import "../styles/Home.css";

export default function HomePage() {
  return (
    <section className="page-home">
      <div className="home-hero panel">
        <div className="intro">
          <h1>Bem-vindo ao Dropverse</h1>
          <p className="muted">Venda e compartilhe suas criações digitais com a comunidade.</p>
        </div>
        <div className="cta">
          <button className="btn">Explorar</button>
        </div>
      </div>
    </section>
  );
}
