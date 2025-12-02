import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginRegister.css";

export default function LoginRegister() {
  const containerRef = useRef(null);
  const nav = useNavigate();
  const { login, register } = useAuth();

  // Estados do login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // Estados do registro
  const [reg, setReg] = useState({
    nome: "",
    username: "",
    email: "",
    password: "",
    parental_email: ""
  });

  // Mensagens
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // refs para limpar timeouts caso o componente desmonte
  const errTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup timeouts on unmount
      if (errTimeoutRef.current) clearTimeout(errTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    // limpa mensagens anteriores
    setErr("");
    setSuccess("");

    try {
      const res = await login({ email: loginEmail, senha: loginSenha });

      if (res && res.ok) {
        // sucesso no login: navega
        nav("/home");
      } else {
        setErr("Credenciais inválidas.");
        if (errTimeoutRef.current) clearTimeout(errTimeoutRef.current);
        errTimeoutRef.current = setTimeout(() => setErr(""), 4000);
      }
    } catch (error) {
      setErr("Erro de rede. Tente novamente.");
      if (errTimeoutRef.current) clearTimeout(errTimeoutRef.current);
      errTimeoutRef.current = setTimeout(() => setErr(""), 4000);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    // limpa mensagens anteriores
    setErr("");
    setSuccess("");

    try {
      const res = await register(reg);

      if (res && res.ok) {
        setSuccess("Registro completo! Entrando...");
        // Auto-login after registration
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = setTimeout(async () => {
          // Attempt auto-login with same credentials
          const loginRes = await login({ email: reg.email, senha: reg.password });
          if (loginRes && loginRes.ok) {
            nav("/home");
          } else {
            setSuccess("");
            setErr("Registro bem-sucedido! Por favor, faça login manualmente.");
            if (containerRef.current) containerRef.current.classList.remove("right-panel-active");
          }
        }, 1500);
      } else {
        setErr(res && res.error ? (res.error.error || res.error) : "Erro ao registrar.");
        if (errTimeoutRef.current) clearTimeout(errTimeoutRef.current);
        errTimeoutRef.current = setTimeout(() => setErr(""), 4000);
      }
    } catch (error) {
      setErr("Erro de rede. Tente novamente.");
      if (errTimeoutRef.current) clearTimeout(errTimeoutRef.current);
      errTimeoutRef.current = setTimeout(() => setErr(""), 4000);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="container" id="container" ref={containerRef}>

        {/* ================= SIGN UP ================= */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Criar Conta</h1>
            <input
              placeholder="Nome completo"
              value={reg.nome}
              onChange={(e) => setReg({ ...reg, nome: e.target.value })}
              required
            />
            <input
              placeholder="Usuário"
              value={reg.username}
              onChange={(e) => setReg({ ...reg, username: e.target.value })}
              required
            />
            <input
              placeholder="E-mail"
              type="email"
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
              required
            />
            <input
              placeholder="Senha"
              type="password"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
              required
            />
            <input
              placeholder="E-mail do responsável (opcional)"
              value={reg.parental_email}
              onChange={(e) =>
                setReg({ ...reg, parental_email: e.target.value })
              }
            />

            <button type="submit">Registrar</button>
          </form>
        </div>

        {/* ================= LOGIN ================= */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Entrar</h1>

            <input
              type="email"
              placeholder="E-mail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              required
            />

            <button type="submit">Entrar</button>
          </form>
        </div>

        {/* =============== OVERLAY =============== */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Bem-vindo de volta!</h1>
              <p>Para continuar sua jornada, faça login</p>
              <button className="ghost" onClick={() => {
                if (containerRef.current) containerRef.current.classList.remove("right-panel-active");
              }}>
                Entrar
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Olá, Criador!</h1>
              <p>Comece sua jornada criativa no Dropverse</p>
              <button className="ghost" onClick={() => {
                if (containerRef.current) containerRef.current.classList.add("right-panel-active");
              }}>
                Criar Conta
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Mensagens aparecem dentro do card agora (CSS `.auth-error` e `.auth-success` cuidam da posição) */}
      {err && <div className="auth-error">{err}</div>}
      {success && <div className="auth-success">{success}</div>}
    </div>
  );
}
