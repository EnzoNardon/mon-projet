import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profil.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin')
    
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
      <div className="header-left">
        <span className="header-title">Organizz'Asso</span>
      </div>

      <div className="header-right">
        <button className="logout-button" onClick={() => navigate('/openforum')}>
          🌍 OpenForum
        </button>
        <button className="logout-button" onClick={() => navigate('/profil')}>
          👤 Mon profil
        </button>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          🚪 Déconnexion
        </button>
      </div>
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
        {isAdmin && (
          <button onClick={() => navigate('/validation')} className="back-button">
            👑 Gérer les validations
          </button>
        )}
      </div>
    </div>
  </>
  );
}