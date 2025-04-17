import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // ← à créer

export default function AuthPage() {
  const [signupData, setSignupData] = useState({
    login: '', password: '', lastname: '', firstname: '',
  });
  const [loginData, setLoginData] = useState({
    login: '', password: '',
  });

  const [signupMessage, setSignupMessage] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000';

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupMessage('');

    const res = await fetch(`${API_URL}/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });

    const json = await res.json();
    if (res.ok) {
      setSignupMessage("✅ Inscription réussie !");
      setSignupData({ login: '', password: '', lastname: '', firstname: '' });
    } else {
      setSignupMessage(`❌ ${json.message}`);
    }
  };

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
      localStorage.setItem('userId', json.userId);
      navigate('/profil');
    } else {
      setLoginMessage(`❌ ${json.message}`);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>📝 Inscription</h2>
        <input placeholder="Login" value={signupData.login} onChange={e => setSignupData({ ...signupData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
        <input placeholder="Nom" value={signupData.lastname} onChange={e => setSignupData({ ...signupData, lastname: e.target.value })} />
        <input placeholder="Prénom" value={signupData.firstname} onChange={e => setSignupData({ ...signupData, firstname: e.target.value })} />
        <button type="submit">S'inscrire</button>
        <p className="message">{signupMessage}</p>
      </form>

      <form className="auth-form" onSubmit={handleLogin}>
        <h2>🔐 Connexion</h2>
        <input placeholder="Login" value={loginData.login} onChange={e => setLoginData({ ...loginData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
        <button type="submit">Se connecter</button>
        <p className="message">{loginMessage}</p>
      </form>
    </div>
  );
}
