import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profil.css';
import logo from '../logo.png';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/profil/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Non autorisé');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        navigate('/');
      });
  }, [navigate]);

  if (!user) return <p>Chargement...</p>;

  return (
    <>
      <div className="header-bar">
        <Link to="/" className="header-icon">
          🏠
        </Link>
        <Link to="/profil" className="header-icon active">
          👤
        </Link>
      </div>

      <div className="profile-logo-container">
        <img src={logo} alt="Profile Logo" className="profile-logo" />
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-info">
            <p><strong>Nom d'utilisateur:</strong> {user.login}</p>
            <p><strong>Nom:</strong> {user.lastname}</p>
            <p><strong>Prénom:</strong> {user.firstname}</p>
          </div>
        </div>

        <div className="profile-buttons">
          <button onClick={() => navigate('/messages')}>📬 Mes messages</button>
          <button onClick={() => navigate('/')}>🏠 Accueil</button>
        </div>
      </div>
    </>
  );
}