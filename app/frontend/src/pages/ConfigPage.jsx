import React, { useState } from "react";
import "../styles/Settings.css";

export default function Settings() {
  const [lang, setLang] = useState("pt");
  const [theme, setTheme] = useState("dark");

  return (
    <div className="settings-container">
      <h2>Configurações</h2>

      <div className="setting-box">
        <label>Idioma</label>
        <select value={lang} onChange={e => setLang(e.target.value)}>
          <option value="pt">Português</option>
          <option value="en">Inglês</option>
        </select>
      </div>

      <div className="setting-box">
        <label>Tema</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="dark">Escuro</option>
          <option value="light">Claro</option>
        </select>
      </div>

      <button className="save-btn">Salvar alterações</button>
    </div>
  );
}
