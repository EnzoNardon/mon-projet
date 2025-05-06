import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';
import Logo from '../logo.png';

export default function AuthPage() {
  const [loginData, setLoginData] = useState({
    login: '', password: '',
  });
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');

    const res = await fetch(`${API_URL}/connexion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    const json = await res.json();
    if (res.ok && json.userId) {
      localStorage.setItem('token', json.token);
      console.log(json.token)
      localStorage.setItem('userId', json.userId);
      navigate('/profil');
    } else {
      setLoginMessage(`❌ ${json.message || "Erreur de connexion"}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
      </div>  
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Connexion</h2>
        <input placeholder="Nom d'utilisateur" value={loginData.login} onChange={e => setLoginData({ ...loginData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
        <button type="submit">Se connecter</button>
        <p className="message">{loginMessage}</p>
        <p className="auth-switch-link">
          Pas encore de compte ? <Link to="/signup">Inscrivez-vous</Link>
        </p>
      </form>
    </div>
  );
}
