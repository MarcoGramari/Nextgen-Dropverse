import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/form.css";

/* Tela de login principal (home pública) */
export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    
    // Simulação de delay para visualização do loading (opcional)
    // await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const res = await login({ email, senha });

    if (res.ok) {
      nav("/home");
    } else {
      setErr("Erro ao autenticar. Verifique suas credenciais."); // Mensagem mais específica
    }
  }

  return (
    // O .auth-page centraliza todo o conteúdo na tela
    <div className="auth-page">
      
      {/* O .auth-card é o seu 'container quadradinho bonitinho' centralizado */}
      <div className="auth-card">

        {/* Removido auth- de h2 (ficou mais limpo) */}
        <h2>Bem-vindo ao Dropverse</h2>
        <p className="muted">Entre para acessar sua loja e feed</p>

        {err && <div className="error">{err}</div>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email" // Ajuda o navegador a preencher
          />

          <input
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            autoComplete="current-password" // Ajuda o navegador a preencher
          />

          {/* Usando a classe genérica .btn para o estilo futurista */}
          <button className="btn">Entrar</button> 
        </form>

        <div className="auth-links">
          <Link to="/register">Criar conta</Link>
        </div>

      </div>
    </div>
  );
}