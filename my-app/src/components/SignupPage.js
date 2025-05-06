import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignupPage.css';
import Logo from '../logo.png';

export default function SignupPage() {
  const [signupData, setSignupData] = useState({
    login: '', password: '', lastname: '', firstname: '',
  });

  const [signupMessage, setSignupMessage] = useState('');

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
      setSignupMessage("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
      setSignupData({ login: '', password: '', lastname: '', firstname: '' });
    } else {
      setSignupMessage(`❌ ${json.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
      </div>  
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Inscription</h2>
        <input placeholder="Nom d'utilisateur" value={signupData.login} onChange={e => setSignupData({ ...signupData, login: e.target.value })} />
        <input type="password" placeholder="Mot de passe" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
        <input placeholder="Nom" value={signupData.lastname} onChange={e => setSignupData({ ...signupData, lastname: e.target.value })} />
        <input placeholder="Prénom" value={signupData.firstname} onChange={e => setSignupData({ ...signupData, firstname: e.target.value })} />
        <button type="submit">S'inscrire</button>
        <p className="message">{signupMessage}</p>
        <p className="auth-switch-link">
          Vous avez déjà un compte ? <Link to="/">Connectez-vous</Link>
        </p>
      </form>
    </div>
  );
}
