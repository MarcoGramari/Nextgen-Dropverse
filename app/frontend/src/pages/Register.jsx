import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Página de cadastro com parental email opcional */
export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome:"", username:"", email:"", password:"", parental_email:"" });
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const { ok } = await register(form);
    if (ok) nav("/");
    else setErr("Erro ao registrar");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Criar conta</h2>
        <p className="muted">Vender e compartilhar criações digitais</p>
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit}>
          <input placeholder="Nome completo" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} required />
          <input placeholder="Usuário" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
          <input placeholder="E-mail" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
          <input placeholder="Senha" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
          <input placeholder="E-mail do responsável (opcional)" value={form.parental_email} onChange={e=>setForm({...form, parental_email:e.target.value})} />
          <button className="btn">Criar Conta</button>
        </form>
      </div>
    </div>
  );
}
