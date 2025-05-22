import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ValidationPage.css';

export default function ValidationPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/users/pending', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log('🛠️ Données reçues :', data);
        if (Array.isArray(data)) {
          setPendingUsers(data);
          setError('');
        } else {
          setError(data.message || 'Erreur inattendue');
        }
      })
      .catch(() => {
        setError('Erreur serveur');
      });
  }, [navigate]);

  const validateUser = async (userId) => {
    const token = localStorage.getItem('token');

    await fetch(`http://localhost:3000/users/validate/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    setPendingUsers(pendingUsers.filter(user => user._id !== userId));
  };

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

    <div className="validation-container">
      <h2>👮 Valider les utilisateurs</h2>

      {error ? (
        <p className="error-message">❌ {error}</p>
      ) : (
        pendingUsers.length > 0 ? (
          pendingUsers.map(user => (
            <div key={user._id} className="user-card">
              <p>{user.login} - {user.firstname} {user.lastname}</p>
              <button onClick={() => validateUser(user._id)}>✅ Valider l'inscription</button>
            </div>
          ))
        ) : (
          <p>Aucun utilisateur à valider.</p>
        )
      )}

      <button classname="back-button" onClick={() => navigate('/profil')} className="back-button">
        ⬅️ Retour au profil
      </button>
    </div>

    <button className="floating-create-button" onClick={() => navigate('/messages')}>
      +
    </button>
  </>
  );
}