import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profil.css'; // ← on va créer ce fichier CSS

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
    <div className="profile-container">
      <h2>👤 Mon Profil</h2>
      <div className="profile-card">
        <p><strong>Login :</strong> {user.login}</p>
        <p><strong>Nom :</strong> {user.lastname}</p>
        <p><strong>Prénom :</strong> {user.firstname}</p>
      </div>

      <div className="profile-buttons">
        <button onClick={() => navigate('/messages')}>📬 Mes messages</button>
        <button onClick={() => navigate('/')}>🏠 Accueil</button>
      </div>
    </div>
  );
}
