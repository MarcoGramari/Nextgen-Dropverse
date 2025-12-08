import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "../styles/Settings.css";

export default function ConfigPage() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    nome: user?.nome || "",
    bio: user?.bio || "",
    avatar: user?.avatar || ""
  });
  const [accountData, setAccountData] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [privacyData, setPrivacyData] = useState({
    profileVisibility: "public" // or "private"
  });
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handlePrivacyChange = (e) => {
    setPrivacyData({ ...privacyData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationData({ ...notificationData, [name]: checked });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/user/update", profileData);
      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setMessage("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (accountData.newPassword !== accountData.confirmPassword) {
      setMessage("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      // Assuming backend has endpoint for password change
      await api.put("/user/change-password", {
        currentPassword: accountData.currentPassword,
        newPassword: accountData.newPassword
      });
      setMessage("Senha alterada com sucesso!");
      setAccountData({ ...accountData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      setMessage("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming backend has endpoint for privacy settings
      await api.put("/user/privacy", privacyData);
      setMessage("Configurações de privacidade atualizadas!");
    } catch (err) {
      console.error("Erro ao atualizar privacidade:", err);
      setMessage("Erro ao atualizar privacidade");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming backend has endpoint for notifications
      await api.put("/user/notifications", notificationData);
      setMessage("Preferências de notificação atualizadas!");
    } catch (err) {
      console.error("Erro ao atualizar notificações:", err);
      setMessage("Erro ao atualizar notificações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Configurações</h1>

      <div className="settings-section">
        <h2>Perfil</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              name="nome"
              value={profileData.nome}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Avatar URL:</label>
            <input
              type="url"
              name="avatar"
              value={profileData.avatar}
              onChange={handleProfileChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Perfil"}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>Gerenciamento de Conta</h2>
        <form onSubmit={handleAccountSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={accountData.email}
              onChange={handleAccountChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha Atual:</label>
            <input
              type="password"
              name="currentPassword"
              value={accountData.currentPassword}
              onChange={handleAccountChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nova Senha:</label>
            <input
              type="password"
              name="newPassword"
              value={accountData.newPassword}
              onChange={handleAccountChange}
            />
          </div>

          <div className="form-group">
            <label>Confirmar Nova Senha:</label>
            <input
              type="password"
              name="confirmPassword"
              value={accountData.confirmPassword}
              onChange={handleAccountChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Alterando..." : "Alterar Senha"}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>Privacidade</h2>
        <form onSubmit={handlePrivacySubmit}>
          <div className="form-group">
            <label>Visibilidade do Perfil:</label>
            <select name="profileVisibility" value={privacyData.profileVisibility} onChange={handlePrivacyChange}>
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Privacidade"}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>Notificações</h2>
        <form onSubmit={handleNotificationSubmit}>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={notificationData.emailNotifications}
                onChange={handleNotificationChange}
              />
              Receber notificações por email
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={notificationData.pushNotifications}
                onChange={handleNotificationChange}
              />
              Receber notificações push
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Notificações"}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>Conta</h2>
        <button onClick={logout} className="logout-btn">
          Sair
        </button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
