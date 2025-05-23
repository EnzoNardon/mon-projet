import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ValidationPage.css';

export default function ValidationPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [currentAdmins, setCurrentAdmins] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/users/pending', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
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

    fetch('http://localhost:3000/users/admin-requests', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAdminRequests(data))
      .catch(() => console.error('Erreur admin-requests'));

    fetch('http://localhost:3000/users/admins', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const filteredAdmins = data.filter(admin => admin._id !== currentUserId);
        setCurrentAdmins(filteredAdmins);
      })
      .catch(() => console.error('Erreur current-admins'));
  }, [navigate]);

  const validateUser = async (userId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/users/validate/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingUsers(pendingUsers.filter(user => user._id !== userId));
  };

  const grantAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/users/grant-admin/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAdminRequests(adminRequests.filter(user => user._id !== userId));
  };

  const denyAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/users/deny-admin/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAdminRequests(adminRequests.filter(user => user._id !== userId));
  };

  const revokeAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/users/revoke-admin/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCurrentAdmins(currentAdmins.filter(admin => admin._id !== userId));
  };

  return (
    <>
      <div className="header-bar">
        <div className="header-left">
          <span className="header-title">Organizz'Asso</span>
        </div>

        <div className="header-right">
          {isAdmin && (
            <button className="logout-button" onClick={() => navigate('/closedforum')}>
              🔒 ClosedForum
            </button>
          )}
          <button className="logout-button" onClick={() => navigate('/openforum')}>
            🌍 OpenForum
          </button>
          <button
            className="logout-button"
            onClick={() => navigate(`/profil/${localStorage.getItem('userId')}`)}
          >
            👤 Mon profil
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className="validation-container">
        <h2 className="section-title">👮 Demandes d'inscriptions</h2>
        {error ? (
          <p className="error-message">❌ {error}</p>
        ) : (
          pendingUsers.length > 0 ? (
            pendingUsers.map(user => (
              <div key={user._id} className="user-card">
                <p>{user.login} - {user.firstname} {user.lastname}</p>
                <div className="user-card-buttons">
                  <button onClick={() => validateUser(user._id)}>✅ Valider l'inscription</button>
                  <button onClick={() => validateUser(user._id)}>❌ Refuser l'inscription</button>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun demande pour l'instant.</p>
          )
        )}

        <h2 className="section-title">🧑‍⚖️ Demandes d'administrateurs</h2>
        {adminRequests.length > 0 ? (
          adminRequests.map(user => (
            <div key={user._id} className="user-card">
              <p>{user.login} - {user.firstname} {user.lastname} Demande être administrateur.</p>
              <div className="user-card-buttons">
                <button onClick={() => grantAdmin(user._id)}>✅ Accepter</button>
                <button onClick={() => denyAdmin(user._id)}>❌ Refuser</button>
              </div>
            </div>
          ))
        ) : (
          <p>Aucun demande pour l'instant.</p>
        )}

        <h2 className="section-title">🛠️ Autres administrateurs</h2>
        {currentAdmins.length > 0 ? (
          currentAdmins.map(admin => (
            <div key={admin._id} className="user-card">
              <p>{admin.login} - {admin.firstname} {admin.lastname} (Admin)</p>
              <div className="user-card-buttons">
                <button onClick={() => revokeAdmin(admin._id)}>🚫 Retirer le rôle admin</button>
              </div>
            </div>
          ))
        ) : (
          <p>Vous êtes le seul administrateur actif.</p>
        )}

        <button
          className="back-button"
          onClick={() => navigate(`/profil/${localStorage.getItem('userId')}`)}
        >
          ⬅️ Retour au profil
        </button>
      </div>

      <button className="floating-create-button" onClick={() => navigate('/messages')}>
        +
      </button>
    </>
  );
}
