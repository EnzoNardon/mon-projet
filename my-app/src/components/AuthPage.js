import React, { useState } from 'react';

export default function AuthPage() {
  const [signupData, setSignupData] = useState({
    login: '', password: '', lastname: '', firstname: '',
  });
  const [loginData, setLoginData] = useState({
    login: '', password: '',
  });

  const [signupMessage, setSignupMessage] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

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
    if (res.ok) {
      setLoginMessage(`✅ Connexion réussie ! ID : ${json.userId}`);
    } else {
      setLoginMessage(`❌ ${json.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '50px', padding: '40px', justifyContent: 'center' }}>
      {/* Inscription */}
      <form onSubmit={handleSignup} style={formStyle}>
        <h2>Inscription</h2>
        <input placeholder="Login" value={signupData.login} onChange={e => setSignupData({ ...signupData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
        <input placeholder="Nom" value={signupData.lastname} onChange={e => setSignupData({ ...signupData, lastname: e.target.value })} />
        <input placeholder="Prénom" value={signupData.firstname} onChange={e => setSignupData({ ...signupData, firstname: e.target.value })} />
        <button type="submit">S'inscrire</button>
        <p>{signupMessage}</p>
      </form>

      {/* Connexion */}
      <form onSubmit={handleLogin} style={formStyle}>
        <h2>Connexion</h2>
        <input placeholder="Login" value={loginData.login} onChange={e => setLoginData({ ...loginData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
        <button type="submit">Se connecter</button>
        <p>{loginMessage}</p>
      </form>
    </div>
  );
}

const formStyle = {
  background: '#fff',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 0 10px #ccc',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '300px'
};
